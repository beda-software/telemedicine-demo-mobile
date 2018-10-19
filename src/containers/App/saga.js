import {
    AppState,
    Platform,
    PermissionsAndroid,
    AsyncStorage,
    NativeModules,
} from 'react-native';
import { delay } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select, race, fork, cancel } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import RNCallKit from 'react-native-callkit';
import uuid from 'uuid';
import storage from 'storage';

import {
    toggleVideoSend,
    setCallStatus,
    changeLocalVideoStream,
    changeRemoteVideoStream,
    resetCallState,
} from 'containers/Call/actions';
import { appDomain } from 'utils/request';
import { showModal } from 'containers/Modal/actions';
import {
    logout,
    initApp,
    deinitApp,
    savePushToken,
    saveApiToken,
    saveUsername,
    saveVoxImplantTokens,
    setAppInitializedStatus,
    makeCall,
    answerCall,
    endCall,
} from './actions';
import {
    selectPushToken,
    selectVoxImplantTokens,
    selectUsername,
    selectIsAppInitialized,
} from './selectors';
import {
    createPushTokenChannel,
    createPushNotificationChannel,
} from './pushnotification';
import {
    createCallChannel,
    createAppStateChangedChannel,
    createCallKitChannel,
    createIncomingCallChannel,
    createEndpointChannel,
} from './channels';

function* hasSession() {
    const [[, apiToken], [, accessToken], [, username]] =
        yield AsyncStorage.multiGet(['apiToken', 'accessToken', 'username']);

    return !!(username && accessToken && apiToken);
}

function* onLogout() {
    yield put(deinitApp());
    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

export function* reLoginVoxImplant() {
    const client = Voximplant.getInstance();

    const connectionState = yield client.getClientState();
    if (connectionState === Voximplant.ClientState.DISCONNECTED) {
        yield client.connect();
    }

    if (connectionState !== Voximplant.ClientState.LOGGED_IN) {
        const username = yield select(selectUsername);
        const fullUsername = `${username}@${appDomain}`;
        const { accessToken } = yield select(selectVoxImplantTokens);
        console.log(`reLoginVoxImplant: loginWithToken: user: ${username}, token: ${accessToken}`);

        const { tokens } = yield client.loginWithToken(fullUsername, accessToken);
        yield put(saveVoxImplantTokens(tokens));
    }
}

export function* requestPermissions(isVideo) {
    if (Platform.OS === 'android') {
        let permissions = [
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];
        if (isVideo) {
            permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
        const granted = yield PermissionsAndroid.requestMultiple(permissions);
        const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
        if (recordAudioGranted) {
            if (isVideo) {
                const cameraGranted = granted['android.permission.CAMERA'] === 'granted';

                if (!cameraGranted) {
                    throw new Error('Camera permission is not granted');
                }
            }
        } else {
            throw new Error('Record audio permission is not granted');
        }
    }

    return true;
}

function* onInitApp() {
    const incomingCallChannel = yield createIncomingCallChannel();
    const appStateChangedChannel = yield createAppStateChangedChannel();

    yield put(setAppInitializedStatus(true));

    yield takeEvery(incomingCallChannel, onIncomingCallReceived);
    yield takeEvery(appStateChangedChannel, onAppStateChanged);

    const pushTokenChannel = yield createPushTokenChannel();
    const { pushToken } = yield race({
        pushToken: take(pushTokenChannel),
        timeout: delay(3000),
    });
    if (pushToken) {
        yield put(savePushToken(pushToken));
        const client = Voximplant.getInstance();
        client.registerPushNotificationsToken(pushToken);
    } else {
        yield put(showModal('Cannot receive push token'));
    }
    pushTokenChannel.close();

    yield take(deinitApp);
    incomingCallChannel.close();
    appStateChangedChannel.close();
}

function* onDeinitApp() {
    const client = Voximplant.getInstance();
    try {
        yield client.disconnect();
    } catch (err) {
    }
    yield client.connect();

    const pushToken = yield select(selectPushToken);
    if (pushToken) {
        client.unregisterPushNotificationsToken(pushToken);
    }

    yield client.disconnect();
    yield put(setAppInitializedStatus(false));
    yield* clearSessionData();
}

function* initCallKit() {
    try {
        let options = {
            appName: 'TelemedicineDemo',
        };
        RNCallKit.setup(options);

        const channel = yield createCallKitChannel();

        // Wait until app will be initialized (login and etc.)
        yield take(initApp);

        yield takeEvery(channel, function* callKitEventHandler(event) {
            console.log(`CallKit event: ${event.name}`, event);
            switch (event.name) {
            case 'AnswerCall': {
                yield* onCallKitAnswerCall(event);
                break;
            }
            case 'EndCall': {
                yield* onCallKitEndCall(event);
                break;
            }
            case 'DidActivateAudioSession': {
                yield* onCallKitDidActivateAudioSession(event);
                break;
            }
            case 'DidDisplayIncomingCall': {
                yield* onCallKitDidDisplayIncomingCall(event);
                break;
            }
            case 'DidReceiveStartCallAction': {
                yield* onCallKitDidReceiveStartCallAction(event);
                break;
            }
            default:
                console.log(`Unhandled CallKit event ${event.name}`);
            }
        });
    } catch (err) {
        yield put(showModal(`CallKit setup error.\n${err.message}`));
    }
}

function* onCallKitAnswerCall() {
    Voximplant.Hardware.AudioDeviceManager.getInstance().callKitConfigureAudioSession();

    const isVideo = false;
    yield* onAnswerCall({ payload: { isVideo } });
}

function* onCallKitEndCall() {
    if (storage.activeCall) {
        yield put(endCall());
    }

    Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStopAudio();
    Voximplant.Hardware.AudioDeviceManager.getInstance().callKitReleaseAudioSession();
}

function onCallKitDidActivateAudioSession() {
    Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStartAudio();
}

function onCallKitDidDisplayIncomingCall() {
    storage.isCallKitWaitingForResponse = true;
}

function* onCallKitDidReceiveStartCallAction(event) {
    console.log('!!!onCallKitDidReceiveStartCallAction', event)
}

function* onAnswerCall({ payload: { isVideo } }) {
    try {
        const { activeCall } = storage;
        yield* requestPermissions(isVideo);
        yield put(NavigationActions.navigate({
            routeName: 'Call',
            params: {
                callId: storage.activeCall.callId,
                isVideo,
                isIncoming: true,
            },
        }));
        const callSettings = {
            video: {
                sendVideo: isVideo,
                receiveVideo: isVideo,
            },
        };
        activeCall.answer(callSettings);
    } catch (err) {
        yield put(showModal(`Incoming call failed:\n${err.message}`));
    }
}

function onEndCall() {
    const { activeCall } = storage;

    activeCall.hangup();
}

function* onCallConnected(isIncoming) {
    yield put(setCallStatus('connected'));
    if (!isIncoming) {
        if (Platform.OS === 'ios') {
            RNCallKit.reportConnectedOutgoingCallWithUUID(storage.activeCallKitId);
        }
    }
}

function* onCallFailed(reason) {
    yield put(showModal(`Call failed: ${reason}`));

    yield* onCallDisconnected();
}

function* onCallDisconnected() {
    yield all(storage.endpointsTasks.map((task) => cancel(task)));

    storage.endpointsTasks = [];
    storage.activeCall = null;
    yield put(NavigationActions.navigate({ routeName: 'App' }));

    if (Platform.OS === 'ios') {
        RNCallKit.endCall(storage.activeCallKitId);
        storage.activeCallKitId = null;
    }
}

function* onEndpointAdded(endpoint) {
    const channel = yield createEndpointChannel(endpoint);
    try {
        while (true) {
            const event = yield take(channel);
            console.log(`Endpoint event: ${event.name}`, event);

            switch (event.name) {
            case Voximplant.EndpointEvents.RemoteVideoStreamAdded: {
                yield put(changeRemoteVideoStream(event.videoStream));
                break;
            }
            case Voximplant.EndpointEvents.RemoteVideoStreamRemoved: {
                yield put(changeRemoteVideoStream(null));
                break;
            }
            default:
                console.log(`Unhandled endpoint event ${event.name}`);
            }
        }
    } finally {
    }
}

function* subscribeToCallEvents(newCall, isIncoming) {
    const channel = yield createCallChannel(newCall);

    yield takeEvery(channel, function* onCallEvent(event) {
        console.log(`Call event: ${event.name}`, event);
        switch (event.name) {
        case Voximplant.CallEvents.Connected: {
            yield* onCallConnected(isIncoming);
            break;
        }
        case Voximplant.CallEvents.Failed: {
            yield* onCallFailed(event.reason);
            break;
        }
        case Voximplant.CallEvents.Disconnected: {
            yield* onCallDisconnected();
            break;
        }
        case Voximplant.CallEvents.LocalVideoStreamAdded: {
            yield put(changeLocalVideoStream(event.videoStream));
            break;
        }
        case Voximplant.CallEvents.LocalVideoStreamRemoved: {
            yield put(changeLocalVideoStream(null));
            break;
        }
        case Voximplant.CallEvents.EndpointAdded: {
            const task = yield fork(onEndpointAdded, event.endpoint);
            storage.endpointsTasks.push(task);
            break;
        }
        default:
            console.log(`Unhandled call event ${event.name}`);
        }
    });
}

function* onIncomingCallReceived(newCall) {
    const { activeCall } = storage;
    if (activeCall && activeCall.id !== newCall.id) {
        newCall.decline();
        yield put(showModal('You\'ve received one another call, but we declined it.'));
    } else {
        storage.activeCall = newCall;
        yield* initIncomingCall(newCall, false);
        yield put(NavigationActions.navigate({
            routeName: 'IncomingCall',
            params: {
                callId: newCall.callId,
            },
        }));
        if (Platform.OS === 'ios') {
            storage.activeCallKitId = uuid.v4();
            RNCallKit.displayIncomingCall(storage.activeCallKitId, 'who calling', 'number', false);
        } else {
            if (AppState.currentState !== 'active') {
                NativeModules.ActivityLauncher.openMainActivity();
            }
        }
    }
}

function* onMakeCall({ payload }) {
    const { contactUsername, isVideo = false } = payload;
    try {
        yield requestPermissions(isVideo);
        const callSettings = {
            video: {
                sendVideo: isVideo,
                receiveVideo: isVideo,
            },
        };
        const newCall = yield Voximplant.getInstance().call(contactUsername, callSettings);
        yield* initOutgoingCall(newCall, isVideo);
    } catch (err) {
        yield put(showModal(`Outgoing call failed.\n${err.message}`));
    }
}

function* initCall(newCall, isVideo, isIncoming) {
    yield fork(subscribeToCallEvents, newCall, isIncoming);
    yield put(resetCallState());
    yield put(toggleVideoSend(isVideo));
}

function* initIncomingCall(newCall, isVideo) {
    yield* initCall(newCall, isVideo, true);

    yield put(setCallStatus('connected'));
}

function* initOutgoingCall(newCall, isVideo) {
    storage.activeCall = newCall;
    yield put(NavigationActions.navigate({
        routeName: 'Call',
        params: {
            callId: newCall.callId,
            isVideo,
            isIncoming: false,
        },
    }));

    if (Platform.OS === 'ios') {
        storage.activeCallKitId = uuid.v4();
        RNCallKit.startCall(storage.activeCallKitId, 'who calling', 'number', isVideo);
    }

    yield* initCall(newCall, isVideo, false);
    yield put(setCallStatus('connecting'));

}

function* initPushNotifications() {
    const channel = yield createPushNotificationChannel();

    // Wait until app will be initialized (login and etc.)
    yield take(initApp);

    yield takeEvery(channel, onPushNotificationReceived);
}

function* onPushNotificationReceived(notification) {
    console.log('New notification', notification);

    try {
        yield* reLoginVoxImplant();
        const client = Voximplant.getInstance();
        client.handlePushNotification({ voximplant: notification.voximplant });
    } catch (err) {
        yield put(showModal(`Can not handle push notification.\n${err.message}`));
    }
}

function* bootstrap() {
    if (Platform.OS === 'ios') {
        yield fork(initCallKit);
    }

    yield fork(initPushNotifications);

    if (yield* restoreSessionData()) {
        yield put(NavigationActions.navigate({ routeName: 'App' }));

        try {
            yield* reLoginVoxImplant();
            // TODO: isAppInitialized is always false??? I'm not sure
            const isAppInitialized = yield select(selectIsAppInitialized);
            if (!isAppInitialized) {
                yield put(initApp());
            }
        } catch (err) {
            yield put(showModal(`Can not bootstrap.\n${err.message}`));
        }
    } else {
        yield put(NavigationActions.navigate({ routeName: 'Login' }));
    }
}

function* onAppStateChanged(appState) {
    console.log(`Current app state changed to ${appState}`);

    if (appState === 'active') {
        if (yield* hasSession()) {
            try {
                yield* reLoginVoxImplant();
            } catch (err) {
                yield put(showModal(`Can not relogin.\n${err.message}`));
            }
        }
    }
}

function* restoreSessionData() {
    const [[, apiToken], [, accessToken], [, username]] = yield AsyncStorage.multiGet(
        ['apiToken', 'accessToken', 'username']
    );

    if (apiToken && accessToken && username) {
        yield put(saveApiToken(apiToken));
        yield put(saveVoxImplantTokens({ accessToken }));
        yield put(saveUsername(username));

        return true;
    }

    return false;
}

function* clearSessionData() {
    yield AsyncStorage.multiRemove(['apiToken', 'accessToken', 'username']);
}

function* onSaveVoxImplantTokens({ payload: { voxImplantTokens } }) {
    console.log('set accessToken', voxImplantTokens.accessToken);

    yield AsyncStorage.setItem('accessToken', voxImplantTokens.accessToken);
}

function* onSaveApiToken({ payload: { apiToken } }) {
    console.log('set apiToken', apiToken);

    yield AsyncStorage.setItem('apiToken', apiToken);
}

function* onSaveUsername({ payload: { username } }) {
    console.log('set username', username);

    yield AsyncStorage.setItem('username', username);
}

export default function* appSaga() {
    yield all([
        takeLatest(logout, onLogout),
        takeLatest(initApp, onInitApp),
        takeLatest(deinitApp, onDeinitApp),

        takeLatest(answerCall, onAnswerCall),
        takeLatest(endCall, onEndCall),
        takeLatest(makeCall, onMakeCall),

        // TODO: get rid of these functions, call them directly and don't save it to store!
        takeEvery(saveApiToken, onSaveApiToken),
        takeEvery(saveVoxImplantTokens, onSaveVoxImplantTokens),
        takeEvery(saveUsername, onSaveUsername),

        fork(bootstrap),
    ]);
}

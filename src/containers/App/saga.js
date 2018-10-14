import { AppState, Platform, PermissionsAndroid } from 'react-native';
import { eventChannel, delay } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select, race, fork } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import DefaultPreference from 'react-native-default-preference';

import { appDomain } from 'utils/request';
import { showModal } from 'containers/Modal/actions';
import {
    logout,
    initApp,
    deinitApp,
    setActiveCall,
    savePushToken,
    saveApiToken,
    saveUsername,
    saveVoxImplantTokens,
    setAppInitializedStatus,

    pushNotificationReceived,
    incomingCallReceived,
    appStateChanged,
} from './actions';
import {
    selectActiveCall,
    selectPushToken,
    selectVoxImplantTokens,
    selectUsername,
    selectAppState,
    selectIsAppInitialized,
} from './selectors';
import {
    createPushTokenChannel,
    createPushNotificationChannel,
    showLocalNotification,
} from './pushnotification';

function* isAuthenticated() {
    const username = yield DefaultPreference.get('username');
    const accessToken = yield DefaultPreference.get('accessToken');

    return !!(username && accessToken);
}

function* onLogout() {
    yield put(deinitApp());
    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

export function* reLogin() {
    const client = Voximplant.getInstance();

    try {
        const connectionState = yield client.getClientState();
        if (connectionState === Voximplant.ClientState.DISCONNECTED) {
            yield client.connect();
        }

        if (connectionState !== Voximplant.ClientState.LOGGED_IN) {
            const username = yield select(selectUsername);
            const fullUsername = `${username}@${appDomain}`;
            const { accessToken } = yield select(selectVoxImplantTokens);
            console.log('reLogin: loginWithToken: user: ' + username + ', token: ' + accessToken);

            const { tokens } = yield client.loginWithToken(fullUsername, accessToken);
            yield put(saveVoxImplantTokens(tokens));
        }
    } catch (err) {
        yield put(showModal(`Cannot re-login:\n${err.message}`));
        throw err;
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

export function createCallChannel(activeCall) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
        };

        Object.keys(Voximplant.CallEvents)
            .forEach((eventName) => activeCall.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.CallEvents)
                .forEach((eventName) => activeCall.off(eventName, handler));
        };
    });
}

function createIncomingCallChannel() {
    const client = Voximplant.getInstance();

    return eventChannel((emit) => {
        const incomingCallHandler = (event) => {
            emit(event.call);
        };
        client.on(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);

        return () => {
            client.off(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);
        };
    });
}

function createAppStateChangedChannel() {
    return eventChannel((emit) => {
        const handler = (newState) => {
            emit(newState);
        };
        AppState.addEventListener('change', handler);

        return () => {
            AppState.removeEventListener('change', handler);
        };
    });
}

function* onInitApp() {
    const pushNotificationChannel = yield createPushNotificationChannel();
    const incomingCallChannel = yield createIncomingCallChannel();
    const appStateChangedChannel = yield createAppStateChangedChannel();

    yield put(setAppInitializedStatus(true));

    yield takeEvery(pushNotificationChannel, function* pushNotificationReceivedHandler(notification) {
        yield put(pushNotificationReceived(notification));
    });
    yield takeEvery(incomingCallChannel, function* incomingCallReceivedHandler(newIncomingCall) {
        yield put(incomingCallReceived(newIncomingCall));
    });
    yield takeEvery(appStateChangedChannel, function* appStateChangedHandler(newState) {
        yield put(appStateChanged(newState));
    });

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
    pushNotificationChannel.close();
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

function* onIncomingCallReceived({ payload }) {
    const { call } = payload;
    const activeCall = yield select(selectActiveCall);
    if (activeCall && activeCall.id !== call.id) {
        call.decline();
        yield put(showModal('You\'ve received one another call, but we declined it.'));
    } else {
        yield put(setActiveCall(call));
        yield put(NavigationActions.navigate({
            routeName: 'IncomingCall',
            params: {
                callId: call.callId,
            },
        }));

        const appState = yield select(selectAppState);
        if (appState !== 'active') {
            showLocalNotification('');
        }
    }
}

function* onPushNotificationReceived({ payload: { notification } }) {
    console.log('New notification', notification);

    yield* reLogin();
    const client = Voximplant.getInstance();
    client.handlePushNotification({ voximplant: notification.voximplant });
}

function* onAppStateChanged({ payload: { appState } }) {
    console.log('Current app state changed to ' + appState);

    if (appState === 'active') {
        if (yield isAuthenticated()) {
            yield* reLogin();
        }
    }
}

function* restoreSessionData() {
    const apiToken = yield DefaultPreference.get('apiToken');
    const accessToken = yield DefaultPreference.get('accessToken');
    const username = yield DefaultPreference.get('username');

    yield put(saveApiToken(apiToken));
    yield put(saveVoxImplantTokens({ accessToken }));
    yield put(saveUsername(username));
}

function* clearSessionData() {
    // TODO: use clearMultiple
    yield DefaultPreference.clear('apiToken');
    yield DefaultPreference.clear('accessToken');
    yield DefaultPreference.clear('username');
}

function* init() {
    if (yield isAuthenticated()) {
        yield* restoreSessionData();
        yield* reLogin();
        const isAppInitialized = yield select(selectIsAppInitialized);
        if (!isAppInitialized) {
            yield put(initApp());
            // TODO: check that current routeName is Login
            yield put(NavigationActions.navigate({ routeName: 'App' }));
        }
    }
}

function* onSaveVoxImplantTokens({ payload: { voxImplantTokens } }) {
    console.log('set accessToken', voxImplantTokens.accessToken);

    yield DefaultPreference.set('accessToken', voxImplantTokens.accessToken);
}

function* onSaveApiToken({ payload: { apiToken } }) {
    console.log('set apiToken', apiToken);

    yield DefaultPreference.set('apiToken', apiToken);
}

function* onSaveUsername({ payload: { username } }) {
    console.log('set username', username);

    yield DefaultPreference.set('username', username);
}

export default function* appSaga() {
    yield all([
        takeLatest(logout, onLogout),
        takeLatest(initApp, onInitApp),
        takeLatest(deinitApp, onDeinitApp),

        takeEvery(incomingCallReceived, onIncomingCallReceived),
        takeEvery(appStateChanged, onAppStateChanged),
        takeEvery(pushNotificationReceived, onPushNotificationReceived),
        takeEvery(saveApiToken, onSaveApiToken),
        takeEvery(saveVoxImplantTokens, onSaveVoxImplantTokens),
        takeEvery(saveUsername, onSaveUsername),
        fork(init),
    ]);
}

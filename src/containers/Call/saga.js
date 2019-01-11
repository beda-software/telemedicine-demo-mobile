import { AppState, Platform, NativeModules, PermissionsAndroid } from 'react-native';
import { all, takeLatest, takeEvery, take, put, fork, cancel } from 'redux-saga/effects';
import { Navigation } from 'react-native-navigation';
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
import { saveCallerDisplayName } from 'containers/IncomingCall/actions';
import { showModal } from 'containers/Modal/actions';
import {
    changeDevice,
    changeDeviceList,
    setAudioDevice,
    toggleAudioDeviceSelector,
    toggleAudioMute,
    makeOutgoingCall,
    answerCall,
    endCall,
} from './actions';
import {
    createIncomingCallChannel,
    createCallChannel,
    createCallKitChannel,
    createEndpointChannel,
    createAudioDeviceChannel,
} from './channels';

export function* requestPermissions(isVideo) {
    if (Platform.OS === 'android') {
        let permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
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

function* initCallKit() {
    try {
        RNCallKit.setup({
            appName: 'TelemedicineDemo',
        });

        const channel = yield createCallKitChannel();

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

    yield* onAnswerCall({ payload: { isVideo: false } });
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

function onCallKitDidReceiveStartCallAction(event) {
    console.log('onCallKitDidReceiveStartCallAction called but not handled', event);
}

function* onAnswerCall({ payload: { isVideo } }) {
    try {
        const { activeCall } = storage;
        yield* requestPermissions(isVideo);
        yield Navigation.push('root', {
            component: {
                name: 'td.Call',
                passProps: {
                    callId: storage.activeCall.callId,
                    isVideo,
                    isIncoming: true,
                },
            },
        });

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

    yield Navigation.popToRoot('root');

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

    try {
        while (true) {
            const event = yield take(channel);

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
        }
    } finally {
    }
}

function* initCall(newCall, isVideo, isIncoming) {
    yield fork(subscribeToCallEvents, newCall, isIncoming);
    yield put(resetCallState());
    yield put(toggleVideoSend(isVideo));
}

function* onIncomingCallReceived(newCall) {
    const { activeCall } = storage;
    if (activeCall && activeCall.id !== newCall.id) {
        newCall.decline();
        yield put(showModal("You've received one another call, but we declined it."));
    } else {
        storage.activeCall = newCall;
        yield* initCall(newCall, false, true);
        yield put(setCallStatus('connected'));
        const callerDisplayName = newCall.getEndpoints()[0].displayName;
        yield put(saveCallerDisplayName(callerDisplayName));

        yield Navigation.push('root', {
            component: {
                name: 'td.IncomingCall',
                passProps: {
                    callId: newCall.callId,
                },
            },
        });

        if (Platform.OS === 'ios') {
            storage.activeCallKitId = uuid.v4();
            RNCallKit.displayIncomingCall(storage.activeCallKitId, callerDisplayName, 'number', false);
        } else {
            if (AppState.currentState !== 'active') {
                NativeModules.ActivityLauncher.openMainActivity();
            }
        }
    }
}

function* onOutgoingCall({ payload }) {
    const { contact, isVideo = false } = payload;
    try {
        yield requestPermissions(isVideo);
        const callSettings = {
            video: {
                sendVideo: isVideo,
                receiveVideo: isVideo,
            },
        };
        const newCall = yield Voximplant.getInstance().call(contact.username, callSettings);
        storage.activeCall = newCall;

        yield Navigation.push('root', {
            component: {
                name: 'td.Call',
                passProps: {
                    callId: newCall.callId,
                    isVideo,
                    isIncoming: false,
                },
            },
        });

        if (Platform.OS === 'ios') {
            storage.activeCallKitId = uuid.v4();
            RNCallKit.startCall(storage.activeCallKitId, contact.displayName, 'number', isVideo);
        }

        yield* initCall(newCall, isVideo, false);
        yield put(setCallStatus('connecting'));
    } catch (err) {
        yield put(showModal(`Outgoing call failed.\n${err.message}`));
    }
}

function* subscribeToAudioDeviceEvents() {
    const channel = createAudioDeviceChannel();

    yield takeEvery(channel, function* onCallEvent(event) {
        console.log(`Device event: ${event.name}`, event);

        switch (event.name) {
            case Voximplant.Hardware.AudioDeviceEvents.DeviceChanged: {
                yield put(changeDevice(event.currentDevice));
                break;
            }
            case Voximplant.Hardware.AudioDeviceEvents.DeviceListChanged: {
                yield put(changeDeviceList(event.newDeviceList));
                break;
            }
            default:
                console.log(`Unhandled audio device event ${event.name}`);
        }
    });
}

function* onToggleAudioDeviceSelector({ payload: { isAudioDeviceSelectorVisible } }) {
    if (isAudioDeviceSelectorVisible) {
        const devices = yield Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices();
        yield put(changeDeviceList(devices));
    }
}

function* onSetAudioDevice({ payload: { device } }) {
    Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device);
    yield put(toggleAudioDeviceSelector(false));
}

function* onToggleAudioMute({ payload: { isAudioMuted } }) {
    yield storage.activeCall.sendAudio(!isAudioMuted);
}

function* onToggleVideoSend({ payload: { isVideoBeingSent } }) {
    try {
        yield requestPermissions();
        yield storage.activeCall.sendVideo(isVideoBeingSent);
    } catch (err) {
        put(showModal(`Failed to send video:\n${err.message}`));
    }
}

function* bootstrapCall() {
    if (Platform.OS === 'ios') {
        yield fork(initCallKit);
    }
    yield fork(subscribeToAudioDeviceEvents);

    const incomingCallChannel = yield createIncomingCallChannel();
    yield takeEvery(incomingCallChannel, onIncomingCallReceived);
}

export default function* callSaga() {
    yield all([
        takeLatest(answerCall, onAnswerCall),
        takeLatest(endCall, onEndCall),
        takeLatest(makeOutgoingCall, onOutgoingCall),
        takeLatest(toggleAudioDeviceSelector, onToggleAudioDeviceSelector),
        takeLatest(setAudioDevice, onSetAudioDevice),
        takeLatest(toggleAudioMute, onToggleAudioMute),
        takeLatest(toggleVideoSend, onToggleVideoSend),

        fork(bootstrapCall),
    ]);
}

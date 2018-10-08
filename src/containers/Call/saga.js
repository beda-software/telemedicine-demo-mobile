import { Voximplant } from 'react-native-voximplant';
import { NavigationActions } from 'react-navigation';
import { eventChannel } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select } from 'redux-saga/effects';
import { makeSelectActiveCall } from 'containers/App/selectors';
import { setActiveCall, showModal } from 'containers/App/actions';

import {
    SUBSCRIBE_TO_CALL_EVENTS,
    SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS,
    UNSUBSCRIBE_FROM_CALL_EVENTS,
    UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS,
    TOGGLE_AUDIO_MUTE,
    TOGGLE_VIDEO_SEND,
    HOLD,
    RECEIVE_VIDEO,
    END_CALL,
    SWITCH_AUDIO_DEVICE,
    SELECT_AUDIO_DEVICE,

    CALL_FAILED,
    CALL_DISCONNECTED,
    ENDPOINT_ADDED,
    ENDPOINT_REMOVED,
} from './constants';
import {
    callFailed,
    callDisconnected,
    callLocalVideoStreamChanged,
    endpointAdded,
    endpointRemoved,
    endpointRemoveVideoStreamChanged,

    deviceChanged,
    deviceListChanged,
} from './actions';


function* onCallFailed({ reason }) {
    yield put(setActiveCall(null));
    yield put(showModal(`Call failed: ${reason}`));
}

function* onCallDisconnected() {
    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}


function createEndpointChannel(endpoint) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event.name, event);
        };

        Object.keys(Voximplant.EndpointEvents)
            .forEach((eventName) => endpoint.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.EndpointEvents)
                .forEach((eventName) => endpoint.off(eventName, handler));
        };
    });
}

function* onEndpointAdded({ endpoint }) {
    const channel = createEndpointChannel();

    yield takeEvery(endpoint, function* onEndpointEvent(eventName, event) {
        switch (eventName) {
        case Voximplant.EndpointEvents.Removed: {
            yield put(endpointRemoved(event.endpoint));
            break;
        }
        case Voximplant.EndpointEvents.RemoteVideoStreamAdded: {
            yield put(endpointRemoveVideoStreamChanged(event.videoStream));
            break;
        }
        case Voximplant.EndpointEvents.RemoteVideoStreamRemoved: {
            yield put(endpointRemoveVideoStreamChanged(null));
            break;
        }
        default:
            console.log(`Unhandled endpoint event ${eventName}`);
        }
    });

    while (true) {
        const targetEndpoint = yield take(ENDPOINT_REMOVED);
        if (targetEndpoint.id === endpoint.id) {
            channel.close();
            break;
        }
    }
}

function createCallChannel(activeCall) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event.name, event);
        };

        Object.keys(Voximplant.CallEvents)
            .forEach((eventName) => activeCall.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.CallEvents)
                .forEach((eventName) => activeCall.off(eventName, handler));
        };
    });
}

export function* onSubscribeToCallEvents({ call: activeCall }) {
    const channel = createCallChannel(activeCall);

    yield takeEvery(channel, function* onCallEvent(eventName, event) {
        switch (eventName) {
        case Voximplant.CallEvents.Failed: {
            yield put(callFailed());
            break;
        }
        case Voximplant.CallEvents.Disconnected: {
            yield put(callDisconnected());
            break;
        }
        case Voximplant.CallEvents.LocalVideoStreamAdded: {
            yield put(callLocalVideoStreamChanged(event.videoStream));
            break;
        }
        case Voximplant.CallEvents.LocalVideoStreamRemoved: {
            yield put(callLocalVideoStreamChanged(null));
            break;
        }
        case Voximplant.CallEvents.EndpointAdded: {
            yield put(endpointAdded(event.endpoint));
            break;
        }
        default:
            console.log(`Unhandled call event ${eventName}`);
        }
    });

    yield take(UNSUBSCRIBE_FROM_CALL_EVENTS);
    channel.close();
}

function createAudioDeviceChannel() {
    const instance = Voximplant.Hardware.AudioDeviceManager.getInstance();

    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event.name, event);
        };

        Object.keys(Voximplant.Hardware.AudioDeviceEvents)
            .forEach((eventName) => instance.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.Hardware.AudioDeviceEvents)
                .forEach((eventName) => instance.off(eventName, handler));
        };
    });
}

export function* onSubscribeToAudioDeviceEvents() {
    const channel = createAudioDeviceChannel();

    yield takeEvery(channel, function* onCallEvent(eventName, event) {
        switch (eventName) {
        case Voximplant.Hardware.AudioDeviceEvents.DeviceChanged: {
            yield put(deviceChanged(event.currentDevice));
            break;
        }
        case Voximplant.Hardware.AudioDeviceEvents.DeviceListChanged: {
            yield put(deviceListChanged(event.newDeviceList));
            break;
        }
        default:
            console.log(`Unhandled audio device event ${eventName}`);
        }
    });

    yield take(UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS);
    channel.close();
}

export function* onMuteAudio() {
    // const isMuted = this.state.isAudioMuted;
    // this.call.sendAudio(isMuted);
    // this.setState({isAudioMuted: !isMuted});
}

export function* onSendVideo({ doSend }) {
    // console.log("CallScreen[" + this.callId + "] sendVideo: " + doSend);
    // try {
    //     if (doSend && Platform.OS === 'android') {
    //         const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    //         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //             console.warn('CallScreen[' + this.callId + '] sendVideo: failed due to camera permission is not granted');
    //             return;
    //         }
    //     }
    //     await this.call.sendVideo(doSend);
    //     this.setState({isVideoSent: doSend});
    // } catch (e) {
    //     console.warn(`Failed to sendVideo(${doSend}) due to ${e.code} ${e.message}`);
    // }
}

export function* onHold({ doHold }) {
    // console.log('CallScreen[' + this.callId + '] hold: ' + doHold);
    // try {
    //     await this.call.hold(doHold);
    // } catch (e) {
    //     console.warn('Failed to hold(' + doHold + ') due to ' + e.code + ' ' + e.message);
    // }
}

export function* onReceiveVideo() {
    // console.log('CallScreen[' + this.callId + '] receiveVideo');
    // try {
    //     await this.call.receiveVideo();
    // } catch (e) {
    //     console.warn('Failed to receiveVideo due to ' + e.code + ' ' + e.message);
    // }
}

export function* onEndCall() {
    const activeCall = yield select(makeSelectActiveCall());

    activeCall.hangup();
}

export function* onSwitchAudioDevice() {
    // console.log('CallScreen[' + this.callId + '] switchAudioDevice');
    // let devices = await Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices();
    // this.setState({audioDevices: devices, audioDeviceSelectionVisible: true});
}

export function* onSelectAudioDevice({ device }) {
    // console.log('CallScreen[' + this.callId + '] selectAudioDevice: ' + device);
    // Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device);
    // this.setState({audioDeviceSelectionVisible: false});
}

export default function* incomingCallSaga() {
    yield all([
        takeLatest(SUBSCRIBE_TO_CALL_EVENTS, onSubscribeToCallEvents),
        takeLatest(SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS, onSubscribeToAudioDeviceEvents),
        takeLatest(TOGGLE_AUDIO_MUTE, onMuteAudio),
        takeLatest(TOGGLE_VIDEO_SEND, onSendVideo),
        takeLatest(HOLD, onHold),
        takeLatest(RECEIVE_VIDEO, onReceiveVideo),
        takeLatest(END_CALL, onEndCall),
        takeLatest(SWITCH_AUDIO_DEVICE, onSwitchAudioDevice),
        takeLatest(SELECT_AUDIO_DEVICE, onSelectAudioDevice),

        takeEvery(CALL_FAILED, onCallFailed),
        takeEvery(CALL_DISCONNECTED, onCallDisconnected),
        takeEvery(ENDPOINT_ADDED, onEndpointAdded),
    ]);
}

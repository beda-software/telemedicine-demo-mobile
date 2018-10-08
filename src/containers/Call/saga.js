import { NavigationActions } from 'react-navigation';
import { eventChannel } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select } from 'redux-saga/effects';

import {
    SUBSCRIBE_TO_CALL_EVENTS,
    SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS,
    UNSUBSCRIBE_FROM_CALL_EVENTS,
    UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS,
    MUTE_AUDIO,
    SEND_VIDEO,
    HOLD,
    RECEIVE_VIDEO,
    END_CALL,
    SWITCH_AUDIO_DEVICE,
    SELECT_AUDIO_DEVICE,

    CALL_FAILED,
    CALL_DISCONNECTED,
} from './constants';
import {
    callFailed,
    callDisconnected,
} from './actions';

import { Voximplant } from 'react-native-voximplant';
import { makeSelectActiveCall } from 'containers/App/selectors';
import { setActiveCall, showModal } from 'containers/App/actions';


function* onCallFailed({ reason }) {
    yield put(setActiveCall(null));
    yield put(showModal(`Call failed: ${reason}`));
}

function* onCallDisconnected() {
    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

/*

_onCallConnected = (event) => {
    console.log('CallScreen: _onCallConnected: ' + this.call.callId);
    // this.call.sendMessage('Test message');
    // this.call.sendInfo('rn/info', 'test info');
    this.callState = CALL_STATES.DISCONNECTED;
};

_onCallLocalVideoStreamAdded = (event) => {
    console.log('CallScreen: _onCallLocalVideoStreamAdded: ' + this.call.callId + ', video stream id: ' + event.videoStream.id);
    this.setState({localVideoStreamId: event.videoStream.id});
};

_onCallLocalVideoStreamRemoved = (event) => {
    console.log('CallScreen: _onCallLocalVideoStreamRemoved: ' + this.call.callId);
    this.setState({localVideoStreamId: null});
};

_onCallEndpointAdded = (event) => {
    console.log('CallScreen: _onCallEndpointAdded: callid: ' + this.call.callId + ' endpoint id: ' + event.endpoint.id);
    this._setupEndpointListeners(event.endpoint, true);
};

_onEndpointRemoteVideoStreamAdded = (event) => {
    console.log('CallScreen: _onEndpointRemoteVideoStreamAdded: callid: ' + this.call.callId + ' endpoint id: ' + event.endpoint.id);
    this.setState({remoteVideoStreamId: event.videoStream.id});
};

_onEndpointRemoteVideoStreamRemoved = (event) => {
    console.log('CallScreen: _onEndpointRemoteVideoStreamRemoved: callid: ' + this.call.callId + ' endpoint id: ' + event.endpoint.id);
    this.setState({remoteVideoStreamId: null});
};

_onEndpointRemoved = (event) => {
    console.log('CallScreen: _onEndpointRemoved: callid: ' + this.call.callId + ' endpoint id: ' + event.endpoint.id);
    this._setupEndpointListeners(event.endpoint, false);
};

_onEndpointInfoUpdated = (event) => {
    console.log('CallScreen: _onEndpointInfoUpdated: callid: ' + this.call.callId + ' endpoint id: ' + event.endpoint.id);
};

_setupEndpointListeners(endpoint, on) {
    Object.keys(Voximplant.EndpointEvents).forEach((eventName) => {
        const callbackName = `_onEndpoint${eventName}`;
        if (typeof this[callbackName] !== 'undefined') {
            endpoint[(on) ? 'on' : 'off'](eventName, this[callbackName]);
        }
    });
}

_onAudioDeviceChanged = (event) => {
    console.log('CallScreen: _onAudioDeviceChanged:' + event.currentDevice);
    switch (event.currentDevice) {
        case Voximplant.Hardware.AudioDevice.BLUETOOTH:
            this.setState({audioDeviceIcon: 'bluetooth-audio'});
            break;
        case Voximplant.Hardware.AudioDevice.SPEAKER:
            this.setState({audioDeviceIcon: 'volume-up'});
            break;
        case Voximplant.Hardware.AudioDevice.WIRED_HEADSET:
            this.setState({audioDeviceIcon: 'headset'});
            break;
        case Voximplant.Hardware.AudioDevice.EARPIECE:
        default:
            this.setState({audioDeviceIcon: 'hearing'});
            break;
    }
};

_onAudioDeviceListChanged = (event) => {
    (async () => {
        let device = await Voximplant.Hardware.AudioDeviceManager.getInstance().getActiveDevice();
        console.log(device);
    })();
    this.setState({audioDevices: event.newDeviceList});
};
*/

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
    const callChannel = createCallChannel(activeCall);

    yield takeEvery(callChannel, function* onCallEvent(eventName, event) {
        switch (eventName) {
        case Voximplant.CallEvents.Failed:
            yield put(callFailed());
        case Voximplant.CallEvents.Disconnected:
            yield put(callDisconnected());
        }
    });

    yield take(UNSUBSCRIBE_FROM_CALL_EVENTS);
    callChannel.close();
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
    const callChannel = createAudioDeviceChannel();

    yield takeEvery(callChannel, function* onCallEvent(eventName, event) {
        switch (eventName) {

        }
    });

    yield take(UNSUBSCRIBE_FROM_CALL_EVENTS);
    callChannel.close();
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
        takeLatest(MUTE_AUDIO, onMuteAudio),
        takeLatest(SEND_VIDEO, onSendVideo),
        takeLatest(HOLD, onHold),
        takeLatest(RECEIVE_VIDEO, onReceiveVideo),
        takeLatest(END_CALL, onEndCall),
        takeLatest(SWITCH_AUDIO_DEVICE, onSwitchAudioDevice),
        takeLatest(SELECT_AUDIO_DEVICE, onSelectAudioDevice),

        takeLatest(CALL_FAILED, onCallFailed),
        takeLatest(CALL_DISCONNECTED, onCallDisconnected),
    ]);
}

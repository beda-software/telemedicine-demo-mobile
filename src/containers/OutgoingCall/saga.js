import { Platform, PermissionsAndroid } from 'react-native';
import { all, takeLatest, put } from 'redux-saga/effects';

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
} from './constants';

import { Voximplant } from 'react-native-voximplant';

/*
_onCallFailed = (event) => {
    this.callState = CALL_STATES.DISCONNECTED;
    CallManager.getInstance().removeCall(this.call);
    this.setState({
        isModalOpen: true,
        modalText: 'Call failed: ' + event.reason
    });
};

_onCallDisconnected = (event) => {
    console.log('CallScreen:' + this.call.callId + '_onCallDisconnected: ' + event.call.callId);
    CallManager.getInstance().removeCall(this.call);
    this.callState = CALL_STATES.DISCONNECTED;
    this.props.navigation.navigate("App");
};

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

export function* subscribeToCallEvents() {
   // this.call = CallManager.getInstance().getCallById(this.callId);
   // if (this.call) {
   //     Object.keys(Voximplant.CallEvents).forEach((eventName) => {
   //         const callbackName = `_onCall${eventName}`;
   //         if (typeof this[callbackName] !== 'undefined') {
   //             this.call.on(eventName, this[callbackName]);
   //         }
   //     });
   // }
}

export function* unsubscribeFromCallEvents() {
   // this.call = CallManager.getInstance().getCallById(this.callId);
   // if (this.call) {
   //     Object.keys(Voximplant.CallEvents).forEach((eventName) => {
   //         const callbackName = `_onCall${eventName}Callback`;
   //         if (typeof this[callbackName] !== 'undefined') {
   //             this.call.off(eventName, this[callbackName]);
   //         }
   //     });
   // }
}

export function* subscribeToAudioDeviceEvents() {
   // Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
   //     const callbackName = `_onAudio${eventName}`;
   //     if (typeof this[callbackName] !== 'undefined') {
   //         Voximplant.Hardware.AudioDeviceManager.getInstance().on(eventName, this[callbackName]);
   //     }
   // });
}

export function* unsubscribeFromAudioDeviceEvents() {
   // Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
   //     const callbackName = `_onAudioDevice${eventName}Callback`;
   //     if (typeof this[callbackName] !== 'undefined') {
   //         Voximplant.Hardware.AudioDeviceManager.getInstance().on(eventName, this[callbackName]);
   //     }
   // });
}

export function* muteAudio() {
   // const isMuted = this.state.isAudioMuted;
   // this.call.sendAudio(isMuted);
   // this.setState({isAudioMuted: !isMuted});
}

export function* sendVideo({ doSend }) {
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

export function* hold({ doHold }) {
   // console.log('CallScreen[' + this.callId + '] hold: ' + doHold);
   // try {
   //     await this.call.hold(doHold);
   // } catch (e) {
   //     console.warn('Failed to hold(' + doHold + ') due to ' + e.code + ' ' + e.message);
   // }
}

export function* receiveVideo() {
   // console.log('CallScreen[' + this.callId + '] receiveVideo');
   // try {
   //     await this.call.receiveVideo();
   // } catch (e) {
   //     console.warn('Failed to receiveVideo due to ' + e.code + ' ' + e.message);
   // }
}

export function* endCall() {
   // console.log("CallScreen[" + this.callId + "] endCall");
   // this.call.hangup();
}

export function* switchAudioDevice() {
   // console.log('CallScreen[' + this.callId + '] switchAudioDevice');
   // let devices = await Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices();
   // this.setState({audioDevices: devices, audioDeviceSelectionVisible: true});
}

export function* selectAudioDevice({ device }) {
   // console.log('CallScreen[' + this.callId + '] selectAudioDevice: ' + device);
   // Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device);
   // this.setState({audioDeviceSelectionVisible: false});
}

export default function* incomingCallSaga() {
    yield all([
        takeLatest(SUBSCRIBE_TO_CALL_EVENTS, subscribeToCallEvents),
        takeLatest(UNSUBSCRIBE_FROM_CALL_EVENTS, unsubscribeFromCallEvents),
        takeLatest(SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS, subscribeToAudioDeviceEvents),
        takeLatest(UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS, unsubscribeFromAudioDeviceEvents),
        takeLatest(MUTE_AUDIO, muteAudio),
        takeLatest(SEND_VIDEO, sendVideo),
        takeLatest(HOLD, hold),
        takeLatest(RECEIVE_VIDEO, receiveVideo),
        takeLatest(END_CALL, endCall),
        takeLatest(SWITCH_AUDIO_DEVICE, switchAudioDevice),
        takeLatest(SELECT_AUDIO_DEVICE, selectAudioDevice),
    ]);
}

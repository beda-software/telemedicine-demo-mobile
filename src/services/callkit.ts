import RNCallKit from 'react-native-callkit';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';
import uuid from 'uuid';

import CallService from './call';

export default class CallKitManager {
    public callKitUuid = undefined;
    public withVideo = false;
    public callId = undefined;

    constructor() {
        const options = {
            appName: 'VoximplantDemo',
        };
        try {
            RNCallKit.setup(options);
        } catch (err) {
            console.log('CallKitManager: CallKit setup error:', err.message);
        }

        RNCallKit.addEventListener('didReceiveStartCallAction', this._onRNCallKitDidReceiveStartCallAction);
        RNCallKit.addEventListener('answerCall', this._onRNCallKitPerformAnswerCallAction);
        RNCallKit.addEventListener('endCall', this._onRNCallKitPerformEndCallAction);
        RNCallKit.addEventListener('didActivateAudioSession', this._onRNCallKitDidActivateAudioSession);
        RNCallKit.addEventListener('didDisplayIncomingCall', this._onRNCallKitDidDisplayIncomingCall);
        RNCallKit.addEventListener('didPerformSetMutedCallAction', this._onRNCallKitDidPerformSetMutedCallAction);
    }

    public showIncomingCall(isVideoCall, displayName, callId) {
        this.callKitUuid = uuid.v4();
        this.withVideo = isVideoCall;
        this.callId = callId;
        RNCallKit.displayIncomingCall(this.callKitUuid, displayName, 'number', isVideoCall);
    }

    public startOutgoingCall(isVideoCall, displayName, callId) {
        this.callKitUuid = uuid.v4();
        this.withVideo = isVideoCall;
        this.callId = callId;
        RNCallKit.startCall(this.callKitUuid, displayName, 'number', isVideoCall);
    }

    public reportOutgoingCallConnected() {
        RNCallKit.reportConnectedOutgoingCallWithUUID(this.callKitUuid);
    }

    public endCall() {
        RNCallKit.endCall(this.callKitUuid);
    }

    public _onRNCallKitDidReceiveStartCallAction = (data) => {
        console.log('CallKitManager: _onRNCallKitDidReceiveStartCallAction');
    };

    public _onRNCallKitPerformAnswerCallAction = (data) => {
        console.log('CallKitManager: _onRNCallKitPerformAnswerCallAction' + this.callId);
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitConfigureAudioSession();
        Navigation.showModal({
            component: {
                name: 'td.Call',
                passProps: { isVideo: this.withVideo, callId: this.callId, isIncoming: true },
            },
        });
    };

    public _onRNCallKitPerformEndCallAction = (data) => {
        console.log('CallKitManager: _onRNCallKitPerformEndCallAction');
        CallService.getInstance().endCall();
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStopAudio();
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitReleaseAudioSession();
    };

    public _onRNCallKitDidActivateAudioSession = (data) => {
        console.log('CallKitManager: _onRNCallKitDidActivateAudioSession');
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStartAudio();
    };

    public _onRNCallKitDidDisplayIncomingCall = (error) => {
        console.log('CallKitManager: _onRNCallKitDidDisplayIncomingCall: error: ' + error);
    };

    public _onRNCallKitDidPerformSetMutedCallAction = (muted) => {
        /* You will get this event after the system or the user mutes a call
         * You can use it to toggle the mic on your custom call UI
         */
    };
}

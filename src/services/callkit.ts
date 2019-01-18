import RNCallKit from 'react-native-callkit';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';
import * as uuid from 'uuid';

import { CallService } from './call';

export class CallKitService {
    public callKitUuid?: string;
    public withVideo: boolean = false;
    public callId?: string;

    constructor() {
        const options = {
            appName: 'VoximplantDemo',
        };
        try {
            RNCallKit.setup(options);
        } catch (err) {
            console.log('CallKitManager: CallKit setup error:', err.message);
        }

        RNCallKit.addEventListener('didReceiveStartCallAction', this.onRNCallKitDidReceiveStartCallAction);
        RNCallKit.addEventListener('answerCall', this.onRNCallKitPerformAnswerCallAction);
        RNCallKit.addEventListener('endCall', this.onRNCallKitPerformEndCallAction);
        RNCallKit.addEventListener('didActivateAudioSession', this.onRNCallKitDidActivateAudioSession);
        RNCallKit.addEventListener('didDisplayIncomingCall', this.onRNCallKitDidDisplayIncomingCall);
        RNCallKit.addEventListener('didPerformSetMutedCallAction', this.onRNCallKitDidPerformSetMutedCallAction);
    }

    public showIncomingCall(isVideoCall: boolean, displayName: string, callId: string) {
        this.callKitUuid = uuid.v4();
        this.withVideo = isVideoCall;
        this.callId = callId;
        RNCallKit.displayIncomingCall(this.callKitUuid, displayName, 'number', isVideoCall);
    }

    public startOutgoingCall(isVideoCall: boolean, displayName: string, callId: string) {
        this.callKitUuid = uuid.v4();
        this.withVideo = isVideoCall;
        this.callId = callId;
        RNCallKit.startCall(this.callKitUuid, displayName, 'number', isVideoCall);
    }

    public reportOutgoingCallConnected() {
        if (this.callKitUuid) {
            RNCallKit.reportConnectedOutgoingCallWithUUID(this.callKitUuid);
        }
    }

    public endCall() {
        if (this.callKitUuid) {
            RNCallKit.endCall(this.callKitUuid);
        }
    }

    public onRNCallKitDidReceiveStartCallAction = (data: any) => {
        console.log('CallKitManager: onRNCallKitDidReceiveStartCallAction');
    };

    public onRNCallKitPerformAnswerCallAction = async (data: any) => {
        console.log('CallKitManager: onRNCallKitPerformAnswerCallAction' + this.callId);
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitConfigureAudioSession();
        await Navigation.showModal({
            component: {
                name: 'td.Call',
                passProps: { isVideo: this.withVideo, callId: this.callId, isIncoming: true },
            },
        });
    };

    public onRNCallKitPerformEndCallAction = (data: any) => {
        console.log('CallKitManager: onRNCallKitPerformEndCallAction');
        CallService.getInstance().endCall();
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStopAudio();
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitReleaseAudioSession();
    };

    public onRNCallKitDidActivateAudioSession = (data: any) => {
        console.log('CallKitManager: onRNCallKitDidActivateAudioSession');
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStartAudio();
    };

    public onRNCallKitDidDisplayIncomingCall = (error: any) => {
        console.log('CallKitManager: onRNCallKitDidDisplayIncomingCall: error: ' + error);
    };

    public onRNCallKitDidPerformSetMutedCallAction = (muted: boolean) => {
        /* You will get this event after the system or the user mutes a call
         * You can use it to toggle the mic on your custom call UI
         */
    };
}

import RNCallKit from 'react-native-callkit';
import { Voximplant } from 'react-native-voximplant';
import * as uuid from 'uuid';

interface IncomingCall {
    callId: string;
    callerDisplayName: string;
    answerCall: () => Promise<void>;
    declineCall: () => Promise<void>;
}

export class CallKitService {
    public callKitUuid: string | null = null;
    public incomingCall?: IncomingCall;

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

    public showIncomingCall(
        callId: string,
        callerDisplayName: string,
        answerCall: () => Promise<void>,
        declineCall: () => Promise<void>
    ) {
        this.callKitUuid = uuid.v4();
        this.incomingCall = {
            callId,
            callerDisplayName,
            answerCall,
            declineCall,
        };
        RNCallKit.displayIncomingCall(this.callKitUuid, callerDisplayName, 'number', false);
    }

    public startOutgoingCall(displayName: string, callId: string) {
        this.callKitUuid = uuid.v4();
        RNCallKit.startCall(this.callKitUuid, displayName, 'number', false);
    }

    public reportOutgoingCallConnected() {
        if (this.callKitUuid) {
            RNCallKit.reportConnectedOutgoingCallWithUUID(this.callKitUuid);
        }
    }

    public endCall() {
        if (this.callKitUuid) {
            RNCallKit.endCall(this.callKitUuid);
            this.callKitUuid = null;
        }
    }

    public onRNCallKitDidReceiveStartCallAction = (data: any) => {
        console.log('CallKitManager: onRNCallKitDidReceiveStartCallAction');
    };

    public onRNCallKitPerformAnswerCallAction = async (data: any) => {
        if (!this.incomingCall) {
            return;
        }
        console.log('CallKitManager: onRNCallKitPerformAnswerCallAction' + this.incomingCall.callId);
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitConfigureAudioSession();
        await this.incomingCall.answerCall();
    };

    public onRNCallKitPerformEndCallAction = async (data: any) => {
        if (!this.incomingCall) {
            return;
        }
        console.log('CallKitManager: onRNCallKitPerformEndCallAction');
        await this.incomingCall.declineCall();
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

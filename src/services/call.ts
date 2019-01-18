import { AppState, NativeModules, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import CallKitService from './callkit';

// Voximplant SDK supports multiple calls at the same time, however
// this demo app demonstrates only one active call at the moment,
// so it rejects new incoming call if there is already a call.
export default class CallService {
    public static myInstance: CallService;

    public static getInstance(): CallService {
        if (!this.myInstance) {
            this.myInstance = new CallService();
        }

        return this.myInstance;
    }

    public call: Voximplant['Call'] | null = null;
    public initialized = false;
    public currentAppState?: string;
    public showIncomingCallScreen = false;
    public callKitService: CallKitService;
    private readonly client: Voximplant['Instance'];

    constructor() {
        this.client = Voximplant.getInstance();
        this.currentAppState = AppState.currentState;
        this.callKitService = new CallKitService();
    }

    public init() {
        // TODO: re-think
        if (!this.initialized) {
            this.client.on(Voximplant.ClientEvents.IncomingCall, this.incomingCall);
            AppState.addEventListener('change', this.handleAppStateChange);
            this.initialized = true;
        }
    }

    public addCall(call: Voximplant['Call']) {
        console.log(`CallManager: addCall: ${call.callId}`);
        this.call = call;
    }

    public removeCall(call: Voximplant['Call']) {
        console.log(`CallManager: removeCall: ${call.callId}`);
        if (this.call && this.call.callId === call.callId) {
            this.call.off(Voximplant.CallEvents.Connected, this.callConnected);
            this.call.off(Voximplant.CallEvents.Disconnected, this.callDisconnected);
            this.call.off(Voximplant.CallEvents.Failed, this.callFailed);
            this.call = null;
        } else if (this.call) {
            console.warn('CallManager: removeCall: call id mismatch');
        }
    }

    public getCallById(callId: string) {
        if (this.call && callId === this.call.callId) {
            return this.call;
        }

        return null;
    }

    public startOutgoingCallViaCallKit(isVideo: boolean, num: string) {
        if (!this.call) {
            return;
        }

        this.callKitService.startOutgoingCall(isVideo, num, this.call.callId);
        this.call.on(Voximplant.CallEvents.Connected, this.callConnected);
        this.call.on(Voximplant.CallEvents.Disconnected, this.callDisconnected);
        this.call.on(Voximplant.CallEvents.Failed, this.callFailed);
    }

    public endCall() {
        console.log('CallManager: endCall');
        if (this.call !== null && this.call !== undefined) {
            this.call.hangup();
        }
    }

    public async showIncomingScreenOrNotification(event: any) {
        if (this.currentAppState !== 'active') {
            // PushService.showLocalNotification('');
            this.showIncomingCallScreen = true;
            if (Platform.OS === 'android') {
                NativeModules.ActivityLauncher.openMainActivity();
            }
        } else {
            await Navigation.showModal({
                component: { name: 'td.IncomingCall', passProps: { callId: event.call.callId, isVideo: event.video } },
            });
        }
    }

    public incomingCall = (event: any) => {
        if (this.call !== null) {
            console.log(
                `CallManager: incomingCall: already have a call, rejecting new call, current call id: ${
                    this.call.callId
                }`
            );
            event.call.decline();
            return;
        }

        this.addCall(event.call);
        event.call.on(Voximplant.CallEvents.Disconnected, this.callDisconnected);
        event.call.on(Voximplant.CallEvents.Failed, this.callFailed);
        if (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 10) {
            this.callKitService.showIncomingCall(
                event.video,
                event.call.getEndpoints()[0].displayName,
                event.call.callId
            );
        } else {
            this.showIncomingScreenOrNotification(event);
        }
    };

    public callConnected = (event: any) => {
        if (this.call) {
            this.call.off(Voximplant.CallEvents.Connected, this.callConnected);
            this.callKitService.reportOutgoingCallConnected();
        }
    };

    public callDisconnected = (event: any) => {
        this.showIncomingCallScreen = false;
        this.removeCall(event.call);
        if (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 10) {
            this.callKitService.endCall();
        }
    };

    public callFailed = (event: any) => {
        this.showIncomingCallScreen = false;
        this.removeCall(event.call);
        if (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 10) {
            this.callKitService.endCall();
        }
    };

    public handleAppStateChange = async (newState: string) => {
        console.log(`CallManager: _handleAppStateChange: Current app state changed to ${newState}`);
        this.currentAppState = newState;
        if (this.currentAppState === 'active' && this.showIncomingCallScreen && this.call !== null) {
            this.showIncomingCallScreen = false;
            await Navigation.showModal({
                component: { name: 'td.IncomingCall', passProps: { callId: this.call.callId, isVideo: false } },
            });
        }
    };
}

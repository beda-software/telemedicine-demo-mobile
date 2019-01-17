import { AppState, Platform, NativeModules } from 'react-native';

import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';
import CallKitService from './callkit';
// import PushService from './pushnotifications';

// Voximplant SDK supports multiple calls at the same time, however
// this demo app demonstrates only one active call at the moment,
// so it rejects new incoming call if there is already a call.
export default class CallService {
    public static myInstance = null;

    public static getInstance(): CallService {
        if (this.myInstance === null) {
            this.myInstance = new CallService();
        }

        return this.myInstance;
    }
    public call = null;
    public currentAppState = undefined;
    public showIncomingCallScreen = false;
    public callKitService = null;

    constructor() {
        this.client = Voximplant.getInstance();
        this.currentAppState = AppState.currentState;
        this.callKitService = new CallKitService();
    }

    public init() {
        this.client.on(Voximplant.ClientEvents.IncomingCall, this._incomingCall);
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    public addCall(call) {
        console.log(`CallManager: addCall: ${call.callId}`);
        this.call = call;
    }

    public removeCall(call) {
        console.log(`CallManager: removeCall: ${call.callId}`);
        if (this.call && this.call.callId === call.callId) {
            this.call.off(Voximplant.CallEvents.Connected, this._callConnected);
            this.call.off(Voximplant.CallEvents.Disconnected, this._callDisconnected);
            this.call.off(Voximplant.CallEvents.Failed, this._callFailed);
            this.call = null;
        } else if (this.call) {
            console.warn('CallManager: removeCall: call id mismatch');
        }
    }

    public getCallById(callId) {
        if (callId === this.call.callId) {
            return this.call;
        }
        return null;
    }

    public startOutgoingCallViaCallKit(isVideo, number) {
        this.callKitService.startOutgoingCall(isVideo, number, this.call.callId);
        this.call.on(Voximplant.CallEvents.Connected, this._callConnected);
        this.call.on(Voximplant.CallEvents.Disconnected, this._callDisconnected);
        this.call.on(Voximplant.CallEvents.Failed, this._callFailed);
    }

    public endCall() {
        console.log('CallManager: endCall');
        if (this.call !== null && this.call !== undefined) {
            this.call.hangup();
        }
    }

    public _showIncomingScreenOrNotification(event) {
        if (this.currentAppState !== 'active') {
            // PushService.showLocalNotification('');
            this.showIncomingCallScreen = true;
            if (Platform.OS === 'android') {
                NativeModules.ActivityLauncher.openMainActivity();
            }
        } else {
            Navigation.showModal({
                component: { name: 'td.IncomingCall', passProps: { callId: event.call.callId, isVideo: event.video } },
            });
        }
    }

    public _incomingCall = (event) => {
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
        this.call.on(Voximplant.CallEvents.Disconnected, this._callDisconnected);
        this.call.on(Voximplant.CallEvents.Failed, this._callFailed);
        if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 10) {
            this.callKitService.showIncomingCall(
                event.video,
                event.call.getEndpoints()[0].displayName,
                event.call.callId
            );
        } else {
            this._showIncomingScreenOrNotification(event);
        }
    };

    public _callConnected = (event) => {
        this.call.off(Voximplant.CallEvents.Connected, this._callConnected);
        this.callKitService.reportOutgoingCallConnected();
    };

    public _callDisconnected = (event) => {
        this.showIncomingCallScreen = false;
        this.removeCall(event.call);
        if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 10) {
            this.callKitService.endCall();
        }
    };

    public _callFailed = (event) => {
        this.showIncomingCallScreen = false;
        this.removeCall(event.call);
        if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 10) {
            this.callKitService.endCall();
        }
    };

    public _handleAppStateChange = (newState) => {
        console.log(`CallManager: _handleAppStateChange: Current app state changed to ${newState}`);
        this.currentAppState = newState;
        if (this.currentAppState === 'active' && this.showIncomingCallScreen && this.call !== null) {
            this.showIncomingCallScreen = false;
            // if (Platform.OS === 'android') {
            //     PushService.removeDeliveredNotification();
            // }
            Navigation.showModal({
                component: { name: 'td.IncomingCall', passProps: { callId: this.call.callId, isVideo: false } },
            });
        }
    };
}

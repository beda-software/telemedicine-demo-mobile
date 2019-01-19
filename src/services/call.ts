import * as _ from 'lodash';
import { AppState, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { Voximplant } from 'react-native-voximplant';

import { CallKitService } from './callkit';

interface ShowIncomingCallScreenProps {
    callId: string;
    answerCall: () => void;
    endCall: () => void;
}

interface ShowCallScreenProps {
    callId: string;
    isIncoming: boolean;
    setAudioDevice: (device: string) => void;
    getAudioDevices: () => Promise<string[]>;
    sendTone: (value: number) => void;
    sendVideo: (send: boolean) => void;
    sendAudio: (send: boolean) => void;
}

interface Callbacks {
    [x: string]: (event: any) => void;
}

export interface CallSubscription {
    unsubscribe: () => void;
    endCall: () => void;
}

function mergeCallbacks(obj1: Callbacks, obj2: Callbacks) {
    function customizer(fn1: (event: any) => void, fn2: (event: any) => void) {
        if (_.isFunction(fn1) && _.isFunction(fn2)) {
            return (event: any) => {
                fn1(event);
                fn2(event);
            };
        }

        return;
    }
    return _.mergeWith(obj1, obj2, customizer);
}

// Voximplant SDK supports multiple calls at the same time, however
// this demo app demonstrates only one active call at the moment,
// so it rejects new incoming call if there is already a call.
export class CallService {
    public static myInstance: CallService;

    public static getInstance(): CallService {
        if (!this.myInstance) {
            this.myInstance = new CallService();
        }

        return this.myInstance;
    }

    public static async requestPermissions(isVideo: boolean) {
        if (Platform.OS === 'android') {
            const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
            if (isVideo) {
                permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
            }
            const granted = await PermissionsAndroid.requestMultiple(permissions);
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

    public static async startOutgoingCall(username: string, displayName: string): Promise<Voximplant['Call']> {
        const call = await Voximplant.getInstance().call(username, {
            video: {
                sendVideo: false,
                receiveVideo: false,
            },
        });

        const instance = CallService.getInstance();
        instance.addCall(call);
        instance.startOutgoingCallViaCallKit(displayName);

        instance.showCallScreen(call.callId, false);

        return call;
    }

    public static subscribeToIncomingCallEvents(callId: string, eventCallbacks: Callbacks): () => void {
        const call = CallService.getInstance().getCallById(callId);

        if (!call) {
            return () => {};
        }

        const callbacks = mergeCallbacks(
            {
                onCallDisconnected: (event: any) => {
                    CallService.getInstance().removeCall(event.call);
                },
                onCallFailed: (event: any) => {
                    CallService.getInstance().removeCall(event.call);
                },
            },
            eventCallbacks
        );

        Object.keys(Voximplant.CallEvents).forEach((eventName) => {
            const callbackName = `onCall${eventName}`;
            if (typeof callbacks[callbackName] !== 'undefined') {
                call.on(eventName, callbacks[callbackName]);
            }
        });

        return () => {
            Object.keys(Voximplant.CallEvents).forEach((eventName) => {
                const callbackName = `onCall${eventName}`;
                if (typeof callbacks[callbackName] !== 'undefined') {
                    call.off(eventName, callbacks[callbackName]);
                }
            });
        };
    }

    public static subscribeToCallEvents(
        callId: string,
        isIncoming: boolean,
        eventCallbacks: Callbacks
    ): CallSubscription {
        const call = CallService.getInstance().getCallById(callId);

        if (!call) {
            return {
                unsubscribe: () => {},
                endCall: () => {},
            };
        }

        const callbacks = mergeCallbacks(
            {
                onCallFailed: async (event: any) => {
                    console.log('CallScreen: _onCallFailed');
                    CallService.getInstance().removeCall(event.call);
                },

                onCallDisconnected: async (event: any) => {
                    console.log('CallScreen: _onCallDisconnected');
                    CallService.getInstance().removeCall(event.call);
                },

                onCallEndpointAdded: (event: any) => {
                    console.log(
                        'CallScreen: _onCallEndpointAdded: callId: ' + callId + ' endpoint id: ' + event.endpoint.id
                    );
                    setupEndpointListeners(event.endpoint, true);
                },

                onEndpointRemoved: (event: any) => {
                    console.log(
                        'CallScreen: _onEndpointRemoved: callId: ' + callId + ' endpoint id: ' + event.endpoint.id
                    );
                    setupEndpointListeners(event.endpoint, false);
                },
            },
            eventCallbacks
        );

        if (isIncoming) {
            call.getEndpoints().forEach((endpoint: any) => {
                setupEndpointListeners(endpoint, true);
            });
        }

        Object.keys(Voximplant.CallEvents).forEach((eventName) => {
            const callbackName = `onCall${eventName}`;
            if (typeof callbacks[callbackName] !== 'undefined') {
                call.on(eventName, callbacks[callbackName]);
            }
        });

        Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
            const callbackName = `onAudio${eventName}`;
            if (typeof callbacks[callbackName] !== 'undefined') {
                Voximplant.Hardware.AudioDeviceManager.getInstance().on(eventName, callbacks[callbackName]);
            }
        });

        function setupEndpointListeners(endpoint: any, setup: boolean) {
            console.log('SETUP ENDPOINT LISTENERS', setup);
            Object.keys(Voximplant.EndpointEvents).forEach((eventName) => {
                const callbackName = `onEndpoint${eventName}`;
                if (typeof callbacks[callbackName] !== 'undefined') {
                    console.log('callbackname', callbackName);
                    endpoint[setup ? 'on' : 'off'](eventName, callbacks[callbackName]);
                }
            });
        }

        return {
            unsubscribe: () => {
                Object.keys(Voximplant.CallEvents).forEach((eventName) => {
                    const callbackName = `onCall${eventName}`;
                    if (typeof callbacks[callbackName] !== 'undefined') {
                        call.off(eventName, callbacks[callbackName]);
                    }
                });

                Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
                    const callbackName = `onAudio${eventName}`;
                    if (typeof callbacks[callbackName] !== 'undefined') {
                        Voximplant.Hardware.AudioDeviceManager.getInstance().off(eventName, callbacks[callbackName]);
                    }
                });
            },
            endCall: () => {
                call.getEndpoints().forEach((endpoint: any) => {
                    setupEndpointListeners(endpoint, false);
                });

                call.hangup();
            },
        };
    }

    public static setup({
        showIncomingCallScreen,
        showCallScreen,
    }: {
        showIncomingCallScreen: (passProps: ShowIncomingCallScreenProps) => void;
        showCallScreen: (passProps: ShowCallScreenProps) => void;
    }) {
        if (!showCallScreen || !showIncomingCallScreen) {
            console.error(
                'CallService.setup: you mush pass `showIncomingCallScreen` and `showCallScreen` to config to setup the service'
            );
            return;
        }
        const instance = CallService.getInstance();

        instance.client.on(Voximplant.ClientEvents.IncomingCall, instance.onIncomingCall);
        AppState.addEventListener('change', instance.handleAppStateChange);
        instance.passedShowIncomingCallScreen = showIncomingCallScreen;
        instance.passedShowCallScreen = showCallScreen;
    }

    public call: Voximplant['Call'] | null = null;
    public needToShowIncomingCallScreen = false;
    public callKitService: CallKitService;
    public passedShowIncomingCallScreen?: (passProps: ShowIncomingCallScreenProps) => void;
    public passedShowCallScreen?: (passProps: ShowCallScreenProps) => void;
    private readonly client: Voximplant['Instance'];

    constructor() {
        this.client = Voximplant.getInstance();
        this.callKitService = new CallKitService();
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

    public startOutgoingCallViaCallKit(displayName: string) {
        if (!this.call) {
            return;
        }

        this.callKitService.startOutgoingCall(displayName, this.call.callId);
        this.call.on(Voximplant.CallEvents.Connected, this.callConnected);
        this.call.on(Voximplant.CallEvents.Disconnected, this.callDisconnected);
        this.call.on(Voximplant.CallEvents.Failed, this.callFailed);
    }

    public endIncomingCall() {
        console.log('CallManager: endIncomingCall', this.call);
        if (!this.call) {
            return;
        }
        this.call.decline();
    }

    public answerIncomingCall() {
        if (!this.call) {
            return;
        }

        this.call.answer({
            video: {
                sendVideo: false,
                receiveVideo: false,
            },
        });
        this.showCallScreen(this.call.callId, true);
    }

    public async getAudioDevices() {
        return Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices();
    }
    public setAudioDevice(device: string) {
        Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device);
    }
    public sendTone(value: number) {
        if (this.call) {
            this.call.sendTone(value);
        }
    }
    public sendVideo(send: boolean) {
        if (this.call) {
            this.call.sendVideo(send);
        }
    }
    public sendAudio(send: boolean) {
        if (this.call) {
            this.call.sendAudio(send);
        }
    }

    public showIncomingScreenOrNotification(event: any) {
        if (AppState.currentState !== 'active') {
            this.needToShowIncomingCallScreen = true;
            if (Platform.OS === 'android') {
                NativeModules.ActivityLauncher.openMainActivity();
            } else {
                // PushService.showLocalNotification('');
            }
        } else {
            this.showIncomingCallScreen(event.call.callId);
        }
    }

    public onIncomingCall = (event: any) => {
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
        if (Platform.OS === 'ios') {
            this.callKitService.showIncomingCall(
                event.call.getEndpoints()[0].displayName,
                event.call.callId,
                this.answerIncomingCall.bind(this),
                this.endIncomingCall.bind(this)
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
        this.needToShowIncomingCallScreen = false;
        this.removeCall(event.call);
        this.callKitService.endCall();
    };

    public callFailed = (event: any) => {
        this.needToShowIncomingCallScreen = false;
        this.removeCall(event.call);
        this.callKitService.endCall();
    };

    public handleAppStateChange = async (newState: string) => {
        console.log(`CallManager: _handleAppStateChange: Current app state changed to ${newState}`);
        if (newState === 'active' && this.needToShowIncomingCallScreen && this.call !== null) {
            this.needToShowIncomingCallScreen = false;
            await this.showIncomingCallScreen(this.call.callId);
        }
    };

    public showIncomingCallScreen(callId: string) {
        if (!this.passedShowIncomingCallScreen) {
            return;
        }

        this.passedShowIncomingCallScreen({
            callId,
            answerCall: this.answerIncomingCall.bind(this),
            endCall: this.endIncomingCall.bind(this),
        });
    }

    public showCallScreen(callId: string, isIncoming: boolean) {
        if (!this.passedShowCallScreen) {
            return;
        }

        this.passedShowCallScreen({
            callId,
            isIncoming,
            sendAudio: this.sendAudio.bind(this),
            sendVideo: this.sendVideo.bind(this),
            sendTone: this.sendTone.bind(this),
            getAudioDevices: this.getAudioDevices.bind(this),
            setAudioDevice: this.setAudioDevice.bind(this),
        });
    }
}

import * as _ from 'lodash';
import { AppState, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallKitService } from './callkit';

interface Callbacks {
    [x: string]: (event: any) => void;
}

export interface IncomingCallSubscription {
    unsubscribe: () => void;
    endCall: () => void;
}

export interface CallSubscription {
    unsubscribe: () => void;
    answerCall: (config: object) => void;
    endCall: () => void;
    setAudioDevice: (device: string) => void;
    getAudioDevices: () => Promise<string[]>;
    sendTone: (value: number) => void;
    sendVideo: (send: boolean) => void;
    sendAudio: (send: boolean) => void;
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

    public static async startOutgoingCall(
        isVideo: boolean,
        username: string,
        displayName: string
    ): Promise<Voximplant['Call']> {
        const call = await Voximplant.getInstance().call(username, {
            video: {
                sendVideo: isVideo,
                receiveVideo: true,
            },
        });

        const callService = CallService.getInstance();
        callService.addCall(call);
        callService.startOutgoingCallViaCallKit(isVideo, displayName);

        return call;
    }

    public static subscribeToIncomingCallEvents(callId: string, eventCallbacks: Callbacks): IncomingCallSubscription {
        const call = CallService.getInstance().getCallById(callId);

        if (!call) {
            return {
                unsubscribe: () => {},
                endCall: () => {},
            };
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

        return {
            unsubscribe: () => {
                Object.keys(Voximplant.CallEvents).forEach((eventName) => {
                    const callbackName = `onCall${eventName}`;
                    if (typeof callbacks[callbackName] !== 'undefined') {
                        call.off(eventName, callbacks[callbackName]);
                    }
                });
            },
            endCall: () => call.decline(),
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
                answerCall: (config: object) => {},
                setAudioDevice: (device: string) => {},
                getAudioDevices: () => Promise.resolve([]),
                sendTone: (value: number) => {},
                sendVideo: (send: boolean) => {},
                sendAudio: (send: boolean) => {},
            };
        }

        const callbacks = mergeCallbacks(
            {
                onAudioDeviceChanged: (event: any) => {},

                onAudioDeviceListChanged: (event: any) => {},

                onCallFailed: async (event: any) => {
                    console.log('CallScreen: _onCallFailed');
                    CallService.getInstance().removeCall(event.call);
                },

                onCallDisconnected: async (event: any) => {
                    console.log('CallScreen: _onCallDisconnected');
                    CallService.getInstance().removeCall(event.call);
                },

                onCallConnected: (event: any) => {
                    console.log('CallScreen: _onCallConnected: ' + callId);
                },

                onCallLocalVideoStreamAdded: (event: any) => {
                    console.log(
                        'CallScreen: _onCallLocalVideoStreamAdded: ' +
                            callId +
                            ', video stream id: ' +
                            event.videoStream.id
                    );
                },

                onCallLocalVideoStreamRemoved: (event: any) => {
                    console.log('CallScreen: _onCallLocalVideoStreamRemoved: ' + callId);
                },

                onCallEndpointAdded: (event: any) => {
                    console.log(
                        'CallScreen: _onCallEndpointAdded: callId: ' + callId + ' endpoint id: ' + event.endpoint.id
                    );
                    setupEndpointListeners(event.endpoint, true);
                },

                onEndpointRemoteVideoStreamAdded: (event: any) => {
                    console.log(
                        'CallScreen: _onEndpointRemoteVideoStreamAdded: callId: ' +
                            callId +
                            ' endpoint id: ' +
                            event.endpoint.id
                    );
                },

                onEndpointRemoteVideoStreamRemoved: (event: any) => {
                    console.log(
                        'CallScreen: _onEndpointRemoteVideoStreamRemoved: callId: ' +
                            callId +
                            ' endpoint id: ' +
                            event.endpoint.id
                    );
                },

                onEndpointRemoved: (event: any) => {
                    console.log(
                        'CallScreen: _onEndpointRemoved: callId: ' + callId + ' endpoint id: ' + event.endpoint.id
                    );
                    setupEndpointListeners(event.endpoint, false);
                },

                onEndpointInfoUpdated: (event: any) => {
                    console.log(
                        'CallScreen: _onEndpointInfoUpdated: callId: ' + callId + ' endpoint id: ' + event.endpoint.id
                    );
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
            Object.keys(Voximplant.EndpointEvents).forEach((eventName) => {
                const callbackName = `onEndpoint${eventName}`;
                if (typeof callbacks[callbackName] !== 'undefined') {
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
            answerCall: (config: object) => {
                call.answer(config);
            },
            endCall: () => {
                call.getEndpoints().forEach((endpoint: any) => {
                    setupEndpointListeners(endpoint, false);
                });

                call.hangup();
            },
            getAudioDevices: async () => Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices(),
            setAudioDevice: (device: string) =>
                Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device),
            sendTone: (value: number) => call.sendTone(value),
            sendVideo: (send: boolean) => call.sendVideo(send),
            sendAudio: (send: boolean) => call.sendAudio(send),
        };
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

    public deinit() {
        this.client.off(Voximplant.ClientEvents.IncomingCall, this.incomingCall);
        AppState.removeEventListener('change', this.handleAppStateChange);
        this.initialized = false;
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

    public startOutgoingCallViaCallKit(isVideo: boolean, displayName: string) {
        if (!this.call) {
            return;
        }

        this.callKitService.startOutgoingCall(isVideo, displayName, this.call.callId);
        this.call.on(Voximplant.CallEvents.Connected, this.callConnected);
        this.call.on(Voximplant.CallEvents.Disconnected, this.callDisconnected);
        this.call.on(Voximplant.CallEvents.Failed, this.callFailed);
    }

    public endCall() {
        console.log('CallManager: endCall');
        if (this.call) {
            this.call.hangup();
        }
    }

    public showIncomingScreenOrNotification(event: any) {
        if (this.currentAppState !== 'active') {
            this.showIncomingCallScreen = true;
            if (Platform.OS === 'android') {
                NativeModules.ActivityLauncher.openMainActivity();
            } else {
                // PushService.showLocalNotification('');
            }
        } else {
            Navigation.showModal({
                component: { name: 'td.IncomingCall', passProps: { callId: event.call.callId, isVideo: event.video } },
            });
        }
    }

    public incomingCall = (event: any) => {
        console.log('NEW INCOMING CALL!!!');
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
        this.callKitService.endCall();
    };

    public callFailed = (event: any) => {
        this.showIncomingCallScreen = false;
        this.removeCall(event.call);
        this.callKitService.endCall();
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

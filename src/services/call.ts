import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { AppState, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { Voximplant } from 'react-native-voximplant';
import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, RemoteDataResult, success } from 'src/libs/schema';

import { CallKitService } from './callkit';

interface ShowIncomingCallScreenProps {
    callId: string;
    callerDisplayName: string;
    answerCall: () => Promise<void>;
    declineCall: () => Promise<void>;
}

interface ShowCallScreenProps {
    callId: string;
    isIncoming: boolean;
    setAudioDevice: (device: string) => Promise<void>;
    getAudioDevices: () => Promise<string[]>;
    sendTone: (value: number) => Promise<void>;
    sendVideo: (send: boolean) => Promise<void>;
    sendAudio: (send: boolean) => Promise<void>;
    endCall: () => Promise<void>;
}

interface IncomingCallCallbacks {
    onCallDisconnected?: (event: any) => void;
    onCallFailed?: (event: any) => void;
}

interface CallCallbacks {
    onAudioDeviceChanged?: (event: any) => void;
    onAudioDeviceListChanged?: (event: any) => void;
    onCallFailed?: (event: any) => void;
    onCallDisconnected?: (event: any) => void;
    onCallConnected?: (event: any) => void;
    onCallEndpointAdded?: (event: any) => void;
    onCallLocalVideoStreamAdded?: (event: any) => void;
    onCallLocalVideoStreamRemoved?: (event: any) => void;
    onEndpointRemoteVideoStreamAdded?: (event: any) => void;
    onEndpointRemoteVideoStreamRemoved?: (event: any) => void;
    onEndpointRemoved?: (event: any) => void;
}

function mergeCallbacks<T>(obj1: T, obj2: T) {
    function customizer(fn1: (event: any) => void, fn2: (event: any) => void) {
        if (RA.isFunction(fn1) && RA.isFunction(fn2)) {
            return (event: any) => {
                fn1(event);
                fn2(event);
            };
        }

        return;
    }
    return R.mergeWith(customizer, obj1, obj2);
}

function setupCallListeners(
    call: Voximplant['Call'],
    callbacks: CallCallbacks | IncomingCallCallbacks,
    setup: boolean
) {
    Object.keys(Voximplant.CallEvents).forEach((eventName) => {
        const callbackName = `onCall${eventName}`;
        if (typeof callbacks[callbackName] !== 'undefined') {
            call[setup ? 'on' : 'off'](eventName, callbacks[callbackName]);
        }
    });
}

function setupAudioListeners(callbacks: CallCallbacks | IncomingCallCallbacks, setup: boolean) {
    Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
        const callbackName = `onAudio${eventName}`;
        if (typeof callbacks[callbackName] !== 'undefined') {
            Voximplant.Hardware.AudioDeviceManager.getInstance()[setup ? 'on' : 'off'](
                eventName,
                callbacks[callbackName]
            );
        }
    });
}

function setupEndpointListeners(
    endpoint: Voximplant['Endpoint'],
    callbacks: CallCallbacks | IncomingCallCallbacks,
    setup: boolean
) {
    Object.keys(Voximplant.EndpointEvents).forEach((eventName) => {
        const callbackName = `onEndpoint${eventName}`;
        if (typeof callbacks[callbackName] !== 'undefined') {
            endpoint[setup ? 'on' : 'off'](eventName, callbacks[callbackName]);
        }
    });
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

    public static async makeOutgoingCall(
        cursor: Cursor<RemoteData<Voximplant['Call']>>,
        username: string,
        displayName: string
    ): Promise<RemoteDataResult<Voximplant['Call']>> {
        cursor.set(loading);

        try {
            await this.requestPermissions(false);
            const { call } = await this.startOutgoingCall(username, displayName);
            const result = success(call);
            return result;
        } catch (err) {
            const result = failure(err);
            cursor.set(result);
            return result;
        }
    }

    public static async startOutgoingCall(username: string, displayName: string): Promise<Voximplant['Call']> {
        const call = await Voximplant.getInstance().call(username, {
            video: {
                sendVideo: false,
                receiveVideo: true,
            },
        });

        const instance = CallService.getInstance();
        instance.addCall(call, false);
        instance.startOutgoingCallViaCallKit(displayName);

        await instance.showCallScreen(call.callId, false);

        return call;
    }

    public static subscribeToIncomingCallEvents(callId: string, eventCallbacks: IncomingCallCallbacks): () => void {
        const call = CallService.getInstance().getCallById(callId);

        if (!call) {
            return () => {};
        }

        const callbacks = mergeCallbacks({}, eventCallbacks);
        setupCallListeners(call, callbacks, true);

        return () => {
            setupCallListeners(call, callbacks, false);
        };
    }

    public static subscribeToCallEvents(
        callId: string,
        isIncoming: boolean,
        eventCallbacks: CallCallbacks
    ): () => void {
        const call = CallService.getInstance().getCallById(callId);

        if (!call) {
            return () => {};
        }

        const callbacks = mergeCallbacks(
            {
                onCallEndpointAdded: (event: any) => {
                    setupEndpointListeners(event.endpoint, callbacks, true);
                },
                onEndpointRemoved: (event: any) => {
                    setupEndpointListeners(event.endpoint, callbacks, false);
                },
            },
            eventCallbacks
        );

        setupCallListeners(call, callbacks, true);
        setupAudioListeners(callbacks, true);

        if (isIncoming) {
            call.getEndpoints().forEach((endpoint: any) => {
                setupEndpointListeners(endpoint, callbacks, true);
            });
        }

        return () => {
            setupCallListeners(call, callbacks, false);
            setupAudioListeners(callbacks, false);
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

        AppState.addEventListener('change', instance.onAppStateChange);
        instance.client.on(Voximplant.ClientEvents.IncomingCall, instance.onIncomingCall);
        instance.passedShowIncomingCallScreen = showIncomingCallScreen;
        instance.passedShowCallScreen = showCallScreen;
    }

    public call: Voximplant['Call'] | null = null;
    public needToShowIncomingCallScreen = false;
    public passedShowIncomingCallScreen?: (passProps: ShowIncomingCallScreenProps) => void;
    public passedShowCallScreen?: (passProps: ShowCallScreenProps) => void;
    private readonly client: Voximplant['Instance'];
    private readonly callKitService: CallKitService;

    constructor() {
        this.client = Voximplant.getInstance();
        this.callKitService = new CallKitService();
    }

    public async showIncomingCallScreen(callId: string, callerDisplayName: string) {
        if (!this.passedShowIncomingCallScreen) {
            return;
        }

        await this.passedShowIncomingCallScreen({
            callId,
            callerDisplayName,
            answerCall: this.answerIncomingCall.bind(this),
            declineCall: this.declineCall.bind(this),
        });
    }

    public async showCallScreen(callId: string, isIncoming: boolean) {
        if (!this.passedShowCallScreen) {
            return;
        }

        await this.passedShowCallScreen({
            callId,
            isIncoming,
            sendAudio: this.sendAudio.bind(this),
            sendVideo: this.sendVideo.bind(this),
            sendTone: this.sendTone.bind(this),
            getAudioDevices: this.getAudioDevices.bind(this),
            setAudioDevice: this.setAudioDevice.bind(this),
            endCall: this.endCall.bind(this),
        });
    }

    public addCall(call: Voximplant['Call'], isIncoming: boolean) {
        console.log(`CallManager: addCall: ${call.callId}`);
        if (isIncoming) {
            call.on(Voximplant.CallEvents.Connected, this.onCallConnected);
        }
        call.on(Voximplant.CallEvents.Disconnected, this.onCallDisconnected);
        call.on(Voximplant.CallEvents.Failed, this.onCallFailed);

        this.call = call;
    }

    public removeCall(call: Voximplant['Call']) {
        console.log(`CallManager: removeCall: ${call.callId}`);
        if (this.call && this.call.callId === call.callId) {
            this.call.off(Voximplant.CallEvents.Connected, this.onCallConnected);
            this.call.off(Voximplant.CallEvents.Disconnected, this.onCallDisconnected);
            this.call.off(Voximplant.CallEvents.Failed, this.onCallFailed);
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
    }

    public async endCall() {
        console.log('CallManager: endCAll', this.call);
        if (!this.call) {
            return;
        }
        this.call.hangup();
    }

    public async declineCall() {
        console.log('CallManager: declineCall', this.call);
        if (!this.call) {
            return;
        }
        this.call.decline();
    }

    public async answerIncomingCall() {
        if (!this.call) {
            return;
        }

        this.call.answer({
            video: {
                sendVideo: false,
                receiveVideo: true,
            },
        });
        await this.showCallScreen(this.call.callId, true);
    }

    public async getAudioDevices() {
        return Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices();
    }

    public async setAudioDevice(device: string) {
        Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device);
    }

    public async sendTone(value: number) {
        if (this.call) {
            this.call.sendTone(value);
        }
    }

    public async sendVideo(send: boolean) {
        if (this.call) {
            this.call.sendVideo(send);
        }
    }

    public async sendAudio(send: boolean) {
        if (this.call) {
            this.call.sendAudio(send);
        }
    }

    public async showIncomingCallScreenOrNotification(event: any) {
        const callerDisplayName = event.call.getEndpoints()[0].displayName;

        if (Platform.OS === 'ios') {
            this.callKitService.showIncomingCall(
                event.call.callId,
                callerDisplayName,
                this.answerIncomingCall.bind(this),
                this.declineCall.bind(this)
            );
        } else {
            if (AppState.currentState !== 'active') {
                this.needToShowIncomingCallScreen = true;
                NativeModules.ActivityLauncher.openMainActivity();
            } else {
                await this.showIncomingCallScreen(event.call.callId, callerDisplayName);
            }
        }
    }

    public onIncomingCall = async (event: any) => {
        if (this.call !== null) {
            console.log(
                `CallManager: incomingCall: already have a call, rejecting new call, current call id: ${
                    this.call.callId
                }`
            );
            event.call.decline();
            return;
        }

        this.addCall(event.call, true);
        await this.showIncomingCallScreenOrNotification(event);
    };

    public onCallConnected = () => {
        if (this.call) {
            this.call.off(Voximplant.CallEvents.Connected, this.onCallConnected);
            this.callKitService.reportOutgoingCallConnected();
        }
    };

    public onCallDisconnected = (event: any) => {
        this.needToShowIncomingCallScreen = false;
        this.removeCall(event.call);
        this.callKitService.endCall();
    };

    public onCallFailed = (event: any) => {
        this.needToShowIncomingCallScreen = false;
        this.removeCall(event.call);
        this.callKitService.endCall();
    };

    public onAppStateChange = async (newState: string) => {
        console.log(`CallManager: _handleAppStateChange: Current app state changed to ${newState}`);
        if (newState === 'active' && this.needToShowIncomingCallScreen && this.call !== null) {
            this.needToShowIncomingCallScreen = false;
            await this.showIncomingCallScreen(this.call.callId, this.call.getEndpoints()[0].displayName);
        }
    };
}

declare module 'react-native-voximplant' {
    import * as React from 'react';

    interface Instance {
        getCallById: (id: string) => Call;
        on: (eventName: string, callback: (event: Event) => void) => void;
        off: (eventName: string, callback: (event: Event) => void) => void;
        handlePushNotification: (notification: any) => void;
        registerPushNotificationsToken: (token: string) => void;
        unregisterPushNotificationsToken: (token: string) => void;
        disconnect: () => void;
        call: (username: string, config: object) => Call;
        connect: () => void;
        getClientState: () => string;
        login: () => void;
        loginWithToken: (fullUserName: string, accessToken: string) => { tokens: LoginTokens };
        loginWithOneTimeKey: (fullUserName: string, hash: string) => { tokens: LoginTokens };
        requestOneTimeLoginKey: (fullUserName: string) => { oneTimeKey: string };
    }

    interface Endpoint {
        on: (eventName: string, callback: (event: Event) => void) => void;
        off: (eventName: string, callback: (event: Event) => void) => void;
    }

    interface Event {}

    interface Call {
        callId: string;
        decline: () => void;
        hangup: () => void;
        answer: (config: any) => void;
        sendTone: (num: number) => void;
        sendAudio: (send: boolean) => void;
        sendVideo: (send: boolean) => void;
        getEndpoints: () => Endpoint[];
        on: (eventName: string, callback: (event: Event) => void) => void;
        off: (eventName: string, callback: (event: Event) => void) => void;
    }

    interface AudioDeviceManager {
        on: (eventName: string, callback: (event: Event) => void) => void;
        off: (eventName: string, callback: (event: Event) => void) => void;
        selectAudioDevice: (device: string) => void;
        getAudioDevices: () => string[];
        callKitStartAudio: () => void;
        callKitStopAudio: () => void;
        callKitReleaseAudioSession: () => void;
        callKitConfigureAudioSession: () => void;
    }

    interface AudioDevice {
        [x: string]: string;
    }

    interface Hardware {
        AudioDevice: AudioDevice;
        AudioDeviceEvents: object;
        AudioDeviceManager: {
            getInstance: () => AudioDeviceManager;
        };
    }

    interface RenderScaleType {
        [x: string]: string;
    }

    interface ClientEvents {
        [x: string]: string;
    }

    interface EndpointEvents {
        [x: string]: string;
    }

    interface CallEvents {
        [x: string]: string;
    }

    interface ClientState {
        [x: string]: string;
    }

    interface LoginTokens {
        [x: string]: string;
    }

    interface Voximplant {
        Instance: Instance;
        getInstance: () => Instance;
        Hardware: Hardware;
        CallEvents: CallEvents;
        EndpointEvents: EndpointEvents;
        ClientEvents: ClientEvents;
        ClientState: ClientState;
        Endpoint: Endpoint;
        Call: Call;
        VideoView: React.ComponentClass<any, any>;
        RenderScaleType: RenderScaleType;
        LoginTokens: LoginTokens;
    }

    export const Voximplant: Voximplant;
}

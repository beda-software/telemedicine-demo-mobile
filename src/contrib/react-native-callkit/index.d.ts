declare module 'react-native-callkit' {
    interface RNCallKitOptions {
        appName: string;
    }

    interface RNCallKit {
        setup: (options: RNCallKitOptions) => void;
        addEventListener: (eventName: string, callback: (event: any) => void) => void;
        displayIncomingCall: (uuid: string, displayName: string, type: string, withVideo: boolean) => void;
        startCall: (uuid: string, displayName: string, type: string, withVideo: boolean) => void;
        reportConnectedOutgoingCallWithUUID: (uuid: string) => void;
        endCall: (uuid: string) => void;
    }

    const RNCallKit: RNCallKit;

    export default RNCallKit;
}

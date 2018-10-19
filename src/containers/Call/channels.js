import { Voximplant } from 'react-native-voximplant';
import RNCallKit from 'react-native-callkit';
import { END, eventChannel } from 'redux-saga';

export function createAudioDeviceChannel() {
    const instance = Voximplant.Hardware.AudioDeviceManager.getInstance();

    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
        };

        Object.keys(Voximplant.Hardware.AudioDeviceEvents)
            .forEach((eventName) => instance.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.Hardware.AudioDeviceEvents)
                .forEach((eventName) => instance.off(eventName, handler));
        };
    });
}

export function createCallKitChannel() {
    return eventChannel((emit) => {
        const answerCallHandler = (event) => {
            emit({ name: 'AnswerCall', ...event });
        };

        const endCallHandler = (event) => {
            emit({ name: 'EndCall', ...event });
        };

        const didActivateAudioSessionHandler = (event) => {
            emit({ name: 'DidActivateAudioSession', ...event });
        };

        const didDisplayIncomingCall = (event) => {
            emit({ name: 'DidDisplayIncomingCall', ...event });
        };

        const didReceiveStartCallAction = (event) => {
            emit({ name: 'DidReceiveStartCallAction', ...event });
        };

        RNCallKit.addEventListener('didReceiveStartCallAction', didReceiveStartCallAction);
        RNCallKit.addEventListener('answerCall', answerCallHandler);
        RNCallKit.addEventListener('endCall', endCallHandler);
        RNCallKit.addEventListener('didActivateAudioSession', didActivateAudioSessionHandler);
        RNCallKit.addEventListener('didDisplayIncomingCall', didDisplayIncomingCall);
        // RNCallKit.addEventListener('didPerformSetMutedCallAction', handler);

        return () => {
            RNCallKit.removeEventListener('answerCall', answerCallHandler);
            RNCallKit.removeEventListener('endCall', endCallHandler);
            RNCallKit.removeEventListener('didActivateAudioSession', didActivateAudioSessionHandler);
            RNCallKit.removeEventListener('didDisplayIncomingCall', didDisplayIncomingCall);
            RNCallKit.removeEventListener('didReceiveStartCallAction', didReceiveStartCallAction);
        };
    });
}

export function createCallChannel(activeCall) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
            if (event.name === Voximplant.CallEvents.Failed || event.name === Voximplant.CallEvents.Disconnected) {
                emit(END);
            }
        };

        Object.keys(Voximplant.CallEvents)
            .forEach((eventName) => activeCall.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.CallEvents)
                .forEach((eventName) => activeCall.off(eventName, handler));
        };
    });
}

export function createEndpointChannel(endpoint) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
            if (event.name === Voximplant.EndpointEvents.Removed) {
                emit(END);
            }
        };

        Object.keys(Voximplant.EndpointEvents)
            .forEach((eventName) => endpoint.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.EndpointEvents)
                .forEach((eventName) => endpoint.off(eventName, handler));
        };
    });
}

export function createIncomingCallChannel() {
    const client = Voximplant.getInstance();

    return eventChannel((emit) => {
        const incomingCallHandler = (event) => {
            emit(event.call);
        };
        client.on(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);

        return () => {
            client.off(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);
        };
    });
}

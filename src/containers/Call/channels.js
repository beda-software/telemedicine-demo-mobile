import { eventChannel } from 'redux-saga';
import { Voximplant } from 'react-native-voximplant';

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

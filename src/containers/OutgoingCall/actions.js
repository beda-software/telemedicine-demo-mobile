import {
    SUBSCRIBE_TO_CALL_EVENTS,
    UNSUBSCRIBE_FROM_CALL_EVENTS,
    SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS,
    UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS,
    SET_CALL_STATUS,
    CALL_STATUS_CONNECTING,
    MUTE_AUDIO,
    SEND_VIDEO,
    HOLD,
    RECEIVE_VIDEO,
    END_CALL,
    TOGGLE_KEYPAD,
    SWITCH_AUDIO_DEVICE,
    SELECT_AUDIO_DEVICE,
} from './constants';

export function subscribeToCallEvents() {
    return {
        type: SUBSCRIBE_TO_CALL_EVENTS,
    };
}

export function unsubscribeFromCallEvents() {
    return {
        type: UNSUBSCRIBE_FROM_CALL_EVENTS,
    };
}

export function subscribeToAudioDeviceEvents() {
    return {
        type: SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS,
    };
}

export function unsubscribeFromAudioDeviceEvents() {
    return {
        type: UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS,
    };
}

export function setCallStatusConnecting() {
    return {
        type: SET_CALL_STATUS,
        callStatus: CALL_STATUS_CONNECTING,
    };
}

export function muteAudio() {
    return {
        type: MUTE_AUDIO,
    };
}

export function sendVideo() {
    return {
        type: SEND_VIDEO,
    };
}

export function hold() {
    return {
        type: HOLD,
    };
}

export function receiveVideo() {
    return {
        type: RECEIVE_VIDEO,
    };
}

export function endCall() {
    return {
        type: END_CALL,
    };
}

export function toggleKeypad() {
    return {
        type: TOGGLE_KEYPAD,
    };
}

export function switchAudioDevice() {
    return {
        type: SWITCH_AUDIO_DEVICE,
    };
}

export function switchAudioDevice(device) {
    return {
        type: SELECT_AUDIO_DEVICE,
        device
    };
}

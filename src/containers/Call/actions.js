import {
    SUBSCRIBE_TO_CALL_EVENTS,
    UNSUBSCRIBE_FROM_CALL_EVENTS,
    SUBSCRIBE_TO_AUDIO_DEVICE_EVENTS,
    UNSUBSCRIBE_FROM_AUDIO_DEVICE_EVENTS,
    SET_CALL_STATUS,
    CALL_STATUS_CONNECTING,
    TOGGLE_AUDIO_MUTE,
    TOGGLE_VIDEO_SEND,
    HOLD,
    RECEIVE_VIDEO,
    END_CALL,
    TOGGLE_KEYPAD,
    SWITCH_AUDIO_DEVICE,
    SELECT_AUDIO_DEVICE,

    CALL_FAILED,
    CALL_DISCONNECTED,
} from './constants';

export function subscribeToCallEvents(call) {
    return {
        type: SUBSCRIBE_TO_CALL_EVENTS,
        call,
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

export function toggleAudioMute() {
    return {
        type: TOGGLE_AUDIO_MUTE,
    };
}

export function toggleVideoSend() {
    return {
        type: TOGGLE_VIDEO_SEND,
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

export function selectAudioDevice(device) {
    return {
        type: SELECT_AUDIO_DEVICE,
        device,
    };
}

export function callFailed() {
    return {
        type: CALL_FAILED,
    };
}

export function callDisconnected() {
    return {
        type: CALL_DISCONNECTED,
    };
}

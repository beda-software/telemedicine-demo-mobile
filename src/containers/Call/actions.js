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
    CALL_LOCAL_VIDEO_STREAM_CHANGED,
    ENDPOINT_ADDED,
    ENDPOINT_REMOVED,
    ENDPOINT_REMOTE_VIDEO_STREAM_CHANGED,

    DEVICE_CHANGED,
    DEVICE_LIST_CHANGED,
} from './constants';

export function subscribeToCallEvents(call, isIncoming) {
    return {
        type: SUBSCRIBE_TO_CALL_EVENTS,
        call,
        isIncoming,
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

export function toggleAudioMute(call, isAudioMuted) {
    return {
        type: TOGGLE_AUDIO_MUTE,
        call,
        isAudioMuted,
    };
}

export function toggleVideoSend(call, isVideoBeingSent) {
    return {
        type: TOGGLE_VIDEO_SEND,
        call,
        isVideoBeingSent,
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

export function endCall(call) {
    return {
        type: END_CALL,
        call,
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


export function callLocalVideoStreamChanged(stream) {
    return {
        type: CALL_LOCAL_VIDEO_STREAM_CHANGED,
        stream,
    };
}

export function endpointAdded(endpoint) {
    return {
        type: ENDPOINT_ADDED,
        endpoint,
    };
}

export function endpointRemoved(endpoint) {
    return {
        type: ENDPOINT_REMOVED,
        endpoint,
    };
}

export function endpointRemoveVideoStreamChanged(stream) {
    return {
        type: ENDPOINT_REMOTE_VIDEO_STREAM_CHANGED,
        stream,
    };
}

export function deviceChanged(currentDevice) {
    return {
        type: DEVICE_CHANGED,
        currentDevice,
    };
}

export function deviceListChanged(newDeviceList) {
    return {
        type: DEVICE_LIST_CHANGED,
        newDeviceList,
    };
}

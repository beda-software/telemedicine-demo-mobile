import {
    ANSWER_CALL,
    DECLINE_CALL,
    INCOMING_CALL,
} from './constants';

export function answerCall(call) {
    return {
        type: ANSWER_CALL,
        call,
        isVideo: false,
    };
}

export function answerVideoCall(call) {
    return {
        type: ANSWER_CALL,
        call,
        isVideo: true,
    };
}

export function declineCall(call) {
    return {
        type: DECLINE_CALL,
        call,
    };
}

export function incomingCall(call) {
    return {
        type: INCOMING_CALL,
        call,
    };
}

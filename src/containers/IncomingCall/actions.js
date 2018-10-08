import {
    ANSWER_CALL,
    DECLINE_CALL,
} from './constants';

export function answerCall() {
    return {
        type: ANSWER_CALL,
        isVideo: false,
    };
}

export function answerVideoCall() {
    return {
        type: ANSWER_CALL,
        isVideo: true,
    };
}

export function declineCall() {
    return {
        type: DECLINE_CALL,
    };
}

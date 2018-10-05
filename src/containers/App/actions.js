import { SAVE_AUTH_TOKENS, LOGOUT, MAKE_CALL } from './constants';

export function saveAuthTokens(tokens) {
    return {
        type: SAVE_AUTH_TOKENS,
        tokens,
    };
}

export function logout() {
    return {
        type: LOGOUT,
    };
}


export function makeCall(callTo) {
    return {
        type: MAKE_CALL,
        callTo,
    };
}

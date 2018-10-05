import {
    SAVE_AUTH_TOKENS,
    SAVE_API_TOKEN,
    LOGOUT,
    MAKE_CALL,
    LOAD_USERS,
    UPDATE_USER_LIST,
} from './constants';

export function saveAuthTokens(tokens) {
    return {
        type: SAVE_AUTH_TOKENS,
        tokens,
    };
}

export function updateUserList(userList) {
    return {
        type: UPDATE_USER_LIST,
        userList,
    };
}

export function saveApiToken(apiToken) {
    return {
        type: SAVE_API_TOKEN,
        apiToken,
    };
}

export function logout() {
    return {
        type: LOGOUT,
    };
}

export function loadUsers() {
    return {
        type: LOAD_USERS,
    };
}

export function makeCall(callTo) {
    return {
        type: MAKE_CALL,
        callTo,
    };
}

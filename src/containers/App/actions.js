import {
    SAVE_AUTH_TOKENS,
    SAVE_API_TOKEN,
    SAVE_CONTACT_LIST,
    LOGOUT,
    MAKE_CALL,
    MAKE_VIDEO_CALL,
    FETCH_CONTACTS,
} from './constants';

export function saveAuthTokens(tokens) {
    return {
        type: SAVE_AUTH_TOKENS,
        tokens,
    };
}

export function saveContactList(contactList) {
    return {
        type: SAVE_CONTACT_LIST,
        contactList,
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

export function fetchContacts() {
    return {
        type: FETCH_CONTACTS,
    };
}

export function makeCall(contactUsername) {
    return {
        type: MAKE_CALL,
        contactUsername,
    };
}

export function makeVideoCall(contactUsername) {
    return {
        type: MAKE_VIDEO_CALL,
        contactUsername,
    };
}

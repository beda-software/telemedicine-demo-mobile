import { SIGN_UP, SIGN_UP_SUCCESS, SIGN_UP_FAILED, HIDE_MODAL } from './constants';

export function signUp(values) {
    return {
        type: SIGN_UP,
        values,
    };
}

export function signUpSuccess() {
    return {
        type: SIGN_UP_SUCCESS,
    };
}

export function signUpFailed(error) {
    return {
        type: SIGN_UP_FAILED,
        error,
    };
}

export function hideModal() {
    return {
        type: HIDE_MODAL,
    };
}

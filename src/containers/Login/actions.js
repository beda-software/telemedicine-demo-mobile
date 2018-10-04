import { LOGIN, LOGIN_SUCCESS, LOGIN_FAILED } from './constants';

export function login(values) {
    return {
        type: LOGIN,
        values,
    };
}

export function loginSuccess() {
    return {
        type: LOGIN_SUCCESS,
    };
}

export function loginFailed(error) {
    return {
        type: LOGIN_FAILED,
        error,
    };
}

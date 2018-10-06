import { LOGIN, LOGIN_SUCCESS, LOGIN_FAILED, VOX_IMPLANT_LOGIN } from './constants';

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

export function voxImplantLogin() {
    return {
        type: VOX_IMPLANT_LOGIN,
    };
}

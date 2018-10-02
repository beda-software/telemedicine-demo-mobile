import { SIGN_UP } from './constants';

export function signUp(values) {
    return {
        type: SIGN_UP,
        values,
    };
}

import { LOGIN } from './constants';

export function login(values) {
    return {
        type: LOGIN,
        values,
    };
}

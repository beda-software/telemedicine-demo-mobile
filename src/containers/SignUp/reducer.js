import { SIGN_UP_SUCCESS, SIGN_UP_FAILED } from './constants';

const initialState = {};

export default function signUpReducer(state = initialState, action) {
    switch (action.type) {
    case SIGN_UP_FAILED:
        console.log('Sign up failed: ', action.error);
        return state;
        case SIGN_UP_SUCCESS:
        console.log('Sign up success');
        // TODO: redirect
        return state;
    default:
        return state;
    }
}

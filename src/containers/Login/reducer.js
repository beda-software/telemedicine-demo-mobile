import { LOGIN_SUCCESS, LOGIN_FAILED, SAVE_AUTH_TOKENS } from './constants';
import DefaultPreference from 'react-native-default-preference';

const initialState = {};

export default function loginReducer(state = initialState, action) {
    switch (action.type) {
    case LOGIN_FAILED:
        console.log('Login failed: ', action.error);
        return state;
    case LOGIN_SUCCESS:
        console.log('Login success');
        return state;
    default:
        return state;
    }
}

import { SIGN_UP } from './constants';

const initialState = {};

export default function signUpReducer(state = initialState, action) {
    switch (action.type) {
    case SIGN_UP:
        console.log('signUpReducer STATE: ', action.values);
        return state;
    default:
        return state;
    }
}

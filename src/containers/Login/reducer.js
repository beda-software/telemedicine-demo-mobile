import { LOGIN } from './constants';

const initialState = {};

export default function loginReducer(state = initialState, action) {
    switch (action.type) {
    case LOGIN:
        console.log('loginReducer STATE: ', action.values);
        return state;
    default:
        return state;
    }
}

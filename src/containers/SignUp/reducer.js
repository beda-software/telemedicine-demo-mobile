import { SIGN_UP_SUCCESS, SIGN_UP_FAILED, HIDE_MODAL } from './constants';

const initialState = {
    isModalVisible: false,
    modalText: '',
};

export default function signUpReducer(state = initialState, action) {
    switch (action.type) {
    case SIGN_UP_FAILED:
        return {
            ...state,
            isModalVisible: true,
            modalText: action.error.msg,
        };
    case SIGN_UP_SUCCESS:
        return {
            ...state,
            isModalVisible: true,
            modalText: 'You\'ve sucessfully registered. Please go to login page and input your credentials.',
        };
    case HIDE_MODAL:
        return {
            ...state,
            isModalVisible: false,
        };
    default:
        return state;
    }
}

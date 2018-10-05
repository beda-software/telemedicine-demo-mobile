import { LOGIN_SUCCESS, LOGIN_FAILED, HIDE_MODAL } from './constants';

const initialState = {
    isModalVisible: false,
    modalText: '',
};

export default function loginReducer(state = initialState, action) {
    switch (action.type) {
    case LOGIN_FAILED:
        console.log(action.error)
        return {
            ...state,
            isModalVisible: true,
            modalText: action.error.msg,
        };
    case LOGIN_SUCCESS:
        return state;
    case HIDE_MODAL:
        return {
            ...state,
            isModalVisible: false,
        };
    default:
        return state;
    }
}

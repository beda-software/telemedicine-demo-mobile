import {
    SAVE_VOX_IMPLANT_TOKENS,
    SAVE_API_TOKEN,
    SAVE_USERNAME,
    LOGOUT,
    SAVE_CONTACT_LIST,
    SHOW_MODAL,
    HIDE_MODAL,
    SET_ACTIVE_CALL,
} from './constants';

const initialState = {
    isModalVisible: false,
    modalText: '',
};

export default function appReducer(state = initialState, action) {
    switch (action.type) {
    case SAVE_API_TOKEN: {
        const { apiToken } = action;
        return {
            ...state,
            apiToken,
        };
    }
    case SAVE_USERNAME: {
        const { username } = action;
        return {
            ...state,
            username,
        };
    }
    case SAVE_VOX_IMPLANT_TOKENS: {
        const { tokens } = action;

        // TODO: move to SAGA
        // DefaultPreference.set('accessToken', tokens.accessToken);
        // DefaultPreference.set('refreshToken', tokens.refreshToken);
        // DefaultPreference.set('accessExpire', tokens.accessExpire.toString());
        // DefaultPreference.set('refreshExpire', tokens.refreshExpire.toString());
        return {
            ...state,
            tokens,
        };
    }
    case SAVE_CONTACT_LIST: {
        const { contactList } = action;
        return {
            ...state,
            contactList,
        };
    }
    case LOGOUT: {
        return {
            ...state,
            tokens: {},
            apiToken: {},
        };
    }
    case SHOW_MODAL: {
        return {
            ...state,
            isModalVisible: true,
            modalText: action.text,
        };
    }
    case HIDE_MODAL: {
        return {
            ...state,
            isModalVisible: false,
        };
    }
    case SET_ACTIVE_CALL: {
        const { activeCall } = action;
        return {
            ...state,
            activeCall,
        };
    }
    default:
        return state;
    }
}

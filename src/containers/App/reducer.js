import {
    SAVE_AUTH_TOKENS,
    SAVE_API_TOKEN,
    LOGOUT,
    UPDATE_USER_LIST,
} from './constants';

export default function appReducer(state = {}, action) {
    switch (action.type) {
    case SAVE_API_TOKEN: {
        const { apiToken } = action;
        return {
            ...state,
            apiToken,
        };
    }
    case SAVE_AUTH_TOKENS: {
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
    case UPDATE_USER_LIST: {
        const { userList } = action;
        return {
            ...state,
            userList,
        };
    }
    case LOGOUT: {
        return {
            ...state,
            tokens: {},
            apiToken: {},
        };
    }
    default:
        return state;
    }
}

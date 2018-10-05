import { SAVE_AUTH_TOKENS, LOGOUT } from './constants';

export default function appReducer(state = {}, action) {
    switch (action.type) {
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
    case LOGOUT: {
        return {
            ...state,
            tokens: {},
        };
    }
    default:
        return state;
    }
}

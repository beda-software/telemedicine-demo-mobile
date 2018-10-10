import { createReducer } from 'redux-act';

import {
    saveVoxImplantTokens,
    saveApiToken,
    saveUsername,
    logout,
    setActiveCall,
} from './actions';

const initialState = {
    username: null,
    apiToken: null,
    tokens: null,
    activeCall: null,
};

export default createReducer({
    [saveApiToken]: (state, { apiToken }) => ({
        ...state,
        apiToken,
    }),
    [saveUsername]: (state, { username }) => ({
        ...state,
        username,
    }),
    [saveVoxImplantTokens]: (state, { tokens }) => ({
        // TODO: move to SAGA
        // DefaultPreference.set('accessToken', tokens.accessToken);
        // DefaultPreference.set('refreshToken', tokens.refreshToken);
        // DefaultPreference.set('accessExpire', tokens.accessExpire.toString());
        // DefaultPreference.set('refreshExpire', tokens.refreshExpire.toString());
        ...state,
        tokens,
    }),
    [logout]: (state) => ({
        ...state,
        tokens: null,
        apiToken: null,
    }),
    [setActiveCall]: (state, { activeCall }) => ({
        ...state,
        activeCall,
    }),
}, initialState);

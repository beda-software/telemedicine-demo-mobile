import { createReducer } from 'redux-act';

import {
    saveVoxImplantTokens,
    saveApiToken,
    savePushToken,
    saveUsername,
    logout,
    setActiveCall,
    appStateChanged,
} from './actions';

const initialState = {
    username: '',
    apiToken: null,
    pushToken: null,
    voxImplantTokens: {},
    activeCall: null,
    appState: 'active',
};

export default createReducer({
    [saveApiToken]: (state, { apiToken }) => ({
        ...state,
        apiToken,
    }),
    [savePushToken]: (state, { pushToken }) => ({
        ...state,
        pushToken,
    }),
    [saveUsername]: (state, { username }) => ({
        ...state,
        username,
    }),
    [saveVoxImplantTokens]: (state, { voxImplantTokens }) => ({
        // TODO: move to SAGA
        // DefaultPreference.set('accessToken', tokens.accessToken);
        // DefaultPreference.set('refreshToken', tokens.refreshToken);
        // DefaultPreference.set('accessExpire', tokens.accessExpire.toString());
        // DefaultPreference.set('refreshExpire', tokens.refreshExpire.toString());
        ...state,
        voxImplantTokens,
    }),
    [logout]: (state) => ({
        ...state,
        voxImplantTokens: {},
        apiToken: null,
        pushToken: null,
        activeCall: null,
        username: '',
    }),
    [setActiveCall]: (state, { activeCall }) => ({
        ...state,
        activeCall,
    }),
    [appStateChanged]: (state, { appState }) => ({
        ...state,
        appState,
    }),
}, initialState);

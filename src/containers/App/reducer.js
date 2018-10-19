import { AppState } from 'react-native';
import { createReducer } from 'redux-act';

import {
    saveVoxImplantTokens,
    saveApiToken,
    savePushToken,
    saveUsername,
    logout,
    setAppInitializedStatus,
} from './actions';

const initialState = {
    username: '',
    apiToken: null,
    pushToken: null,
    voxImplantTokens: {},
    appState: AppState.currentState,
    isAppInitialized: false,
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
        ...state,
        voxImplantTokens,
    }),
    [logout]: (state) => ({
        ...state,
        voxImplantTokens: {},
        apiToken: null,
        pushToken: null,
        username: '',
    }),
    [setAppInitializedStatus]: (state, { isAppInitialized }) => ({
        ...state,
        isAppInitialized,
    }),
}, initialState);

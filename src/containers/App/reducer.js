import { createReducer } from 'redux-act';

import {
    saveVoxImplantTokens,
    saveApiToken,
    saveUsername,
    logout,
    saveContactList,
    showModal,
    hideModal,
    showPreloader,
    hidePreloader,
    setActiveCall,
} from './actions';

const initialState = {
    isModalVisible: false,
    isPreloaderVisible: false,
    modalText: '',
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
    [saveContactList]: (state, { contactList }) => ({
        ...state,
        contactList,
    }),
    [logout]: (state) => ({
        ...state,
        tokens: {},
        apiToken: {},
    }),
    [showModal]: (state, { text }) => ({
        ...state,
        isModalVisible: true,
        modalText: text,
    }),
    [hideModal]: (state) => ({
        ...state,
        isModalVisible: false,
    }),
    [showPreloader]: (state) => ({
        ...state,
        isPreloaderVisible: true,
    }),
    [hidePreloader]: (state) => ({
        ...state,
        isPreloaderVisible: false,
    }),
    [setActiveCall]: (state, { activeCall }) => ({
        ...state,
        activeCall,
    }),
}, initialState);

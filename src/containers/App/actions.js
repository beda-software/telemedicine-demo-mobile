import { createAction } from 'redux-act';

export const saveVoxImplantTokens = createAction((tokens) => ({ tokens }));
export const saveContactList = createAction((contactList) => ({ contactList }));
export const saveApiToken = createAction((apiToken) => ({ apiToken }));
export const saveUsername = createAction((username) => ({ username }));
export const logout = createAction();
export const initApp = createAction();
export const deinitApp = createAction();
export const showModal = createAction((text) => ({ text }));
export const hideModal = createAction();
export const showPreloader = createAction();
export const hidePreloader = createAction();
export const setActiveCall = createAction((activeCall) => ({ activeCall }));

// Events actions
export const incomingCallReceived = createAction((call) => ({ call }));
export const appStateChanged = createAction((newState) => ({ newState }));

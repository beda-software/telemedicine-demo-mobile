import { createAction } from 'redux-act';

export const saveVoxImplantTokens = createAction((voxImplantTokens) => ({ voxImplantTokens }));
export const saveApiToken = createAction((apiToken) => ({ apiToken }));
export const savePushToken = createAction((pushToken) => ({ pushToken }));
export const saveUsername = createAction((username) => ({ username }));
export const logout = createAction();
export const initApp = createAction();
export const deinitApp = createAction();
export const setActiveCall = createAction((activeCall) => ({ activeCall }));

// Events actions
export const pushNotificationReceived = createAction((notification) => ({ notification }));
export const incomingCallReceived = createAction((call) => ({ call }));
export const appStateChanged = createAction((appState) => ({ appState }));

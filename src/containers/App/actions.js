import { createAction } from 'redux-act';

export const saveVoxImplantTokens = createAction((voxImplantTokens) => ({ voxImplantTokens }));
export const saveApiToken = createAction((apiToken) => ({ apiToken }));
export const savePushToken = createAction((pushToken) => ({ pushToken }));
export const saveUsername = createAction((username) => ({ username }));
export const logout = createAction();
export const initApp = createAction();
export const setAppInitializedStatus = createAction((isAppInitialized) => ({ isAppInitialized }));

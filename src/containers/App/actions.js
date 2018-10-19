import { createAction } from 'redux-act';

export const saveVoxImplantTokens = createAction((voxImplantTokens) => ({ voxImplantTokens }));
export const saveApiToken = createAction((apiToken) => ({ apiToken }));
export const savePushToken = createAction((pushToken) => ({ pushToken }));
export const saveUsername = createAction((username) => ({ username }));
export const logout = createAction();
export const initApp = createAction();
export const deinitApp = createAction();
export const setAppInitializedStatus = createAction((isAppInitialized) => ({ isAppInitialized }));

export const answerCall = createAction((isVideo) => ({ isVideo }));
export const endCall = createAction();
export const makeCall = createAction(
    (contactUsername, isVideo) => ({ contactUsername, isVideo })
);
export const saveCallerDisplayName = createAction((callerDisplayName) => ({ callerDisplayName }));

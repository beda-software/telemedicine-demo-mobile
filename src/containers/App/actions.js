import { createAction } from 'redux-act';

export const saveVoxImplantTokens = createAction((tokens) => ({ tokens }));
export const saveContactList = createAction((contactList) => ({ contactList }));
export const saveApiToken = createAction((apiToken) => ({ apiToken }));
export const saveUsername = createAction((username) => ({ username }));
export const logout = createAction();
export const initApp = createAction();
export const deinitApp = createAction();
export const fetchContacts = createAction();
export const showModal = createAction((text) => ({ text }));
export const hideModal = createAction();
export const setActiveCall = createAction((activeCall) => ({ activeCall }));

export const makeCall = createAction(
    (contactUsername) => ({ contactUsername, isVideo: false })
);
export const makeVideoCall = createAction(
    (contactUsername) => ({ contactUsername, isVideo: true })
);

// Events actions
export const incomingCallReceived = createAction((call) => ({ call }));

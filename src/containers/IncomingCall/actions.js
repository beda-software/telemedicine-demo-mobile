import { createAction } from 'redux-act';

export const subscribeToIncomingCallEvents = createAction((call) => ({ call }));
export const unsubscribeFromIncomingCallEvents = createAction();
export const answerCall = createAction((call) => ({ call, isVideo: false }));
export const answerVideoCall = createAction((call) => ({ call, isVideo: true }));
export const declineCall = createAction((call) => ({ call }));
export const saveCallerDisplayName = createAction((callerDisplayName) => ({ callerDisplayName }));

// Events actions
export const incomingCallDisconnected = createAction();
export const endpointAdded = createAction((endpoint) => ({ endpoint }));

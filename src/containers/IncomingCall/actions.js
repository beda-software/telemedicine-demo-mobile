import { createAction } from 'redux-act';

export const answerCall = createAction((call) => ({ call, isVideo: false }));
export const answerVideoCall = createAction((call) => ({ call, isVideo: true }));
export const declineCall = createAction((call) => ({ call }));
export const incomingCall = createAction((call) => ({ call }));

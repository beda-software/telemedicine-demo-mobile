import { createSelector } from 'reselect';

const selectIncomingCall = (state) => state.incomingCall;

export const selectCallerDisplayName = createSelector(
    selectIncomingCall,
    (incomingCallState) => incomingCallState.callerDisplayName,
);

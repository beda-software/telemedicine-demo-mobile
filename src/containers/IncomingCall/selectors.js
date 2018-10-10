import { createSelector } from 'reselect';

const selectIncomingCall = (state) => state.incomingCall;

export function makeSelectCallerDisplayName() {
    return createSelector(selectIncomingCall, (incomingCallState) => incomingCallState.callerDisplayName);
}

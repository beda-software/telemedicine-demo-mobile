import { createSelector } from 'reselect';

const selectGlobal = (state) => state.global;

export const selectApiToken = createSelector(selectGlobal, (globalState) => globalState.apiToken);

export const selectUsername = createSelector(selectGlobal, (globalState) => globalState.username);

export const selectActiveCall = createSelector(selectGlobal, (globalState) => globalState.activeCall);

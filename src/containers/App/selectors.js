import { createSelector } from 'reselect';

const selectGlobal = (state) => state.global;

export const selectApiToken = createSelector(selectGlobal, (globalState) => globalState.apiToken);

export const selectPushToken = createSelector(selectGlobal, (globalState) => globalState.pushToken);

export const selectVoxImplantTokens = createSelector(selectGlobal, (globalState) => globalState.voxImplantTokens);

export const selectUsername = createSelector(selectGlobal, (globalState) => globalState.username);

export const selectActiveCall = createSelector(selectGlobal, (globalState) => globalState.activeCall);

export const selectAppState = createSelector(selectGlobal, (globalState) => globalState.appState);

export const selectIsAppInitialized = createSelector(selectGlobal, (globalState) => globalState.isAppInitialized);

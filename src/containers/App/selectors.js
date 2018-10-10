import { createSelector } from 'reselect';

const selectGlobal = (state) => state.global;

export const selectApiToken = createSelector(selectGlobal, (globalState) => globalState.apiToken);

export const selectUsername = createSelector(selectGlobal, (globalState) => globalState.username);

export const selectActiveCall = createSelector(selectGlobal, (globalState) => globalState.activeCall);

export const selectIsPreloaderVisible = createSelector(
    selectGlobal,
    (globalState) => globalState.isPreloaderVisible
);

export const selectIsModalVisible = createSelector(
    selectGlobal,
    (globalState) => globalState.isModalVisible
);

export const selectModalText = createSelector(
    selectGlobal,
    (globalState) => globalState.modalText
);

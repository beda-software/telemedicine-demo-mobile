import { createSelector } from 'reselect';

const selectGlobal = (state) => state.global;

export function makeSelectApiToken() {
    return createSelector(selectGlobal, (globalState) => globalState.apiToken);
}

export function makeSelectUsername() {
    return createSelector(selectGlobal, (globalState) => globalState.username);
}

export function makeSelectContactList() {
    return createSelector(selectGlobal, (globalState) => globalState.contactList);
}

export function makeSelectActiveCall() {
    return createSelector(selectGlobal, (globalState) => globalState.activeCall);
}

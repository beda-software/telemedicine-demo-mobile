import { createSelector } from 'reselect';

const selectGlobal = (state) => state.global;

function makeSelectApiToken() {
    return createSelector(selectGlobal, (globalState) => globalState.apiToken);
}

function makeSelectUsername() {
    return createSelector(selectGlobal, (globalState) => globalState.username);
}

function makeSelectContactList() {
    return createSelector(selectGlobal, (globalState) => globalState.contactList);
}

export {
    makeSelectApiToken,
    makeSelectContactList,
    makeSelectUsername,
};

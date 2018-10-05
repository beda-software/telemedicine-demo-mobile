import { createSelector } from 'reselect';

const selectApiToken = state => state.global;
const selectContactList = state => state.global;

const makeSelectApiToken = () =>
    createSelector(selectApiToken, globalState => globalState.apiToken);

const makeSelectContactList = () =>
    createSelector(selectContactList, globalState => globalState.contactList);

export {
    selectApiToken,
    makeSelectApiToken,
    selectContactList,
    makeSelectContactList,
};

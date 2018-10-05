import { createSelector } from 'reselect';

const selectApiToken = state => state.global;
const selectUserList = state => state.global;

const makeSelectApiToken = () =>
    createSelector(selectApiToken, globalState => globalState.apiToken);

const makeSelectUserList = () =>
    createSelector(selectUserList, globalState => globalState.userList);

export {
    selectApiToken,
    makeSelectApiToken,
    selectUserList,
    makeSelectUserList,
};

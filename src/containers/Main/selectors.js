import { createSelector } from 'reselect';
import { selectUsername } from 'containers/App/selectors';

const selectMain = (state) => state.main;

export const selectContactList = createSelector(
    selectMain, selectUsername,
    (mainState, username) => mainState.contactList.filter((item) => item.username !== username)
);

import { createSelector } from 'reselect';

const selectMain = (state) => state.main;

export const selectContactList = createSelector(
    selectMain,
    (mainState) => mainState.contactList
);

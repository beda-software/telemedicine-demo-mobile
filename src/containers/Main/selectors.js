import { createSelector } from 'reselect';

const selectMain = (state) => state.main;

export function makeSelectContactList() {
    return createSelector(selectMain, (mainState) => mainState.contactList);
}

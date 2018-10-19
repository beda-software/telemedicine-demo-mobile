import { createAction } from 'redux-act';

export const saveContactList = createAction((contactList) => ({ contactList }));
export const fetchContacts = createAction();

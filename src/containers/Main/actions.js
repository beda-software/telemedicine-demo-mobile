import { createAction } from 'redux-act';

export const saveContactList = createAction((contactList) => ({ contactList }));
export const fetchContacts = createAction();

export const makeCall = createAction(
    (contactUsername) => ({ contactUsername, isVideo: false })
);
export const makeVideoCall = createAction(
    (contactUsername) => ({ contactUsername, isVideo: true })
);

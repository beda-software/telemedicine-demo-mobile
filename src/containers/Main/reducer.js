import { createReducer } from 'redux-act';

import {
    saveContactList,
} from './actions';

const initialState = {
    contactList: [],
};

export default createReducer({
    [saveContactList]: (state, { contactList }) => ({
        ...state,
        contactList,
    }),
}, initialState);

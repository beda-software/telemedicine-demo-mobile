import { createReducer } from 'redux-act';

import {
    showModal,
    hideModal,
} from './actions';

const initialState = {
    isVisible: false,
    text: '',
};

export default createReducer({
    [showModal]: (state, { text }) => ({
        ...state,
        isVisible: true,
        text,
    }),
    [hideModal]: (state) => ({
        ...state,
        isVisible: false,
    }),
}, initialState);

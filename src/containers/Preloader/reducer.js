import { createReducer } from 'redux-act';

import {
    showPreloader,
    hidePreloader,
} from './actions';

const initialState = {
    isVisible: false,
};

export default createReducer({
    [showPreloader]: (state) => ({
        ...state,
        isVisible: true,
    }),
    [hidePreloader]: (state) => ({
        ...state,
        isVisible: false,
    }),

}, initialState);

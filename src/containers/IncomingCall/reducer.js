import { createReducer } from 'redux-act';
import { saveCallerDisplayName } from './actions';

const initialState = {
    callerDisplayName: 'Unknown',
};

export default createReducer({
    [saveCallerDisplayName]: (state, { callerDisplayName }) => ({
        ...state,
        callerDisplayName,
    }),
}, initialState);

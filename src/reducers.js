import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import loginReducer from './containers/Login/reducer';

export default function createReducer(injectedReducers) {
    return combineReducers({
        login: loginReducer,
        form: formReducer,
        ...injectedReducers
    });
}

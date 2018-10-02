import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import globalReducer from './containers/App/reducer';
import loginReducer from './containers/Login/reducer';
import signUpReducer from './containers/SignUp/reducer';

export default function createReducer(injectedReducers) {
    return combineReducers({
        login: loginReducer,
        signUp: signUpReducer,
        global: globalReducer,
        form: formReducer,
        ...injectedReducers,
    });
}

import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { createNavigationReducer } from 'react-navigation-redux-helpers';

import globalReducer from 'containers/App/reducer';
import loginReducer from 'containers/Login/reducer';
import signUpReducer from 'containers/SignUp/reducer';
import { RootNavigator } from './navigators';

const navigationReducer = createNavigationReducer(RootNavigator);

export default function createReducer() {
    return combineReducers({
        login: loginReducer,
        signUp: signUpReducer,
        global: globalReducer,
        form: formReducer,
        navigation: navigationReducer,
    });
}

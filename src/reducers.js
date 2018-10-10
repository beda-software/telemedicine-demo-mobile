import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { createNavigationReducer } from 'react-navigation-redux-helpers';

import globalReducer from 'containers/App/reducer';
import mainReducer from 'containers/Main/reducer';
import loginReducer from 'containers/Login/reducer';
import signUpReducer from 'containers/SignUp/reducer';
import callReducer from 'containers/Call/reducer';
import incomingCallReducer from 'containers/IncomingCall/reducer';
import { RootNavigator } from './navigators';

const navigationReducer = createNavigationReducer(RootNavigator);

export default combineReducers({
    main: mainReducer,
    login: loginReducer,
    signUp: signUpReducer,
    global: globalReducer,
    call: callReducer,
    incomingCall: incomingCallReducer,
    form: formReducer,
    navigation: navigationReducer,
});

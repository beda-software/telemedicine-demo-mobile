import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import globalReducer from 'containers/App/reducer';
import mainReducer from 'containers/Main/reducer';
import loginReducer from 'containers/Login/reducer';
import signUpReducer from 'containers/SignUp/reducer';
import callReducer from 'containers/Call/reducer';
import incomingCallReducer from 'containers/IncomingCall/reducer';
import modalReducer from 'containers/Modal/reducer';
import prelodderReducer from 'containers/Preloader/reducer';

export default combineReducers({
    main: mainReducer,
    login: loginReducer,
    signUp: signUpReducer,
    global: globalReducer,
    call: callReducer,
    incomingCall: incomingCallReducer,
    form: formReducer,
    modal: modalReducer,
    preloader: prelodderReducer,
});

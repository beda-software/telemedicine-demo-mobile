import { all } from 'redux-saga/effects';

import mainSaga from './containers/Main/saga';
import loginSaga from './containers/Login/saga';
import signUpSaga from './containers/SignUp/saga';
import callSaga from './containers/Call/saga';
import incomingCallSaga from './containers/IncomingCall/saga';
import appSaga from './containers/App/saga';

export default function* rootSaga() {
    yield all([
        mainSaga(),
        loginSaga(),
        signUpSaga(),
        callSaga(),
        incomingCallSaga(),
        appSaga(),
    ]);
}

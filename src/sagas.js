import { all } from 'redux-saga/effects';

import loginSaga from './containers/Login/saga';
import signUpSaga from './containers/SignUp/saga';
import appSaga from './containers/App/saga';

export default function* rootSaga() {
    yield all([
        loginSaga(),
        signUpSaga(),
        appSaga(),
    ]);
}

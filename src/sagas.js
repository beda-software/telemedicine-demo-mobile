import { all } from 'redux-saga/effects';

import loginSaga from './containers/Login/saga';
import signUpSaga from './containers/SignUp/saga';

export default function* rootSaga() {
    yield all([
        loginSaga(),
        signUpSaga()
    ]);
}

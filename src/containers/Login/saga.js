import { takeEvery } from 'redux-saga/effects';

import { LOGIN } from './constants';

export function* loginUser({ payload: { username, password } }) {
    console.log("loginUser with", username, password);
}

export default function* loginSaga() {
    yield takeEvery(LOGIN, loginUser);
}

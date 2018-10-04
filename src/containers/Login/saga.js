import { takeEvery, call, put } from 'redux-saga/effects';

import request from 'utils/request';
import { loginSuccess, loginFailed } from './actions';
import { LOGIN } from './constants';

export function* loginUser({ values }) {
    const url = 'http://192.168.1.3:7777/td/login/';
    const options = {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: 'POST',
    };
    try {
        yield call(request, url, options);
        yield put(loginSuccess());
    } catch (err) {
        const content = yield call([err.response, 'json']);
        yield put(loginFailed(content));
    }
}

export default function* loginSaga() {
    yield takeEvery(LOGIN, loginUser);
}

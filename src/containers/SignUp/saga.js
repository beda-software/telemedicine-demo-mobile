import { takeEvery, call, put } from 'redux-saga/effects';

import request from 'utils/request';
import { SIGN_UP } from './constants';
import { signUpSuccess, signUpFailed } from './actions';

export function* signUpUser({ values }) {
    const url = 'http://10.0.2.2:7777/td/signup/';
    const options = {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: 'POST',
    };
    try {
        yield call(request, url, options);
        yield put(signUpSuccess());
    } catch (err) {
        const content = yield call([err.response, 'json']);
        yield put(signUpFailed(content));
    }
}

export default function* signUpSaga() {
    yield takeEvery(SIGN_UP, signUpUser);
}

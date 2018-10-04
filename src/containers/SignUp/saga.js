import { takeEvery, call } from 'redux-saga/effects';

import { SIGN_UP } from './constants';
import request from '../../utils/request';

export function* signUpUser({ values }) {
    const url = 'http://10.0.2.2:7777/td/signup/';
    const options = { body: JSON.stringify(values), method: 'POST' };
    try {
        const response = yield call(request, url, options);
        console.log("request response: ", response);
    } catch (err) {
        console.log(err.response);
    }
}

export default function* signUpSaga() {
    yield takeEvery(SIGN_UP, signUpUser);
}

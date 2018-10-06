import { takeEvery, call, put, all } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';

import { makePost } from 'utils/request';
import { showModal } from 'containers/App/actions';
import { SIGN_UP, SIGN_UP_SUCCESS, SIGN_UP_FAILED } from './constants';
import { signUpSuccess, signUpFailed } from './actions';

function* onSignUp({ values }) {
    try {
        yield call(makePost, '/td/signup/', values);
        yield put(signUpSuccess());
    } catch (err) {
        yield put(signUpFailed(err.data));
    }
}

function* onSignUpSuccess() {
    yield put(NavigationActions.navigate({ routeName: 'Login' }));
    yield put(showModal('You\'ve successfully registered.'));
}

function* onSignUpFailed({ error }) {
    yield put(showModal(error.message));
}

export default function* signUpSaga() {
    yield all([
        takeEvery(SIGN_UP, onSignUp),
        takeEvery(SIGN_UP_SUCCESS, onSignUpSuccess),
        takeEvery(SIGN_UP_FAILED, onSignUpFailed),
    ]);
}

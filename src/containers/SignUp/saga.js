import { takeEvery, call, put, all } from 'redux-saga/effects';
import { Navigation } from 'react-native-navigation';

import { makePost } from 'utils/request';
import { showPreloader, hidePreloader } from 'containers/Preloader/actions';
import { showModal } from 'containers/Modal/actions';
import { signUp, signUpSuccess, signUpFailed } from './actions';

function* onSignUp({
    payload: {
        values: { username, displayName, password },
    },
}) {
    yield put(showPreloader());
    try {
        const userCredentials = { username, displayName, password };
        yield call(makePost, '/td/signup/', userCredentials);
        yield put(signUpSuccess());
    } catch (err) {
        yield put(signUpFailed(err.data));
    }
}

function* onSignUpSuccess() {
    yield put(hidePreloader());
    yield Navigation.setStackRoot('root', {
        component: {
            name: 'td.Login',
        },
    });
    yield put(showModal("You've successfully registered."));
}

function* onSignUpFailed({ payload: { error } }) {
    yield put(hidePreloader());
    yield put(showModal(error.message));
}

export default function* signUpSaga() {
    yield all([
        takeEvery(signUp, onSignUp),
        takeEvery(signUpSuccess, onSignUpSuccess),
        takeEvery(signUpFailed, onSignUpFailed),
    ]);
}

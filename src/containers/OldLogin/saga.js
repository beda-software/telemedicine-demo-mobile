import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';
import { delay } from 'redux-saga';
import { takeLatest, put, all, select, race } from 'redux-saga/effects';

import { makePost, appDomain } from 'utils/request';
import { saveUsername, saveVoxImplantTokens, saveApiToken, initApp } from 'containers/App/actions';
import { showModal } from 'containers/Modal/actions';
import { showPreloader, hidePreloader } from 'containers/Preloader/actions';
import { selectApiToken, selectUsername } from 'containers/App/selectors';
import { login, voxImplantLogin, loginSuccess, loginFailed } from './actions';

// eslint-disable-next-line consistent-return
async function requestOneTimeLoginKey(client, fullUsername) {
    try {
        await client.requestOneTimeLoginKey(fullUsername);
    } catch (err) {
        if (err.name === Voximplant.ClientEvents.AuthResult && err.code === 302) {
            return err.key;
        }
        throw err;
    }
}

export function* onLogin({ payload }) {
    const { username, password } = payload.values;

    yield put(showPreloader());

    try {
        const result = yield makePost('/td/signin/', {
            username,
            password,
        });
        yield put(saveApiToken(result.token));
        yield put(saveUsername(username));
        yield put(voxImplantLogin());
    } catch (err) {
        yield put(loginFailed(err.data));
    }
}

function* onVoxImplantLogin() {
    const username = yield select(selectUsername);
    const token = yield select(selectApiToken);

    const client = Voximplant.getInstance();
    const fullUsername = `${username}@${appDomain}`;

    try {
        // Connection to the Voximplant Cloud is stayed alive on reloading of the app's
        // JavaScript code. Calling "disconnect" API here makes the SDK and app states
        // synchronized.
        try {
            yield client.disconnect();
        } catch (err) {}
        yield client.connect();

        // TODO: remove `race` after https://github.com/voximplant/react-native-voximplant/issues/45#issuecomment-427910310
        // TODO: will be resolved
        const { oneTimeKey } = yield race({
            oneTimeKey: requestOneTimeLoginKey(client, fullUsername),
            timeout: delay(10000),
        });
        if (!oneTimeKey) {
            return yield put(loginFailed({ message: 'Can not fetch one time login key. Please try again.' }));
        }
        const { hash } = yield makePost('/td/voximplant-hash/', { oneTimeKey }, token);
        const { tokens } = yield client.loginWithOneTimeKey(fullUsername, hash);
        yield put(saveVoxImplantTokens(tokens));
        yield put(loginSuccess());
    } catch (err) {
        switch (err.name) {
            case Voximplant.ClientEvents.ConnectionFailed: {
                yield put(loginFailed({ message: 'Connection failed. Please try again.' }));
                break;
            }
            default:
                yield put(loginFailed({ message: `Something went wrong. Code: ${err.code}` }));
        }
    }
}

function* onLoginSuccess() {
    yield put(initApp());
    yield put(hidePreloader());
    yield Navigation.setStackRoot('root', {
        component: {
            name: 'td.Main',
        },
    });
}

function* onLoginFailed({ payload: { error } }) {
    yield put(hidePreloader());
    yield put(showModal(error.message));
}

export default function* loginSaga() {
    yield all([
        takeLatest(login, onLogin),
        takeLatest(voxImplantLogin, onVoxImplantLogin),
        takeLatest(loginSuccess, onLoginSuccess),
        takeLatest(loginFailed, onLoginFailed),
    ]);
}

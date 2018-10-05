import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import { takeLatest, call, put } from 'redux-saga/effects';

import { makePost } from 'utils/request';
import { saveAuthTokens } from 'containers/App/actions';
import { loginSuccess, loginFailed } from './actions';
import { LOGIN } from './constants';

export function* loginUser({ values }) {
    let token = null;
    const { username, password } = values;

    try {
        const result = yield call(
            () => makePost('http://192.168.1.3:7777/td/signin/', {
                username,
                password,
            })
        );
        token = result.token;
        //TODO: yield put(saveApiToken(token))
    } catch (err) {
        return yield put(loginFailed(err.message));
    }

    const client = Voximplant.getInstance();

    console.log('state', yield client.getClientState())
    const fullUsername = `${username}@voice-chat.beda-software.voximplant.com`;

    try {
        // Connection to the Voximplant Cloud is stayed alive on reloading of the app's
        // JavaScript code. Calling "disconnect" API here makes the SDK and app states
        // synchronized.
        try {
            yield call(() => client.disconnect());
        } catch (err) {
        }
        yield call(() => client.connect());


        yield call(() => client.requestOneTimeLoginKey(fullUsername));

    } catch (err) {
        switch (err.name) {
            case Voximplant.ClientEvents.ConnectionFailed:
            // TODO: dispatch connectionFailed
            console.log('connection failed');
            break;
        case Voximplant.ClientEvents.AuthResult:
            if (err.code === 302) {
                try {
                    const result = yield call(
                        () => makePost(
                            'http://192.168.1.3:7777/td/voximplant-hash/',
                            { oneTimeKey: err.key },
                            token
                        )
                    );

                    const authResult = yield call(() => client.loginWithOneTimeKey(fullUsername, result.hash));
                    const loginTokens = authResult.tokens;

                    yield put(saveAuthTokens(loginTokens));

                    yield put(loginSuccess());
                    return yield put(NavigationActions.navigate({ routeName: 'App' }));
                } catch (nestedErr) {
                    return yield put(loginFailed(nestedErr.message));
                }
            }
            break;
        default:
            console.log('global ERR ')
            return yield put(loginFailed(err.message));
        }
    }
}

export default function* loginSaga() {
    yield takeLatest(LOGIN, loginUser);
}

import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import DefaultPreference from 'react-native-default-preference';
import { takeEvery, call, put } from 'redux-saga/effects';

import request from 'utils/request';
import { loginSuccess, loginFailed } from './actions';
import { LOGIN } from './constants';


export function* loginUser({ values }) {
    const url = 'http://192.168.1.3:7777/td/signin/';
    const options = {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: 'POST',
    };
    try {
        yield call(request, url, options);
    } catch (err) {
        const content = yield err.response.json();
        yield put(loginFailed(content));
    }
    try {
        const client = Voximplant.getInstance();
        // Connection to the Voximplant Cloud is stayed alive on reloading of the app's
        // JavaScript code. Calling "disconnect" API here makes the SDK and app states
        // synchronized.
        try {
            yield client.disconnect();
        } catch (err) {
        }
        yield client.connect();
        const { username, password } = values;
        const fullUsername = `${username}@voice-chat.beda-software.voximplant.com`;
        const authResult = yield client.login(fullUsername, password);

        const loginTokens = authResult.tokens;
        DefaultPreference.set('accessToken', loginTokens.accessToken);
        DefaultPreference.set('refreshToken', loginTokens.refreshToken);
        DefaultPreference.set('accessExpire', loginTokens.accessExpire.toString());
        DefaultPreference.set('refreshExpire', loginTokens.refreshExpire.toString());

        yield put(loginSuccess());
        yield put(NavigationActions.navigate({ routeName: 'App' }));
    } catch (err) {
        console.log('err', err);
    }
}

export default function* loginSaga() {
    yield takeEvery(LOGIN, loginUser);
}

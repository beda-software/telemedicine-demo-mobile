import { AsyncStorage } from 'react-native';
import { delay } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select, race, fork } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import { appDomain } from 'utils/request';
import { showModal } from 'containers/Modal/actions';
import {
    logout,
    initApp,
    savePushToken,
    saveApiToken,
    saveUsername,
    saveVoxImplantTokens,
    setAppInitializedStatus,
} from './actions';
import {
    selectPushToken,
    selectVoxImplantTokens,
    selectUsername,
    selectIsAppInitialized,
} from './selectors';
import {
    createPushTokenChannel,
    createPushNotificationChannel,
} from './pushnotification';
import {
    createAppStateChangedChannel,
} from './channels';

function* hasSession() {
    const [[, apiToken], [, accessToken], [, username]] =
        yield AsyncStorage.multiGet(['apiToken', 'accessToken', 'username']);

    return !!(username && accessToken && apiToken);
}

function* onLogout() {
    const client = Voximplant.getInstance();
    try {
        yield client.disconnect();
    } catch (err) {
    }
    yield client.connect();

    const pushToken = yield select(selectPushToken);
    if (pushToken) {
        client.unregisterPushNotificationsToken(pushToken);
    }

    yield client.disconnect();
    yield put(setAppInitializedStatus(false));
    yield* clearSessionData();

    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

export function* reLoginVoxImplant() {
    const client = Voximplant.getInstance();

    const connectionState = yield client.getClientState();
    if (connectionState === Voximplant.ClientState.DISCONNECTED) {
        yield client.connect();
    }

    if (connectionState !== Voximplant.ClientState.LOGGED_IN) {
        const username = yield select(selectUsername);
        const fullUsername = `${username}@${appDomain}`;
        const { accessToken } = yield select(selectVoxImplantTokens);
        console.log(`reLoginVoxImplant: loginWithToken: user: ${username}, token: ${accessToken}`);

        const { tokens } = yield client.loginWithToken(fullUsername, accessToken);
        yield put(saveVoxImplantTokens(tokens));
    }
}

function* onInitApp() {
    const appStateChangedChannel = yield createAppStateChangedChannel();

    yield put(setAppInitializedStatus(true));

    yield takeEvery(appStateChangedChannel, onAppStateChanged);

    const pushTokenChannel = yield createPushTokenChannel();
    const { pushToken } = yield race({
        pushToken: take(pushTokenChannel),
        timeout: delay(3000),
    });
    if (pushToken) {
        yield put(savePushToken(pushToken));
        const client = Voximplant.getInstance();
        client.registerPushNotificationsToken(pushToken);
    } else {
        yield put(showModal('Cannot receive push token'));
    }
    pushTokenChannel.close();
}

function* initPushNotifications() {
    const channel = yield createPushNotificationChannel();

    // Wait until app will be initialized (login and etc.)
    yield take(initApp);

    yield takeEvery(channel, onPushNotificationReceived);
}

function* onPushNotificationReceived(notification) {
    console.log('New notification', notification);

    try {
        yield* reLoginVoxImplant();
        const client = Voximplant.getInstance();
        client.handlePushNotification({ voximplant: notification.voximplant });
    } catch (err) {
        yield put(showModal(`Can not handle push notification.\n${err.message}`));
    }
}

function* bootstrap() {
    yield fork(initPushNotifications);

    if (yield* restoreSessionData()) {
        yield put(NavigationActions.navigate({ routeName: 'App' }));

        try {
            yield* reLoginVoxImplant();
            // TODO: isAppInitialized is always false??? I'm not sure
            const isAppInitialized = yield select(selectIsAppInitialized);
            if (!isAppInitialized) {
                yield put(initApp());
            }
        } catch (err) {
            yield put(showModal(`Can not bootstrap.\n${err.message}`));
        }
    } else {
        yield put(NavigationActions.navigate({ routeName: 'Login' }));
    }
}

function* onAppStateChanged(appState) {
    console.log(`Current app state changed to ${appState}`);

    if (appState === 'active') {
        if (yield* hasSession()) {
            try {
                yield* reLoginVoxImplant();
            } catch (err) {
                yield put(showModal(`Can not relogin.\n${err.message}`));
            }
        }
    }
}

function* restoreSessionData() {
    const [[, apiToken], [, accessToken], [, username]] = yield AsyncStorage.multiGet(
        ['apiToken', 'accessToken', 'username']
    );

    if (apiToken && accessToken && username) {
        yield put(saveApiToken(apiToken));
        yield put(saveVoxImplantTokens({ accessToken }));
        yield put(saveUsername(username));

        return true;
    }

    return false;
}

function* clearSessionData() {
    yield AsyncStorage.multiRemove(['apiToken', 'accessToken', 'username']);
}

function* onSaveVoxImplantTokens({ payload: { voxImplantTokens } }) {
    console.log('set accessToken', voxImplantTokens.accessToken);

    yield AsyncStorage.setItem('accessToken', voxImplantTokens.accessToken);
}

function* onSaveApiToken({ payload: { apiToken } }) {
    console.log('set apiToken', apiToken);

    yield AsyncStorage.setItem('apiToken', apiToken);
}

function* onSaveUsername({ payload: { username } }) {
    console.log('set username', username);

    yield AsyncStorage.setItem('username', username);
}

export default function* appSaga() {
    yield all([
        takeLatest(logout, onLogout),
        takeLatest(initApp, onInitApp),

        takeEvery(saveUsername, onSaveUsername),

        // TODO: get rid of these functions, call them directly and don't save it to store!
        takeEvery(saveApiToken, onSaveApiToken),
        takeEvery(saveVoxImplantTokens, onSaveVoxImplantTokens),

        fork(bootstrap),
    ]);
}

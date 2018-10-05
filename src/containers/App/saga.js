import { all, takeLatest, put, select, call } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';

import { makeGet } from 'utils/request';

import { LOGOUT, LOAD_USERS } from './constants';
import { makeSelectApiToken } from './selectors';
import { updateUserList } from './actions';

function* logout() {
    console.log('logout saga')
    const client = Voximplant.getInstance();

    try {
        yield client.disconnect();
    } catch (err) {
    }

    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

function flattenUserEntry({ username, displayName, voxImplantId }) {
    return { username, displayName, voxImplantId };
}

function* loadUsers() {
    const apiToken = yield select(makeSelectApiToken());
    const users = yield call(
        () => makeGet("http://10.0.2.2:7777/User/", {}, apiToken)
    );
    userList = users.entry.map((user) => flattenUserEntry(user.resource));
    yield put(updateUserList(userList));
}

export function* appLogout() {
    yield takeLatest(LOGOUT, logout);
}

export function* appLoadUsers() {
    yield takeLatest(LOAD_USERS, loadUsers);
}

export default function* appSaga() {
    yield all([appLogout(), appLoadUsers()]);
}


// TODO: inCOmponentWillMount dispatch loadUsers
// TODO: GET /User/ (with authorization token Bearer: token)
// TODO: display username
// TODO: on username press - dispatch(makeCall())

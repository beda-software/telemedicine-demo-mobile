import { takeLatest, put } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';

import { LOGOUT } from './constants';

function* logout() {
    console.log('logout saga')
    const client = Voximplant.getInstance();

    try {
        yield client.disconnect();
    } catch (err) {
    }

    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

export default function* appSaga() {
    yield takeLatest(LOGOUT, logout);
}


// TODO: inCOmponentWillMount dispatch loadUsers
// TODO: GET /User/ (with authorization token Bearer: token)
// TODO: display username
// TODO: on username press - dispatch(makeCall())

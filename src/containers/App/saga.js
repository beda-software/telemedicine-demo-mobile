import { Platform, PermissionsAndroid } from 'react-native';
import { all, takeLatest, put, select, call } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import { makeGet } from 'utils/request';

import { LOGOUT, FETCH_CONTACTS, MAKE_CALL } from './constants';
import { makeSelectApiToken } from './selectors';
import { saveContactList, showModal } from './actions';

// TODO: Replace VI callmanager with one adapted for our needs
import CallManager from '../../manager/CallManager';

function* logout() {
    console.log('logout saga');
    const client = Voximplant.getInstance();

    try {
        yield client.disconnect();
    } catch (err) {
    }

    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

function flattenUserEntry({ username, displayName, voxImplantId }) {
    return {
        username,
        displayName,
        voxImplantId,
    };
}

function* fetchContacts() {
    const apiToken = yield select(makeSelectApiToken());
    const users = yield call(
        () => makeGet('/User/', {}, apiToken)
    );
    const contactList = users.entry.map((user) => flattenUserEntry(user.resource));
    yield put(saveContactList(contactList));
}

function* makeCall({ contactUsername, isVideo = false }) {
    try {
        if (Platform.OS === 'android') {
            let permissions = [
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ];
            if (isVideo) {
                permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
            }
            const granted = yield PermissionsAndroid.requestMultiple(permissions);
            const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
            if (recordAudioGranted) {
                if (isVideo) {
                    const cameraGranted = granted['android.permission.CAMERA'] === 'granted';

                    if (!cameraGranted) {
                        yield put(showModal('Camera permission is not granted'));
                        return;
                    }
                }
            } else {
                yield put(showModal('Record audio permission is not granted'));
                return;
            }
        }
        const callSettings = {
            video: {
                sendVideo: isVideo,
                receiveVideo: isVideo,
            },
        };
        const newCall = yield Voximplant.getInstance().call(contactUsername, callSettings);
        CallManager.getInstance().addCall(newCall);
        yield put(NavigationActions.navigate({
            routeName: 'Call',
            params: {
                callId: newCall.callId,
                isVideo,
                isIncoming: false,
            },
        }));
    } catch (err) {
        yield put(showModal(`Make call failed ${err}`));
    }
}

export default function* appSaga() {
    yield all([
        takeLatest(LOGOUT, logout),
        takeLatest(FETCH_CONTACTS, fetchContacts),
        takeLatest(MAKE_CALL, makeCall),
    ]);
}

import { Platform, PermissionsAndroid } from 'react-native';
import { eventChannel } from 'redux-saga';
import { all, takeLatest, put, select, call, take } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import { makeGet } from 'utils/request';

import { incomingCall } from 'containers/IncomingCall/actions';
import { LOGOUT, FETCH_CONTACTS, MAKE_CALL, INIT_CALL } from './constants';
import { makeSelectApiToken } from './selectors';
import { saveContactList, showModal } from './actions';

// TODO: Replace VI callmanager with one adapted for our needs
import CallManager from '../../manager/CallManager';

function* onLogout() {
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

function* onFetchContacts() {
    const apiToken = yield select(makeSelectApiToken());
    const users = yield call(
        () => makeGet('/User/', {}, apiToken),
    );
    const contactList = users.entry.map((user) => flattenUserEntry(user.resource));
    yield put(saveContactList(contactList));
}

export function* requestPermissions(isVideo) {
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
                    throw new Error('Camera permission is not granted');
                }
            }
        } else {
            throw new Error('Record audio permission is not granted');
        }
    }

    return true;
}

function* onMakeCall({ contactUsername, isVideo = false }) {
    try {
        yield requestPermissions(isVideo);
        const callSettings = {
            video: {
                sendVideo: isVideo,
                receiveVideo: isVideo,
            },
        };
        const newCall = yield Voximplant.getInstance()
            .call(contactUsername, callSettings);
        CallManager.getInstance()
            .addCall(newCall);
        yield put(NavigationActions.navigate({
            routeName: 'Call',
            params: {
                callId: newCall.callId,
                isVideo,
                isIncoming: false,
            },
        }));
    } catch (err) {
        yield put(showModal(`Сall failed:\n${err.message}`));
    }
}

function createIncomingCallChannel() {
    const client = Voximplant.getInstance();
    return eventChannel((emit) => {
        const incomingCallHandler = (event) => {
            emit(event.call);
        };
        client.on(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);

        return () => {
            client.off(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);
        };
    });
}

function* onInitCall() {
    const incomingCallChannel = yield createIncomingCallChannel();

    while (true) {
        const newIncomingCall = yield take(incomingCallChannel);
        yield put(incomingCall(newIncomingCall));
    }
}

export default function* appSaga() {
    yield all([
        takeLatest(LOGOUT, onLogout),
        takeLatest(FETCH_CONTACTS, onFetchContacts),
        takeLatest(INIT_CALL, onInitCall),
        takeLatest(MAKE_CALL, onMakeCall),
    ]);
}

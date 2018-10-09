import { Platform, PermissionsAndroid } from 'react-native';
import { eventChannel } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select, call } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import { makeGet } from 'utils/request';

import { incomingCall } from 'containers/IncomingCall/actions';
import { makeSelectApiToken } from './selectors';
import {
    logout,
    fetchContacts,
    initApp,
    makeCall,
    makeVideoCall,
    setActiveCall,
    saveContactList,
    showModal,
    deinitApp
} from './actions';

function* onLogout() {
    const client = Voximplant.getInstance();

    try {
        yield client.disconnect();
    } catch (err) {
    }
    yield put(deinitApp());
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

function* onMakeCall({ payload }) {
    const { contactUsername, isVideo = false } = payload;
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
        yield put(setActiveCall(newCall));
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

function* onInitApp() {
    const incomingCallChannel = yield createIncomingCallChannel();

    yield takeEvery(incomingCallChannel, function* onIncomingCall(newIncomingCall) {
        yield put(incomingCall(newIncomingCall));
    });

    yield take(deinitApp);
    incomingCallChannel.close();
}

export default function* appSaga() {
    yield all([
        takeLatest(logout, onLogout),
        takeLatest(fetchContacts, onFetchContacts),
        takeLatest(initApp, onInitApp),
        takeLatest(makeCall, onMakeCall),
        takeLatest(makeVideoCall, onMakeCall),
    ]);
}

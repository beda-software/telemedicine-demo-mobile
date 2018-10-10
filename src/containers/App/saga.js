import { Platform, PermissionsAndroid } from 'react-native';
import { eventChannel } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';

import {
    logout,
    initApp,
    deinitApp,
    setActiveCall,
    showModal,
    incomingCallReceived,
} from './actions';
import { makeSelectActiveCall } from './selectors';

function* onLogout() {
    const client = Voximplant.getInstance();

    try {
        yield client.disconnect();
    } catch (err) {
    }
    yield put(deinitApp());
    yield put(NavigationActions.navigate({ routeName: 'Login' }));
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
    const channel = yield createIncomingCallChannel();

    yield takeEvery(channel, function* onIncomingCall(newIncomingCall) {
        yield put(incomingCallReceived(newIncomingCall));
    });

    yield take(deinitApp);
    channel.close();
}

function* onIncomingCallReceived({ payload }) {
    const { call } = payload;
    const activeCall = yield select(makeSelectActiveCall());
    if (activeCall && activeCall.id !== call.id) {
        call.decline();
        yield put(showModal('You\'ve received one another call, but we declined it.'));
    } else {
        yield put(setActiveCall(call));
        yield put(NavigationActions.navigate({
            routeName: 'IncomingCall',
            params: {
                callId: call.callId,
            },
        }));
    }
}

export default function* appSaga() {
    yield all([
        takeLatest(logout, onLogout),
        takeLatest(initApp, onInitApp),

        takeEvery(incomingCallReceived, onIncomingCallReceived),
    ]);
}

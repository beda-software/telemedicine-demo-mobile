import { all, takeLatest, put, select, call } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';

import { makeGet } from 'utils/request';

import { LOGOUT, FETCH_CONTACTS, MAKE_CALL, MAKE_VIDEO_CALL } from './constants';
import { makeSelectApiToken } from './selectors';
import { saveContactList } from './actions';

// TODO: Replace VI callmanager with one adapted for our needs
import CallManager from '../../manager/CallManager';

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

function* fetchContacts() {
    const apiToken = yield select(makeSelectApiToken());
    const users = yield call(
        () => makeGet("http://10.0.2.2:7777/User/", {}, apiToken)
    );
    contactList = users.entry.map((user) => flattenUserEntry(user.resource));
    yield put(saveContactList(contactList));
}

function* makeCall(action) {
    const { contactUsername } = action;
    console.log('saga: make call to', contactUsername);

    // try {
    //     if (Platform.OS === 'android') {
    //         let permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
    //         const granted = await PermissionsAndroid.requestMultiple(permissions);
    //         const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
    //         if (recordAudioGranted) {
    //             console.warn('MainScreen: makeCall: record audio permission is not granted');
    //             return;
    //         }
    //     }
    //     const callSettings = {
    //         video: {
    //             sendVideo: false,
    //             receiveVideo: false,
    //         }
    //     };
    //     let call = await Voximplant.getInstance().call(contactUsername, callSettings);
    //     CallManager.getInstance().addCall(call);
    //     this.props.navigation.navigate('Call', {
    //         callId: call.callId,
    //         isVideo: isVideoCall,
    //         isIncoming: false
    //     });
    // } catch (err) {
    //     console.warn('makeCall failed' + err);
    // }
}

function* makeVideoCall(action) {
    const { contactUsername } = action;
    console.log('saga: make video call to', contactUsername);

    // try {
    //     if (Platform.OS === 'android') {
    //         let permissions = [
    //             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    //             PermissionsAndroid.PERMISSIONS.CAMERA,
    //         ];
    //         const granted = await PermissionsAndroid.requestMultiple(permissions);
    //         const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
    //         const cameraGranted = granted['android.permission.CAMERA'] === 'granted';
    //         if (recordAudioGranted) {
    //             if (!cameraGranted) {
    //                 console.warn('makeVideoCall: camera permission is not granted');
    //                 return;
    //             }
    //         } else {
    //             console.warn('makeVideoCall: record audio permission is not granted');
    //             return;
    //         }
    //     }
    //     const callSettings = {
    //         video: {
    //             sendVideo: true,
    //             receiveVideo: true,
    //         }
    //     };
    //     let call = await Voximplant.getInstance().call(contactUsername, callSettings);
    //     CallManager.getInstance().addCall(call);
    //     this.props.navigation.navigate('Call', {
    //         callId: call.callId,
    //         isVideo: isVideoCall,
    //         isIncoming: false
    //     });
    // } catch (err) {
    //     console.warn('makeCall failed' + err);
    // }
}

export function* appLogout() {
    yield takeLatest(LOGOUT, logout);
}

export function* appFetchContacts() {
    yield takeLatest(FETCH_CONTACTS, fetchContacts);
}

export function* appMakeCall() {
    yield takeLatest(MAKE_CALL, makeCall);
}

export function* appMakeVideoCall() {
    yield takeLatest(MAKE_VIDEO_CALL, makeVideoCall);
}

export default function* appSaga() {
    yield all([
        appLogout(),
        appFetchContacts(),
        appMakeCall(),
        appMakeVideoCall(),
    ]);
}


// TODO: inCOmponentWillMount dispatch loadUsers
// TODO: GET /User/ (with authorization token Bearer: token)
// TODO: display username
// TODO: on username press - dispatch(makeCall())

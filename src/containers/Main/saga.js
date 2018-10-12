import { all, takeLatest, put, select, call } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';
import { makeGet } from 'utils/request';
import { selectApiToken } from 'containers/App/selectors';
import { requestPermissions } from 'containers/App/saga';
import { setActiveCall } from 'containers/App/actions';
import { showModal } from 'containers/Modal/actions';

import {
    fetchContacts,
    makeCall,
    makeVideoCall,
    saveContactList,
} from './actions';

function flattenUserEntry({ username, displayName, voxImplantId }) {
    return {
        username,
        displayName,
        voxImplantId,
    };
}

function* onFetchContacts() {
    const apiToken = yield select(selectApiToken);
    const users = yield call(
        () => makeGet('/User/', {}, apiToken),
    );
    const contactList = users.entry.map((user) => flattenUserEntry(user.resource));
    yield put(saveContactList(contactList));
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
        yield put(showModal(`Call failed:\n${err.message}`));
    }
}

export default function* appSaga() {
    yield all([
        takeLatest(fetchContacts, onFetchContacts),
        takeLatest(makeCall, onMakeCall),
        takeLatest(makeVideoCall, onMakeCall),
    ]);
}

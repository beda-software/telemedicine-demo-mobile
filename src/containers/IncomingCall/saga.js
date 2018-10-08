import { NavigationActions } from 'react-navigation';
import { all, takeLatest, takeEvery, put, select } from 'redux-saga/effects';
import { requestPermissions } from 'containers/App/saga';
import { showModal, setActiveCall } from 'containers/App/actions';
import { makeSelectActiveCall } from 'containers/App/selectors';
import { ANSWER_CALL, DECLINE_CALL, INCOMING_CALL } from './constants';

function* onAnswerCall({ call, isVideo }) {
    try {
        yield requestPermissions(isVideo);
        yield put(NavigationActions.navigate({
            routeName: 'Call',
            params: {
                callId: call.callId,
                isVideo,
                isIncoming: true,
            },
        }));
    } catch (err) {
        yield put(showModal(`Incoming call failed:\n${err.message}`));
    }
}

function* onDeclineCall({ call }) {
    call.decline();
    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

function* onIncomingCall({ call }) {
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

export default function* incomingCallSaga() {
    yield all([
        takeLatest(ANSWER_CALL, onAnswerCall),
        takeLatest(DECLINE_CALL, onDeclineCall),
        takeEvery(INCOMING_CALL, onIncomingCall),
    ]);
}

import { NavigationActions } from 'react-navigation';
import { all, takeLatest, takeEvery, put, select } from 'redux-saga/effects';
import { requestPermissions } from 'containers/App/saga';
import { showModal, setActiveCall } from 'containers/App/actions';
import { makeSelectActiveCall } from 'containers/App/selectors';
import { answerCall, answerVideoCall, declineCall, incomingCall } from './actions';

function* onAnswerCall({ payload }) {
    try {
        const { call, isVideo } = payload;
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

function* onDeclineCall({ payload }) {
    payload.call.decline();
    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

function* onIncomingCall({ payload }) {
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

export default function* incomingCallSaga() {
    yield all([
        takeLatest(answerCall, onAnswerCall),
        takeLatest(answerVideoCall, onAnswerCall),
        takeLatest(declineCall, onDeclineCall),
        takeEvery(incomingCall, onIncomingCall),
    ]);
}

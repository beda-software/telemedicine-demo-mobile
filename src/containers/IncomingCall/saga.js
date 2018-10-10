import { NavigationActions } from 'react-navigation';
import { all, takeLatest, put } from 'redux-saga/effects';
import { requestPermissions } from 'containers/App/saga';
import { showModal, setActiveCall } from 'containers/App/actions';
import { answerCall, answerVideoCall, declineCall } from './actions';

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

export default function* incomingCallSaga() {
    yield all([
        takeLatest(answerCall, onAnswerCall),
        takeLatest(answerVideoCall, onAnswerCall),
        takeLatest(declineCall, onDeclineCall),
    ]);
}

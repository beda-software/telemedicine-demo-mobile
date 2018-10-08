import { NavigationActions } from 'react-navigation';
import { all, takeLatest, put } from 'redux-saga/effects';
import { requestPermissions } from 'containers/App/saga';
import { showModal } from 'containers/App/actions';
import { ANSWER_CALL, DECLINE_CALL, INCOMING_CALL } from './constants';
import CallManager from '../../manager/CallManager';

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
    CallManager.getInstance().removeCall(call);

    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

function* onIncomingCall({ call }) {
    // TODO: remove
    CallManager.getInstance().addCall(call);
    yield put(NavigationActions.navigate({
        routeName: 'IncomingCall',
        params: {
            callId: call.callId,
        },
    }));
}

export default function* incomingCallSaga() {
    yield all([
        takeLatest(ANSWER_CALL, onAnswerCall),
        takeLatest(DECLINE_CALL, onDeclineCall),
        takeLatest(INCOMING_CALL, onIncomingCall),
    ]);
}

import { Voximplant } from 'react-native-voximplant';
import { NavigationActions } from 'react-navigation';
import { all, takeLatest, takeEvery, take, put } from 'redux-saga/effects';
import { createCallChannel, requestPermissions } from 'containers/App/saga';
import { showModal, setActiveCall } from 'containers/App/actions';
import {
    subscribeToIncomingCallEvents,
    unsubscribeFromIncomingCallEvents,
    answerCall,
    answerVideoCall,
    declineCall,
    saveCallerDisplayName,

    incomingCallDisconnected,
    endpointAdded,
} from './actions';


function* onEndpointAdded({ payload: { endpoint } }) {
    yield put(saveCallerDisplayName(endpoint.displayName));
}

function* onIncomingCallDisconnected() {
    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

function* onSubscribeToIncomingCallEvents({ payload: { call: activeCall } }) {
    const channel = createCallChannel(activeCall);

    yield takeEvery(channel, function* onCallEvent(event) {
        console.log(`Incoming call event: ${event.name}`, event);
        switch (event.name) {
        case Voximplant.CallEvents.Disconnected: {
            yield put(incomingCallDisconnected());
            break;
        }
        case Voximplant.CallEvents.EndpointAdded: {
            yield put(endpointAdded(event.endpoint));
            break;
        }
        default:
            console.log(`Unhandled incoming call event ${event.name}`);
        }
    });

    yield take(unsubscribeFromIncomingCallEvents);
    channel.close();
}

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
        takeLatest(subscribeToIncomingCallEvents, onSubscribeToIncomingCallEvents),
        takeLatest(answerCall, onAnswerCall),
        takeLatest(answerVideoCall, onAnswerCall),
        takeLatest(declineCall, onDeclineCall),

        takeEvery(endpointAdded, onEndpointAdded),
        takeEvery(incomingCallDisconnected, onIncomingCallDisconnected),
    ]);
}

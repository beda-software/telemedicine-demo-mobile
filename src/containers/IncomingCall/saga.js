import { Platform, PermissionsAndroid } from 'react-native';
import { all, takeLatest, put } from 'redux-saga/effects';
import { ANSWER_CALL } from './constants';

function* onAnswerCall({ isVideo }) {

}

export default function* incomingCallSaga() {
    yield all([
        takeLatest(ANSWER_CALL, onAnswerCall),
    ]);
}



import { Voximplant } from 'react-native-voximplant';
import { all, takeEvery, put, fork, takeLatest } from 'redux-saga/effects';

import storage from 'storage';
import {
    changeDevice,
    changeDeviceList,
    setAudioDevice,
    toggleAudioDeviceSelector,
    toggleAudioMute,
    toggleVideoSend,
} from 'containers/Call/actions';
import { requestPermissions } from 'containers/App/saga';
import { showModal } from 'containers/Modal/actions';
import { createAudioDeviceChannel } from './channels';


function* subscribeToAudioDeviceEvents() {
    const channel = createAudioDeviceChannel();

    yield takeEvery(channel, function* onCallEvent(event) {
        console.log(`Device event: ${event.name}`, event);

        switch (event.name) {
        case Voximplant.Hardware.AudioDeviceEvents.DeviceChanged: {
            yield put(changeDevice(event.currentDevice));
            break;
        }
        case Voximplant.Hardware.AudioDeviceEvents.DeviceListChanged: {
            yield put(changeDeviceList(event.newDeviceList));
            break;
        }
        default:
            console.log(`Unhandled audio device event ${event.name}`);
        }
    });
}

function* onToggleAudioDeviceSelector({ payload: { isAudioDeviceSelectorVisible } }) {
    if (isAudioDeviceSelectorVisible) {
        const devices = yield Voximplant.Hardware.AudioDeviceManager.getInstance()
            .getAudioDevices();
        yield put(changeDeviceList(devices));
    }
}

function* onSetAudioDevice({ payload: { device } }) {
    Voximplant.Hardware.AudioDeviceManager.getInstance()
        .selectAudioDevice(device);
    yield put(toggleAudioDeviceSelector(false));
}

function* onToggleAudioMute({ payload: { isAudioMuted } }) {
    yield storage.activeCall.sendAudio(!isAudioMuted);
}

function* onToggleVideoSend({ payload: { isVideoBeingSent } }) {
    try {
        yield requestPermissions();
        yield storage.activeCall.sendVideo(isVideoBeingSent);
    } catch (err) {
        put(showModal(`Failed to send video:\n${err.message}`));
    }
}

export default function* callSaga() {
    yield all([
        takeLatest(toggleAudioDeviceSelector, onToggleAudioDeviceSelector),
        takeLatest(setAudioDevice, onSetAudioDevice),
        takeLatest(toggleAudioMute, onToggleAudioMute),
        takeLatest(toggleVideoSend, onToggleVideoSend),

        fork(subscribeToAudioDeviceEvents),
    ]);
}

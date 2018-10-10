import { Voximplant } from 'react-native-voximplant';
import { NavigationActions } from 'react-navigation';
import { eventChannel } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put } from 'redux-saga/effects';
import { setActiveCall, showModal } from 'containers/App/actions';
import { requestPermissions, createCallChannel } from 'containers/App/saga';

import {
    subscribeToCallEvents,
    subscribeToAudioDeviceEvents,
    unsubscribeFromCallEvents,
    unsubscribeFromAudioDeviceEvents,
    toggleVideoSend,
    toggleAudioMute,
    toggleAudioDeviceSelector,
    endCall,
    setAudioDevice,
    setCallStatus,

    callFailed,
    callConnected,
    callDisconnected,
    callLocalVideoStreamChanged,
    endpointAdded,
    endpointRemoved,
    endpointRemoveVideoStreamChanged,
    deviceChanged,
    deviceListChanged,
} from './actions';

function* onCallConnected() {
    yield put(setCallStatus('connected'));
}

function* onCallFailed({ payload: { reason } }) {
    yield put(showModal(`Call failed: ${reason}`));

    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

function* onCallDisconnected() {
    yield put(setActiveCall(null));
    yield put(NavigationActions.navigate({ routeName: 'App' }));
}

function createEndpointChannel(endpoint) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
        };

        Object.keys(Voximplant.EndpointEvents)
            .forEach((eventName) => endpoint.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.EndpointEvents)
                .forEach((eventName) => endpoint.off(eventName, handler));
        };
    });
}

function* onEndpointAdded({ payload: { endpoint } }) {
    const channel = createEndpointChannel(endpoint);

    yield takeEvery(channel, function* onEndpointEvent(event) {
        console.log(`Endpoint event: ${event.name}`, event);

        switch (event.name) {
        case Voximplant.EndpointEvents.Removed: {
            yield put(endpointRemoved(event.endpoint));
            break;
        }
        case Voximplant.EndpointEvents.RemoteVideoStreamAdded: {
            yield put(endpointRemoveVideoStreamChanged(event.videoStream));
            break;
        }
        case Voximplant.EndpointEvents.RemoteVideoStreamRemoved: {
            yield put(endpointRemoveVideoStreamChanged(null));
            break;
        }
        default:
            console.log(`Unhandled endpoint event ${event.name}`);
        }
    });

    while (true) {
        const targetEndpoint = yield take(endpointRemoved);
        if (targetEndpoint.id === endpoint.id) {
            channel.close();
            break;
        }
    }
}

function* onSubscribeToCallEvents({ payload: { call: activeCall, isIncoming } }) {
    if (isIncoming) {
        activeCall.getEndpoints()
            .forEach(function* onEachEndpoint(endpoint) {
                yield put(endpointAdded(endpoint));
            });
    }

    const channel = createCallChannel(activeCall);

    yield takeEvery(channel, function* onCallEvent(event) {
        console.log(`Call event: ${event.name}`, event);
        switch (event.name) {
        case Voximplant.CallEvents.Connected: {
            yield put(callConnected());
            break;
        }
        case Voximplant.CallEvents.Failed: {
            yield put(callFailed(event.reason));
            break;
        }
        case Voximplant.CallEvents.Disconnected: {
            yield put(callDisconnected());
            break;
        }
        case Voximplant.CallEvents.LocalVideoStreamAdded: {
            yield put(callLocalVideoStreamChanged(event.videoStream));
            break;
        }
        case Voximplant.CallEvents.LocalVideoStreamRemoved: {
            yield put(callLocalVideoStreamChanged(null));
            break;
        }
        case Voximplant.CallEvents.EndpointAdded: {
            yield put(endpointAdded(event.endpoint));
            break;
        }
        default:
            console.log(`Unhandled call event ${event.name}`);
        }
    });

    yield take(unsubscribeFromCallEvents);
    channel.close();
}

function createAudioDeviceChannel() {
    const instance = Voximplant.Hardware.AudioDeviceManager.getInstance();

    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
        };

        Object.keys(Voximplant.Hardware.AudioDeviceEvents)
            .forEach((eventName) => instance.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.Hardware.AudioDeviceEvents)
                .forEach((eventName) => instance.off(eventName, handler));
        };
    });
}

function* onSubscribeToAudioDeviceEvents() {
    const channel = createAudioDeviceChannel();

    yield takeEvery(channel, function* onCallEvent(event) {
        console.log(`Device event: ${event.name}`, event);

        switch (event.name) {
        case Voximplant.Hardware.AudioDeviceEvents.DeviceChanged: {
            yield put(deviceChanged(event.currentDevice));
            break;
        }
        case Voximplant.Hardware.AudioDeviceEvents.DeviceListChanged: {
            yield put(deviceListChanged(event.newDeviceList));
            break;
        }
        default:
            console.log(`Unhandled audio device event ${event.name}`);
        }
    });

    yield take(unsubscribeFromAudioDeviceEvents);
    channel.close();
}

function onToggleAudioMute({ payload: { call: activeCall, isAudioMuted } }) {
    activeCall.sendAudio(!isAudioMuted);
}

function* onToggleVideoSend({ payload: { call: activeCall, isVideoBeingSent } }) {
    try {
        yield requestPermissions();
        yield activeCall.sendVideo(isVideoBeingSent);
    } catch (err) {
        put(showModal(`Failed to send video:\n${err.message}`));
    }
}

function onEndCall({ payload: { call: activeCall } }) {
    activeCall.hangup();
}

function* onToggleAudioDeviceSelector({ payload: { isAudioDeviceSelectorVisible } }) {
    if (isAudioDeviceSelectorVisible) {
        const devices = yield Voximplant.Hardware.AudioDeviceManager.getInstance()
            .getAudioDevices();
        yield put(deviceListChanged(devices));
    }
}

function* onSetAudioDevice({ payload: { device } }) {
    Voximplant.Hardware.AudioDeviceManager.getInstance()
        .selectAudioDevice(device);
    yield put(toggleAudioDeviceSelector(false));
}

export default function* incomingCallSaga() {
    yield all([
        takeLatest(subscribeToCallEvents, onSubscribeToCallEvents),
        takeLatest(subscribeToAudioDeviceEvents, onSubscribeToAudioDeviceEvents),
        takeLatest(toggleAudioMute, onToggleAudioMute),
        takeLatest(toggleVideoSend, onToggleVideoSend),
        takeLatest(endCall, onEndCall),
        takeLatest(toggleAudioDeviceSelector, onToggleAudioDeviceSelector),
        takeLatest(setAudioDevice, onSetAudioDevice),

        takeEvery(callConnected, onCallConnected),
        takeEvery(callFailed, onCallFailed),
        takeEvery(callDisconnected, onCallDisconnected),
        takeEvery(endpointAdded, onEndpointAdded),
    ]);
}

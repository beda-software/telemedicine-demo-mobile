import { Voximplant } from 'react-native-voximplant';
import { createReducer } from 'redux-act';

import {
    resetCallState,
    setCallStatus,
    toggleKeypad,
    toggleAudioMute,
    toggleVideoSend,
    toggleAudioDeviceSelector,

    callLocalVideoStreamChanged,
    endpointRemoveVideoStreamChanged,
    deviceChanged,
    deviceListChanged,
} from './actions';

const initialState = {
    callStatus: 'disconnected',
    isAudioMuted: false,
    isVideoBeingSent: false,
    isKeypadVisible: false,
    localVideoStreamId: null,
    remoteVideoStreamId: null,
    isAudioDeviceSelectorVisible: false,
    audioDeviceIcon: 'hearing',
    audioDeviceList: [],
};

export default createReducer(
    {
        [resetCallState]: () => initialState,
        [setCallStatus]: (state, { callStatus }) => ({
            ...state,
            callStatus,
        }),
        [toggleAudioDeviceSelector]: (state, { isAudioDeviceSelectorVisible }) => ({
            ...state,
            isAudioDeviceSelectorVisible,
        }),
        [toggleKeypad]: (state,) => ({
            ...state,
            isKeypadVisible: !state.isKeypadVisible,
        }),
        [toggleAudioMute]: (state, { isAudioMuted }) => ({
            ...state,
            isAudioMuted,
        }),
        [toggleVideoSend]: (state, { isVideoBeingSent }) => ({
            ...state,
            isVideoBeingSent,
        }),
        [callLocalVideoStreamChanged]: (state, { stream }) => ({
            ...state,
            localVideoStreamId: stream ? stream.id : null,
        }),
        [endpointRemoveVideoStreamChanged]: (state, { stream }) => ({
            ...state,
            remoteVideoStreamId: stream ? stream.id : null,
        }),
        [deviceChanged]: (state, { currentDevice }) => {
            const devices = Voximplant.Hardware.AudioDevice;
            const icons = {
                [devices.BLUETOOTH]: 'bluetooth-audio',
                [devices.SPEAKER]: 'volume-up',
                [devices.WIRED_HEADSET]: 'headset',
                [devices.EARPIECE]: 'hearing',
            };

            return {
                ...state,
                audioDeviceIcon: icons[currentDevice],
            };
        },
        [deviceListChanged]: (state, { newDeviceList }) => ({
            ...state,
            audioDeviceList: newDeviceList,
        }),
    },
    initialState
);

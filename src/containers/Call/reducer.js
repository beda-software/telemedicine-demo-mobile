import { Voximplant } from 'react-native-voximplant';
import {
    SET_CALL_STATUS,
    CALL_STATUS_DISCONNECTED,
    TOGGLE_KEYPAD,
    TOGGLE_AUDIO_MUTE,
    TOGGLE_VIDEO_SEND,

    CALL_LOCAL_VIDEO_STREAM_CHANGED,
    ENDPOINT_REMOTE_VIDEO_STREAM_CHANGED,
    DEVICE_CHANGED,
    DEVICE_LIST_CHANGED,
} from './constants';

const initialState = {
    callStatus: CALL_STATUS_DISCONNECTED,
    isAudioMuted: false,
    isVideoBeingSent: false,
    isKeypadVisible: false,
    isModalOpen: false,
    modalText: '',
    localVideoStreamId: null,
    remoteVideoStreamId: null,
    isAudioDeviceSelectionVisible: false,
    audioDeviceIcon: 'hearing',
    audioDeviceList: [],
};

export default function incomingCallReducer(state = initialState, action) {
    switch (action.type) {
    case SET_CALL_STATUS: {
        const { callStatus } = action;
        return {
            ...state,
            callStatus,
        };
    }
    case TOGGLE_KEYPAD: {
        const { isKeypadVisible } = state;
        return {
            ...state,
            isKeypadVisible: !isKeypadVisible,
        };
    }
    case TOGGLE_AUDIO_MUTE: {
        return {
            ...state,
            isAudioMuted: action.isAudioMuted,
        };
    }
    case TOGGLE_VIDEO_SEND: {
        return {
            ...state,
            isVideoBeingSent: action.isVideoBeingSent,
        };
    }
    case CALL_LOCAL_VIDEO_STREAM_CHANGED: {
        return {
            ...state,
            localVideoStreamId: action.stream ? action.stream.id : null,
        };
    }
    case ENDPOINT_REMOTE_VIDEO_STREAM_CHANGED: {
        return {
            ...state,
            remoteVideoStreamId: action.stream ? action.stream.id : null,
        };
    }
    case DEVICE_CHANGED: {
        switch (action.currentDevice) {
        case Voximplant.Hardware.AudioDevice.BLUETOOTH:
            return {
                ...state,
                audioDeviceIcon: 'bluetooth-audio',
            };
        case Voximplant.Hardware.AudioDevice.SPEAKER:
            return {
                ...state,
                audioDeviceIcon: 'volume-up',
            };

        case Voximplant.Hardware.AudioDevice.WIRED_HEADSET:
            return {
                ...state,
                audioDeviceIcon: 'headset',
            };
        case Voximplant.Hardware.AudioDevice.EARPIECE:
        default:
            return {
                ...state,
                audioDeviceIcon: 'hearing',
            };
        }
    }
    case DEVICE_LIST_CHANGED: {
        return {
            ...state,
            audioDeviceList: action.newDeviceList,
        };
    }
    default:
        return state;
    }
}

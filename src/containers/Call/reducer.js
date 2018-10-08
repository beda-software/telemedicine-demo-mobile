import {
    SET_CALL_STATUS,
    CALL_STATUS_DISCONNECTED,
    TOGGLE_KEYPAD,
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
    default:
        return state;
    }
}

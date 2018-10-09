import { createSelector } from 'reselect';

const selectCall = (state) => state.call;

export function makeSelectCallStatus() {
    return createSelector(
        selectCall,
        (callState) => callState.callStatus
    );
}

export function makeSelectIsAudioMuted() {
    return createSelector(
        selectCall,
        (callState) => callState.isAudioMuted
    );
}

export function makeSelectIsVideoBeingSent() {
    return createSelector(
        selectCall,
        (callState) => callState.isVideoBeingSent
    );
}

export function makeSelectIsKeypadVisible() {
    return createSelector(
        selectCall,
        (callState) => callState.isKeypadVisible
    );
}

export function makeSelectIsModalOpen() {
    return createSelector(
        selectCall,
        (callState) => callState.isModalOpen
    );
}

export function makeSelectModalText() {
    return createSelector(
        selectCall,
        (callState) => callState.modalText
    );
}

export function makeSelectLocalVideoStreamId() {
    return createSelector(
        selectCall,
        (callState) => callState.localVideoStreamId
    );
}

export function makeSelectRemoteVideoStreamId() {
    return createSelector(
        selectCall,
        (callState) => callState.remoteVideoStreamId
    );
}

export function makeSelectIsAudioDeviceSelectorVisible() {
    return createSelector(
        selectCall,
        (callState) => callState.isAudioDeviceSelectorVisible
    );
}

export function makeSelectAudioDeviceIcon() {
    return createSelector(
        selectCall,
        (callState) => callState.audioDeviceIcon
    );
}

export function makeSelectAudioDeviceList() {
    return createSelector(
        selectCall,
        (callState) => callState.audioDeviceList
    );
}

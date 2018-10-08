import { createSelector } from 'reselect';

const selectCall = (state) => state.call;

function makeSelectCallStatus() {
    return createSelector(
        selectCall,
        (callState) => callState.callStatus
    );
}

function makeSelectIsAudioMuted() {
    return createSelector(
        selectCall,
        (callState) => callState.isAudioMuted
    );
}

function makeSelectIsVideoBeingSent() {
    return createSelector(
        selectCall,
        (callState) => callState.isVideoBeingSent
    );
}

function makeSelectIsKeypadVisible() {
    return createSelector(
        selectCall,
        (callState) => callState.isKeypadVisible
    );
}

function makeSelectIsModalOpen() {
    return createSelector(
        selectCall,
        (callState) => callState.isModalOpen
    );
}

function makeSelectModalText() {
    return createSelector(
        selectCall,
        (callState) => callState.modalText
    );
}

function makeSelectLocalVideoStreamId() {
    return createSelector(
        selectCall,
        (callState) => callState.localVideoStreamId
    );
}

function makeSelectRemoteVideoStreamId() {
    return createSelector(
        selectCall,
        (callState) => callState.remoteVideoStreamId
    );
}

function makeSelectIsAudioDeviceSelectionVisible() {
    return createSelector(
        selectCall,
        (callState) => callState.isAudioDeviceSelectionVisible
    );
}

function makeSelectAudioDeviceIcon() {
    return createSelector(
        selectCall,
        (callState) => callState.audioDeviceIcon
    );
}

function makeSelectAudioDeviceList() {
    return createSelector(
        selectCall,
        (callState) => callState.audioDeviceList
    );
}

export {
    makeSelectCallStatus,
    makeSelectIsAudioMuted,
    makeSelectIsVideoBeingSent,
    makeSelectIsKeypadVisible,
    makeSelectIsModalOpen,
    makeSelectModalText,
    makeSelectLocalVideoStreamId,
    makeSelectRemoteVideoStreamId,
    makeSelectIsAudioDeviceSelectionVisible,
    makeSelectAudioDeviceIcon,
    makeSelectAudioDeviceList,
};

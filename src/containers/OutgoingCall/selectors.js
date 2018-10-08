import { createSelector } from 'reselect';

const selectOutgoingCall = (state) => state.outgoingCalll;

function makeSelectApiToken() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.apiToken
    );
}

function makeSelectCallStatus() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.callStatus
    );
}

function makeSelectIsAudioMuted() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.isAudioMuted
    );
}

function makeSelectIsVideoBeingSent() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.isVideoBeingSent
    );
}

function makeSelectIsKeypadVisible() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.isKeypadVisible
    );
}

function makeSelectIsModalOpen() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.isModalOpen
    );
}

function makeSelectModalText() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.modalText
    );
}

function makeSelectLocalVideoStreamId() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.localVideoStreamId
    );
}

function makeSelectRemoteVideoStreamId() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.remoteVideoStreamId
    );
}

function makeSelectIsAudioDeviceSelectionVisible() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.isAudioDeviceSelectionVisible
    );
}

function makeSelectAudioDeviceIcon() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.audioDeviceIcon
    );
}

function makeSelectAudioDeviceList() {
    return createSelector(
        selectOutgoingCall,
        (outgoingCallState) => outgoingCallState.audioDeviceList
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

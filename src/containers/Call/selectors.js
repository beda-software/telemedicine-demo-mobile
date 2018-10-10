import { createSelector } from 'reselect';

const selectCall = (state) => state.call;

export const selectCallStatus = createSelector(
    selectCall,
    (callState) => callState.callStatus,
);

export const selectIsAudioMuted = createSelector(
    selectCall,
    (callState) => callState.isAudioMuted,
);

export const selectIsVideoBeingSent = createSelector(
    selectCall,
    (callState) => callState.isVideoBeingSent,
);

export const selectIsKeypadVisible = createSelector(
    selectCall,
    (callState) => callState.isKeypadVisible,
);

export const selectLocalVideoStreamId = createSelector(
    selectCall,
    (callState) => callState.localVideoStreamId,
);

export const selectRemoteVideoStreamId = createSelector(
    selectCall,
    (callState) => callState.remoteVideoStreamId,
);

export const selectIsAudioDeviceSelectorVisible = createSelector(
    selectCall,
    (callState) => callState.isAudioDeviceSelectorVisible,
);

export const selectAudioDeviceIcon = createSelector(
    selectCall,
    (callState) => callState.audioDeviceIcon,
);

export const selectAudioDeviceList = createSelector(
    selectCall,
    (callState) => callState.audioDeviceList,
);

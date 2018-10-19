import { createAction } from 'redux-act';

export const resetCallState = createAction();
export const setCallStatus = createAction((callStatus) => ({ callStatus }));
export const toggleAudioMute = createAction((isAudioMuted) => ({ isAudioMuted }));
export const toggleVideoSend = createAction((isVideoBeingSent) => ({ isVideoBeingSent }));
export const toggleKeypad = createAction();
export const toggleAudioDeviceSelector = createAction((isAudioDeviceSelectorVisible) => ({ isAudioDeviceSelectorVisible }));
export const setAudioDevice = createAction((device) => ({ device }));
export const changeLocalVideoStream = createAction((stream) => ({ stream }));
export const changeRemoteVideoStream = createAction((stream) => ({ stream }));
export const changeDevice = createAction((currentDevice) => ({ currentDevice }));
export const changeDeviceList = createAction((newDeviceList) => ({ newDeviceList }));
export const answerCall = createAction((isVideo) => ({ isVideo }));
export const endCall = createAction();
export const makeOutgoingCall = createAction(
    (contact, isVideo) => ({ contact, isVideo })
);

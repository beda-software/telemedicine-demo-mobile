import { createAction } from 'redux-act';

export const resetCallState = createAction();
export const subscribeToCallEvents = createAction((call, isIncoming) => ({ call, isIncoming }));
export const unsubscribeFromCallEvents = createAction();
export const subscribeToAudioDeviceEvents = createAction();
export const unsubscribeFromAudioDeviceEvents = createAction();
export const setCallStatus = createAction((callStatus) => ({ callStatus }));
export const toggleAudioMute = createAction((call, isAudioMuted) => ({ call, isAudioMuted }));
export const toggleVideoSend = createAction((call, isVideoBeingSent) => ({ call, isVideoBeingSent }));
export const endCall = createAction((call) => ({ call }));
export const toggleKeypad = createAction();
export const toggleAudioDeviceSelector = createAction((isAudioDeviceSelectorVisible) => ({ isAudioDeviceSelectorVisible }));
export const selectAudioDevice = createAction((device) => ({ device }));

// TODO: think about better name, such as changeDevice instead of deviceChanged
// TODO: because now they look like an event handlers, not actions
export const callFailed = createAction((reason) => ({ reason }));
export const callDisconnected = createAction();
export const callConnected = createAction();
export const callLocalVideoStreamChanged = createAction((stream) => ({ stream }));
export const endpointAdded = createAction((endpoint) => ({ endpoint }));
export const endpointRemoved = createAction((endpoint) => ({ endpoint }));
export const endpointRemoveVideoStreamChanged = createAction((stream) => ({ stream }));
export const deviceChanged = createAction((currentDevice) => ({ currentDevice }));
export const deviceListChanged = createAction((newDeviceList) => ({ newDeviceList }));

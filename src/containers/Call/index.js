import React from 'react';
import {
    Text,
    View,
    Platform,
    Modal,
    SafeAreaView,
    StatusBar,
    TouchableHighlight,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { Voximplant } from 'react-native-voximplant';
import CallButton from 'components/CallButton';
import GlobalModal from 'components/Modal';
import { Keypad } from 'components/Keypad';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import styles from 'styles/Styles';
import { makeSelectActiveCall } from 'containers/App/selectors';
import {
    makeSelectCallStatus,
    makeSelectIsAudioMuted,
    makeSelectIsVideoBeingSent,
    makeSelectIsKeypadVisible,
    makeSelectLocalVideoStreamId,
    makeSelectRemoteVideoStreamId,
    makeSelectIsAudioDeviceSelectorVisible,
    makeSelectAudioDeviceIcon,
    makeSelectAudioDeviceList,
} from './selectors';
import {
    resetCallState,
    setCallStatus,
    subscribeToCallEvents,
    subscribeToAudioDeviceEvents,
    unsubscribeFromCallEvents,
    unsubscribeFromAudioDeviceEvents,
    toggleAudioMute,
    toggleVideoSend,
    endCall,
    toggleKeypad,
    toggleAudioDeviceSelector,
    selectAudioDevice,
} from './actions';


class CallScreen extends React.Component {
    componentDidMount() {
        const { isIncoming, isVideo } = this.props.navigation.state.params;
        const { activeCall } = this.props;

        this.props.resetCallState();
        this.props.subscribeToCallEvents(activeCall, isIncoming);
        this.props.subscribeToAudioDeviceEvents();
        this.props.toggleVideoSend(activeCall, isVideo);

        if (isIncoming) {
            const callSettings = {
                video: {
                    sendVideo: isVideo,
                    receiveVideo: isVideo,
                },
            };
            activeCall.answer(callSettings);
            this.props.setCallStatus('connected');
        } else {
            this.props.setCallStatus('connecting');
        }
    }

    componentWillUnmount() {
        this.props.unsubscribeFromCallEvents();
        this.props.unsubscribeFromAudioDeviceEvents();
    }

    _keypadPressed(value) {
        this.props.activeCall.sendTone(value);
    }

    flatListItemSeparator() {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#607D8B',
                    marginTop: 10,
                    marginBottom: 10,
                }}
            />
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar
                    barStyle={Platform.OS === 'ios' ? COLOR_SCHEME.DARK : COLOR_SCHEME.LIGHT}
                    backgroundColor={COLOR.PRIMARY_DARK}
                />
                <View style={styles.useragent}>
                    <View style={styles.videoPanel}>
                        {this.props.isVideoBeingSent ? (
                            <Voximplant.VideoView
                                style={styles.selfview}
                                videoStreamId={this.props.localVideoStreamId}
                                scaleType={Voximplant.RenderScaleType.SCALE_FIT}
                            />
                        ) : (
                            null
                        )}
                        <Voximplant.VideoView
                            style={styles.remotevideo}
                            videoStreamId={this.props.remoteVideoStreamId}
                            scaleType={Voximplant.RenderScaleType.SCALE_FIT}
                        />
                    </View>

                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={styles.call_connecting_label}>{this.props.callStatus}</Text>
                    </View>

                    {this.props.isKeypadVisible ? (
                        <Keypad keyPressed={(e) => this._keypadPressed(e)} />
                    ) : (
                        null
                    )}

                    <View style={styles.call_controls}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'transparent',
                            }}
                        >
                            <CallButton
                                icon_name={this.props.isAudioMuted ? 'mic' : 'mic-off'}
                                color={COLOR.ACCENT}
                                buttonPressed={() => this.props.toggleAudioMute(
                                    this.props.activeCall, !this.props.isAudioMuted,
                                )}
                            />
                            <CallButton
                                icon_name="dialpad"
                                color={COLOR.ACCENT}
                                buttonPressed={this.props.toggleKeypad}
                            />
                            <CallButton
                                icon_name={this.props.audioDeviceIcon}
                                color={COLOR.ACCENT}
                                buttonPressed={() => this.props.toggleAudioDeviceSelector(
                                    !this.props.isAudioDeviceSelectorVisible,
                                )}
                            />
                            <CallButton
                                icon_name={this.props.isVideoBeingSent ? 'videocam-off' : 'video-call'}
                                color={COLOR.ACCENT}
                                buttonPressed={() => this.props.toggleVideoSend(
                                    this.props.activeCall, !this.props.isVideoBeingSent,
                                )}
                            />
                            <CallButton
                                icon_name="call-end"
                                color={COLOR.RED}
                                buttonPressed={() => this.props.endCall(this.props.activeCall)}
                            />
                        </View>
                    </View>
                    <Modal
                        animationType="fade"
                        transparent
                        visible={this.props.isAudioDeviceSelectorVisible}
                        onRequestClose={() => {
                        }}
                    >
                        <TouchableHighlight
                            onPress={() => this.props.toggleAudioDeviceSelector(
                                !this.props.isAudioDeviceSelectorVisible,
                            )}
                            style={styles.container}
                        >
                            <View style={[styles.container, styles.modalBackground]}>
                                <View style={[styles.innerContainer, styles.innerContainerTransparent]}>
                                    <FlatList
                                        data={this.props.audioDeviceList}
                                        keyExtractor={(item) => item}
                                        ItemSeparatorComponent={this.flatListItemSeparator}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.props.selectAudioDevice(item);
                                                }}
                                            >
                                                <Text>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Modal>

                    <GlobalModal />
                </View>

            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    activeCall: makeSelectActiveCall(),
    callStatus: makeSelectCallStatus(),
    isAudioMuted: makeSelectIsAudioMuted(),
    isVideoBeingSent: makeSelectIsVideoBeingSent(),
    isKeypadVisible: makeSelectIsKeypadVisible(),
    localVideoStreamId: makeSelectLocalVideoStreamId(),
    remoteVideoStreamId: makeSelectRemoteVideoStreamId(),
    isAudioDeviceSelectorVisible: makeSelectIsAudioDeviceSelectorVisible(),
    audioDeviceIcon: makeSelectAudioDeviceIcon(),
    audioDeviceList: makeSelectAudioDeviceList(),
});

const mapDispatchToProps = (dispatch) => ({
    resetCallState: () => dispatch(resetCallState()),
    setCallStatus: (status) => dispatch(setCallStatus(status)),
    subscribeToCallEvents: (activeCall) => dispatch(subscribeToCallEvents(activeCall)),
    subscribeToAudioDeviceEvents: () => dispatch(subscribeToAudioDeviceEvents()),
    unsubscribeFromCallEvents: () => dispatch(unsubscribeFromCallEvents()),
    unsubscribeFromAudioDeviceEvents: () => dispatch(unsubscribeFromAudioDeviceEvents()),
    toggleAudioMute: (call, status) => dispatch(toggleAudioMute(call, status)),
    toggleVideoSend: (call, status) => dispatch(toggleVideoSend(call, status)),
    endCall: (activeCall) => dispatch(endCall(activeCall)),
    toggleKeypad: () => dispatch(toggleKeypad()),
    toggleAudioDeviceSelector: (status) => dispatch(toggleAudioDeviceSelector(status)),
    selectAudioDevice: (device) => dispatch(selectAudioDevice(device)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CallScreen);

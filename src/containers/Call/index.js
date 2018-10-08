import React from 'react';
import {
    Text,
    View,
    TouchableHighlight,
    Platform,
    SafeAreaView,
    StatusBar,
    FlatList,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { Voximplant } from 'react-native-voximplant';
import CallButton from 'components/CallButton';
import Modal from 'components/Modal';
import { Keypad } from 'components/Keypad';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import styles from 'styles/Styles';
import {
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
} from './selectors';
import {
    setCallStatusConnecting,
    subscribeToCallEvents,
    subscribeToAudioDeviceEvents,
    unsubscribeFromCallEvents,
    unsubscribeFromAudioDeviceEvents,
    toggleAudioMute,
    toggleVideoSend,
    endCall,
    toggleKeypad,
    switchAudioDevice,
    selectAudioDevice,
} from './actions';
import { makeSelectActiveCall } from 'containers/App/selectors';


class CallScreen extends React.Component {
    componentDidMount() {
        const { isIncoming, isVideoCall } = this.props.navigation.state.params;

        this.props.subscribeToCallEvents(this.props.activeCall, isIncoming);
        this.props.subscribeToAudioDeviceEvents();
        this.props.setCallStatusConnecting();

        if (isIncoming) {
            const callSettings = {
                video: {
                    sendVideo: isVideoCall,
                    receiveVideo: isVideoCall,
                },
            };
            this.props.activeCall.answer(callSettings);
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
                <View><Text>CALL!</Text></View>
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
                            {/* <CallButton
                                icon_name={this.props.audioDeviceIcon}
                                color={COLOR.ACCENT}
                                buttonPressed={this.props.switchAudioDevice}
                            />*/}
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
                    {/*<Modal
                        animationType="fade"
                        transparent
                        visible={this.state.audioDeviceSelectionVisible}
                        onRequestClose={() => {
                        }}
                    >
                        <TouchableHighlight
                            onPress={() => {
                                this.setState({ audioDeviceSelectionVisible: false });
                            }}
                            style={styles.container}
                        >
                            <View style={[styles.container, styles.modalBackground]}>
                                <View style={[styles.innerContainer, styles.innerContainerTransparent]}>
                                    <FlatList
                                        data={this.state.audioDevices}
                                        keyExtractor={(item, index) => item}
                                        ItemSeparatorComponent={this.flatListItemSeparator}
                                        renderItem={({ item }) => <Text
                                            onPress={() => {
                                                this.props.selectAudioDevice(item);
                                            }}
                                        > {item} </Text>}
                                    />
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Modal>*/}

                    <Modal />
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
    isModalOpen: makeSelectIsModalOpen(),
    modalText: makeSelectModalText(),
    localVideoStreamId: makeSelectLocalVideoStreamId(),
    remoteVideoStreamId: makeSelectRemoteVideoStreamId(),
    isAudioDeviceSelectionVisible: makeSelectIsAudioDeviceSelectionVisible(),
    audioDeviceIcon: makeSelectAudioDeviceIcon(),
    audioDeviceList: makeSelectAudioDeviceList(),
});

const mapDispatchToProps = (dispatch) => ({
    setCallStatusConnecting: () => dispatch(setCallStatusConnecting()),
    subscribeToCallEvents: (activeCall) => dispatch(subscribeToCallEvents(activeCall)),
    subscribeToAudioDeviceEvents: () => dispatch(subscribeToAudioDeviceEvents()),
    unsubscribeFromCallEvents: () => dispatch(unsubscribeFromCallEvents()),
    unsubscribeFromAudioDeviceEvents: () => dispatch(unsubscribeFromAudioDeviceEvents()),
    toggleAudioMute: (call, isAudioMuted) => dispatch(toggleAudioMute(call, isAudioMuted)),
    toggleVideoSend: (call, isVideoBeingSent) => dispatch(toggleVideoSend(call, isVideoBeingSent)),
    endCall: (activeCall) => dispatch(endCall(activeCall)),
    toggleKeypad: () => dispatch(toggleKeypad()),
    switchAudioDevice: () => dispatch(switchAudioDevice()),
    selectAudioDevice: (device) => dispatch(selectAudioDevice(device)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CallScreen);

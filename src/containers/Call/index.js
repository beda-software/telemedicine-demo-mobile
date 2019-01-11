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
import { Keypad } from 'components/Keypad';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import styles from 'styles/Styles';
import GlobalModal from 'containers/Modal';
import {
    selectCallStatus,
    selectIsAudioMuted,
    selectIsVideoBeingSent,
    selectIsKeypadVisible,
    selectLocalVideoStreamId,
    selectRemoteVideoStreamId,
    selectIsAudioDeviceSelectorVisible,
    selectAudioDeviceIcon,
    selectAudioDeviceList,
} from './selectors';
import {
    resetCallState,
    setCallStatus,
    toggleAudioMute,
    toggleVideoSend,
    toggleKeypad,
    toggleAudioDeviceSelector,
    setAudioDevice,
    endCall,
} from './actions';

class Call extends React.Component {
    static options() {
        return {
            topBar: {
                visible: false,
            },
        };
    }

    _keypadPressed(value) {
        // TODO: dispatch action
        // this.props.activeCall.sendTone(value);
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
                        ) : null}
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

                    {this.props.isKeypadVisible ? <Keypad keyPressed={(e) => this._keypadPressed(e)} /> : null}

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
                                buttonPressed={() => this.props.toggleAudioMute(!this.props.isAudioMuted)}
                            />
                            <CallButton
                                icon_name="dialpad"
                                color={COLOR.ACCENT}
                                buttonPressed={this.props.toggleKeypad}
                            />
                            <CallButton
                                icon_name={this.props.audioDeviceIcon}
                                color={COLOR.ACCENT}
                                buttonPressed={() =>
                                    this.props.toggleAudioDeviceSelector(!this.props.isAudioDeviceSelectorVisible)
                                }
                            />
                            <CallButton
                                icon_name={this.props.isVideoBeingSent ? 'videocam-off' : 'video-call'}
                                color={COLOR.ACCENT}
                                buttonPressed={() => this.props.toggleVideoSend(!this.props.isVideoBeingSent)}
                            />
                            <CallButton
                                icon_name="call-end"
                                color={COLOR.RED}
                                buttonPressed={() => this.props.endCall()}
                            />
                        </View>
                    </View>
                    <Modal
                        animationType="fade"
                        transparent
                        visible={this.props.isAudioDeviceSelectorVisible}
                        onRequestClose={() => {}}
                    >
                        <TouchableHighlight
                            onPress={() =>
                                this.props.toggleAudioDeviceSelector(!this.props.isAudioDeviceSelectorVisible)
                            }
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
                                                    this.props.setAudioDevice(item);
                                                }}
                                            >
                                                <Text>{item}</Text>
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
    callStatus: selectCallStatus,
    isAudioMuted: selectIsAudioMuted,
    isVideoBeingSent: selectIsVideoBeingSent,
    isKeypadVisible: selectIsKeypadVisible,
    localVideoStreamId: selectLocalVideoStreamId,
    remoteVideoStreamId: selectRemoteVideoStreamId,
    isAudioDeviceSelectorVisible: selectIsAudioDeviceSelectorVisible,
    audioDeviceIcon: selectAudioDeviceIcon,
    audioDeviceList: selectAudioDeviceList,
});

const mapDispatchToProps = {
    resetCallState,
    setCallStatus,
    toggleAudioMute,
    toggleVideoSend,
    endCall,
    toggleKeypad,
    toggleAudioDeviceSelector,
    setAudioDevice,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Call);

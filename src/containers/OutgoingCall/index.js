import React from 'react';
import {
    Text,
    View,
    Modal,
    TouchableHighlight,
    Platform,
    SafeAreaView,
    StatusBar,
    FlatList,
    PermissionsAndroid
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

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
    muteAudio,
    sendVideo,
    endCall,
    toggleKeypad,
    switchAudioDevice,
    selectAudioDevice,
} from './actions';

import { Voximplant } from 'react-native-voximplant';
import CallButton from '../components/CallButton';
import { Keypad } from '../components/Keypad';
import COLOR_SCHEME from '../styles/ColorScheme';
import COLOR from '../styles/Color';
import CallManager from '../manager/CallManager';
import styles from '../styles/Styles';

class CallScreen extends React.Component {
    componentDidMount() {
        this.props.subscribeToCallEvents();
        this.props.subscribeToAudioDeviceEvents();
        this.props.setCallStatusConnecting();
    }

    componentWillUnmount() {
        this.props.unsubscribeFromCallEvents();
        this.props.unsubscribeFromAudioDeviceEvents();
    }

    _keypadPressed(value) {
        console.log("CallScreen[" + this.callId + "] _keypadPressed(: " + value);
        this.call.sendTone(value);
    }

    _closeModal() {
        this.setState({isModalOpen: false, modalText: ''});
        this.props.navigation.navigate("App");
    }

    flatListItemSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: "#607D8B",
                    marginTop: 10,
                    marginBottom: 10
                }}
            />
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar barStyle={Platform.OS === 'ios' ? COLOR_SCHEME.DARK : COLOR_SCHEME.LIGHT}
                           backgroundColor={COLOR.PRIMARY_DARK}/>
                <View style={styles.useragent}>
                    <View style={styles.videoPanel}>
                        {this.state.isVideoSent ? (
                            <Voximplant.VideoView style={styles.selfview} videoStreamId={this.state.localVideoStreamId}
                                                  scaleType={Voximplant.RenderScaleType.SCALE_FIT}/>
                        ) : (
                            null
                        )}
                        <Voximplant.VideoView style={styles.remotevideo} videoStreamId={this.state.remoteVideoStreamId}
                                              scaleType={Voximplant.RenderScaleType.SCALE_FIT}/>
                    </View>

                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={styles.call_connecting_label}>{this.state.callState}</Text>
                    </View>

                    {this.state.isKeypadVisible ? (
                        <Keypad keyPressed={(e) => this._keypadPressed(e)}/>
                    ) : (
                        null
                    )}

                    <View style={styles.call_controls}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            backgroundColor: 'transparent'
                        }}>
                            {this.props.isAudioMuted ? (
                                <CallButton icon_name='mic' color={COLOR.ACCENT}
                                            buttonPressed={() => this.props.muteAudio()}/>
                            ) : (
                                <CallButton icon_name='mic-off' color={COLOR.ACCENT}
                                            buttonPressed={() => this.props.muteAudio()}/>
                            )}
                            <CallButton icon_name='dialpad' color={COLOR.ACCENT}
                                        buttonPressed={() => this.props.toggleKeypad()}/>
                            <CallButton icon_name={this.state.audioDeviceIcon} color={COLOR.ACCENT}
                                        buttonPressed={() => this.props.switchAudioDevice()}/>
                            {this.props.isVideoBeingSent ? (
                                <CallButton icon_name='videocam-off' color={COLOR.ACCENT}
                                            buttonPressed={() => this.props.sendVideo(false)}/>
                            ) : (
                                <CallButton icon_name='video-call' color={COLOR.ACCENT}
                                            buttonPressed={() => this.props.sendVideo(true)}/>
                            )}
                            <CallButton icon_name='call-end' color={COLOR.RED} buttonPressed={() => this.props.endCall()}/>

                        </View>
                    </View>

                    <Modal
                        animationType='fade'
                        transparent={true}
                        visible={this.state.audioDeviceSelectionVisible}
                        onRequestClose={() => {
                        }}>
                        <TouchableHighlight
                            onPress={() => {
                                this.setState({audioDeviceSelectionVisible: false})
                            }}
                            style={styles.container}>
                            <View style={[styles.container, styles.modalBackground]}>
                                <View style={[styles.innerContainer, styles.innerContainerTransparent]}>
                                    <FlatList
                                        data={this.state.audioDevices}
                                        keyExtractor={(item, index) => item}
                                        ItemSeparatorComponent={this.flatListItemSeparator}
                                        renderItem={({item}) => <Text onPress={() => {
                                            this.props.selectAudioDevice(item)
                                        }}> {item} </Text>}
                                    />
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Modal>


                    <Modal
                        animationType='fade'
                        transparent={true}
                        visible={this.state.isModalOpen}
                        onRequestClose={() => {
                        }}>
                        <TouchableHighlight
                            onPress={(e) => this._closeModal()}
                            style={styles.container}>
                            <View style={[styles.container, styles.modalBackground]}>
                                <View
                                    style={[styles.innerContainer, styles.innerContainerTransparent]}>
                                    <Text>{this.state.modalText}</Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </Modal>
                </View>

            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
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
    subscribeToCallEvents: () => dispatch(subscribeToCallEvents()),
    subscribeToAudioDeviceEvents: () => dispatch(subscribeToAudioDeviceEvents()),
    unsubscribeFromCallEvents: () => dispatch(unsubscribeFromCallEvents()),
    unsubscribeFromAudioDeviceEvents: () => dispatch(unsubscribeFromAudioDeviceEvents()),
    muteAudio: () => dispatch(muteAudio()),
    sendVideo: () => dispatch(sendVideo()),
    endCall: () => dispatch(endCall()),
    toggleKeypad: () => dispatch(toggleKeypad()),
    switchAudioDevice: () => dispatch(switchAudioDevice()),
    selectAudioDevice: (device) => dispatch(selectAudioDevice(device)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CallScreen);

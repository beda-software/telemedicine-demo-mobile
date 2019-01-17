import * as React from 'react';
// @ts-ignore
import autoBind from 'react-autobind';
import {
    FlatList,
    Modal,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
// @ts-ignore
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Keypad } from 'src/components/Keypad';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import CallService from 'src/services/call';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

type DeviceIcon = 'bluetooth-audio' | 'volume-up' | 'headset' | 'hearing';
interface DevicesIcons {
    [x: string]: DeviceIcon;
}
type Device = string; // devices.BLUETOOTH | devices.SPEAKER | devices.WIRED_HEADSET | devices.EARPIECE;
const devices = Voximplant.Hardware.AudioDevice;
const devicesIcons: DevicesIcons = {
    [devices.BLUETOOTH]: 'bluetooth-audio',
    [devices.SPEAKER]: 'volume-up',
    [devices.WIRED_HEADSET]: 'headset',
    [devices.EARPIECE]: 'hearing',
};

export interface Model {
    callStatus: string;
    isAudioMuted: boolean;
    isVideoBeingSent: boolean;
    isKeypadVisible: boolean;
    localVideoStreamId: string | null;
    remoteVideoStreamId: string | null;
    isAudioDeviceSelectorVisible: boolean;
    audioDeviceIcon: DeviceIcon;
    audioDeviceList: any[];
}

export const initial: Model = {
    callStatus: 'disconnected',
    isAudioMuted: false,
    isVideoBeingSent: false,
    isKeypadVisible: false,
    localVideoStreamId: null,
    remoteVideoStreamId: null,
    isAudioDeviceSelectorVisible: false,
    audioDeviceIcon: 'hearing',
    audioDeviceList: [],
};

interface ComponentProps {
    componentId: string;
    tree: Cursor<Model>;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
    isVideo: boolean;
    isIncoming?: boolean;
    callId: number;
}

async function requestPermissions(isVideo: boolean) {
    if (Platform.OS === 'android') {
        const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
        if (isVideo) {
            permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
        if (recordAudioGranted) {
            if (isVideo) {
                const cameraGranted = granted['android.permission.CAMERA'] === 'granted';

                if (!cameraGranted) {
                    throw new Error('Camera permission is not granted');
                }
            }
        } else {
            throw new Error('Record audio permission is not granted');
        }
    }

    return true;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                visible: false,
            },
        };
    }

    constructor(props: ComponentProps) {
        super(props);
        autoBind(this);

        this.call = CallService.getInstance().getCallById(props.callId);
    }

    public async componentDidMount() {
        this.props.tree.set(initial);

        const { isIncoming, isVideo } = this.props;

        this.props.tree.isVideoBeingSent.set(isVideo);

        try {
            await requestPermissions(isVideo);
        } catch (err) {
            await Navigation.showModal({ component: { name: 'td.Modal', passProps: { text: err } } });
        }

        if (this.call) {
            Object.keys(Voximplant.CallEvents).forEach((eventName) => {
                const callbackName = `onCall${eventName}`;

                if (typeof this[callbackName] !== 'undefined') {
                    console.log('bind', eventName);

                    this.call.on(eventName, (event: any) => {
                        console.log('EEEE', eventName, event);
                        this[callbackName](event);
                    });
                }
            });

            Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
                const callbackName = `onAudio${eventName}`;
                if (typeof this[callbackName] !== 'undefined') {
                    Voximplant.Hardware.AudioDeviceManager.getInstance().on(eventName, this[callbackName]);
                }
            });

            if (isIncoming) {
                this.call.getEndpoints().forEach((endpoint: any) => {
                    this.setupEndpointListeners(endpoint, true);
                });
                this.call.answer({
                    video: {
                        sendVideo: isVideo,
                        receiveVideo: true,
                    },
                });
            }
        }
    }

    public componentWillUnmount() {
        Object.keys(Voximplant.CallEvents).forEach((eventName) => {
            const callbackName = `onCall${eventName}`;
            if (typeof this[callbackName] !== 'undefined') {
                this.call.off(eventName, this[callbackName]);
            }
        });

        Object.keys(Voximplant.Hardware.AudioDeviceEvents).forEach((eventName) => {
            const callbackName = `onAudio${eventName}`;
            if (typeof this[callbackName] !== 'undefined') {
                Voximplant.Hardware.AudioDeviceManager.getInstance().off(eventName, this[callbackName]);
            }
        });
    }

    public onAudioDeviceChanged({ currentDevice }: { currentDevice: Device }) {
        this.props.tree.audioDeviceIcon.set(devicesIcons[currentDevice]);
    }

    public onAudioDeviceListChanged({ newDeviceList }: { newDeviceList: any[] }) {
        this.props.tree.audioDeviceList.set(newDeviceList);
    }

    public async onCallFailed(event: any) {
        //        this.callState = CALL_STATES.DISCONNECTED;
        // this.setState({
        //     isModalOpen: true,
        //     modalText: 'Call failed: ' + event.reason,
        //     remoteVideoStreamId: null,
        //     localVideoStreamId: null,
        // });

        console.log('CallScreen: _onCallFailed');
        CallService.getInstance().removeCall(this.call);

        await Navigation.dismissModal(this.props.componentId);
    }

    public async onCallDisconnected(event: any) {
        // this.setState({
        //     remoteVideoStreamId: null,
        //     localVideoStreamId: null,
        // });
        // CallManager.getInstance().removeCall(this.call);
        // this.callState = CALL_STATES.DISCONNECTED;
        // if (Platform.OS === 'android' && Platform.Version >= 26) {
        //     (async () => {
        //         await VIForegroundService.stopService();
        //     })();
        // }
        console.log('CallScreen: _onCallDisconnected');
        CallService.getInstance().removeCall(this.call);
        await Navigation.dismissModal(this.props.componentId);
    }

    public onCallConnected(event: any) {
        console.log('CallScreen: _onCallConnected: ' + this.props.callId);
    }

    public onCallLocalVideoStreamAdded(event: any) {
        console.log(
            'CallScreen: _onCallLocalVideoStreamAdded: ' +
                this.props.callId +
                ', video stream id: ' +
                event.videoStream.id
        );
        this.props.tree.localVideoStreamId.set(event.videoStream.id);
    }

    public onCallLocalVideoStreamRemoved(event: any) {
        console.log('CallScreen: _onCallLocalVideoStreamRemoved: ' + this.props.callId);
        this.props.tree.localVideoStreamId.set(null);
    }

    public onCallEndpointAdded(event: any) {
        console.log(
            'CallScreen: _onCallEndpointAdded: callId: ' + this.props.callId + ' endpoint id: ' + event.endpoint.id
        );
        this.setupEndpointListeners(event.endpoint, true);
    }

    public onEndpointRemoteVideoStreamAdded(event: any) {
        console.log(
            'CallScreen: _onEndpointRemoteVideoStreamAdded: callId: ' +
                this.props.callId +
                ' endpoint id: ' +
                event.endpoint.id
        );
        this.props.tree.remoteVideoStreamId.set(event.videoStream.id);
    }

    public onEndpointRemoteVideoStreamRemoved(event: any) {
        console.log(
            'CallScreen: _onEndpointRemoteVideoStreamRemoved: callId: ' +
                this.props.callId +
                ' endpoint id: ' +
                event.endpoint.id
        );
        this.props.tree.remoteVideoStreamId.set(null);
    }

    public onEndpointRemoved(event: any) {
        console.log(
            'CallScreen: _onEndpointRemoved: callId: ' + this.props.callId + ' endpoint id: ' + event.endpoint.id
        );
        this.setupEndpointListeners(event.endpoint, false);
    }

    public onEndpointInfoUpdated(event: any) {
        console.log(
            'CallScreen: _onEndpointInfoUpdated: callId: ' + this.props.callId + ' endpoint id: ' + event.endpoint.id
        );
    }

    public setupEndpointListeners(endpoint: any, setup: boolean) {
        Object.keys(Voximplant.EndpointEvents).forEach((eventName) => {
            const callbackName = `onEndpoint${eventName}`;
            if (typeof this[callbackName] !== 'undefined') {
                endpoint[setup ? 'on' : 'off'](eventName, this[callbackName]);
            }
        });
    }

    public keypadPressed(value: any) {
        this.call.sendTone(value);
    }

    public toggleKeypad() {
        this.props.tree.isKeypadVisible.apply((x) => !x);
    }

    public async toggleAudioMute() {
        this.props.tree.isAudioMuted.apply((x) => !x);
        const isAudioMuted = this.props.tree.isAudioMuted.get();
        await this.call.sendAudio(!isAudioMuted);
    }

    public async toggleVideoSend() {
        this.props.tree.isVideoBeingSent.apply((x) => !x);
        const isVideoBeingSent = this.props.tree.isVideoBeingSent.get();
        if (isVideoBeingSent) {
            try {
                await requestPermissions(true);
            } catch (err) {
                return Navigation.showModal({ component: { name: 'td.Modal', passProps: { text: err } } });
            }
        }
        await this.call.sendVideo(isVideoBeingSent);
    }

    public async toggleAudioDeviceSelector() {
        this.props.tree.isAudioDeviceSelectorVisible.apply((x) => !x);

        if (this.props.tree.isAudioDeviceSelectorVisible.get()) {
            const deviceList = await Voximplant.Hardware.AudioDeviceManager.getInstance().getAudioDevices();
            this.props.tree.audioDeviceList.set(deviceList);
        }
    }

    public setAudioDevice(device: Device) {
        this.props.tree.audioDeviceIcon.set(devicesIcons[device]);
        Voximplant.Hardware.AudioDeviceManager.getInstance().selectAudioDevice(device);
    }

    public async endCall() {
        this.call.getEndpoints().forEach((endpoint: any) => {
            this.setupEndpointListeners(endpoint, false);
        });

        this.call.hangup();
    }

    public renderItemSeparator() {
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

    public renderContent() {
        const {
            isVideoBeingSent,
            localVideoStreamId,
            remoteVideoStreamId,
            isKeypadVisible,
            isAudioMuted,
            callStatus,
            audioDeviceIcon,
            isAudioDeviceSelectorVisible,
            audioDeviceList,
        } = this.props.tree.get();

        return (
            <View style={s.useragent}>
                <View style={s.videoPanel}>
                    {isVideoBeingSent ? (
                        <Voximplant.VideoView
                            style={s.selfview}
                            videoStreamId={localVideoStreamId}
                            scaleType={Voximplant.RenderScaleType.SCALE_FIT}
                        />
                    ) : null}
                    <Voximplant.VideoView
                        style={s.remotevideo}
                        videoStreamId={remoteVideoStreamId}
                        scaleType={Voximplant.RenderScaleType.SCALE_FIT}
                    />
                </View>

                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={s.call_connecting_label}>{callStatus}</Text>
                </View>

                {isKeypadVisible ? <Keypad keyPressed={(value: any) => this.keypadPressed(value)} /> : null}

                <View style={s.call_controls}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            backgroundColor: 'transparent',
                        }}
                    >
                        <CallButton
                            icon_name={isAudioMuted ? 'mic' : 'mic-off'}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleAudioMute()}
                        />
                        <CallButton
                            icon_name="dialpad"
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleKeypad()}
                        />
                        <CallButton
                            icon_name={audioDeviceIcon}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleAudioDeviceSelector()}
                        />
                        <CallButton
                            icon_name={isVideoBeingSent ? 'videocam-off' : 'video-call'}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleVideoSend()}
                        />
                        <CallButton icon_name="call-end" color={COLOR.RED} buttonPressed={() => this.endCall()} />
                    </View>
                </View>
                <Modal
                    animationType="fade"
                    transparent
                    visible={isAudioDeviceSelectorVisible}
                    onRequestClose={() => {}}
                >
                    <TouchableHighlight onPress={() => this.toggleAudioDeviceSelector()} style={s.container}>
                        <View style={[s.container, s.modalBackground]}>
                            <View style={[s.innerContainer, s.innerContainerTransparent]}>
                                <FlatList
                                    data={audioDeviceList}
                                    keyExtractor={(item) => item}
                                    ItemSeparatorComponent={this.renderItemSeparator}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.setAudioDevice(item);
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
            </View>
        );
    }

    public render() {
        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                {this.renderContent()}
            </SafeAreaView>
        );
    }
}

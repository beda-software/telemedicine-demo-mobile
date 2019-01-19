import * as React from 'react';
import autoBind from 'react-autobind';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Keypad } from 'src/components/Keypad';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { CallService, CallSubscription } from 'src/services/call';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

type DeviceIcon = 'bluetooth-audio' | 'volume-up' | 'headset' | 'hearing';
interface DevicesIcons {
    [x: string]: DeviceIcon;
}
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
    callStatus: 'waiting',
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
    isIncoming: boolean;
    callId: string;
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

    private readonly subscription: CallSubscription;

    constructor(props: ComponentProps) {
        super(props);

        autoBind(this);

        this.props.tree.set(initial);

        const { callId, isIncoming, isVideo } = this.props;

        this.props.tree.isVideoBeingSent.set(isVideo);

        this.subscription = CallService.subscribeToCallEvents(callId, isIncoming, {
            onAudioDeviceChanged: this.onAudioDeviceChanged,
            onAudioDeviceListChanged: this.onAudioDeviceListChanged,
            onCallFailed: this.onCallFailed,
            onCallDisconnected: this.onCallDisconnected,
            onCallConnected: this.onCallConnected,
            onCallLocalVideoStreamAdded: this.onCallLocalVideoStreamAdded,
            onCallLocalVideoStreamRemoved: this.onCallLocalVideoStreamRemoved,
            onEndpointRemoteVideoStreamAdded: this.onEndpointRemoteVideoStreamAdded,
            onEndpointRemoteVideoStreamRemoved: this.onEndpointRemoteVideoStreamRemoved,
        });
    }

    public async componentDidMount() {
        const { isVideo } = this.props;

        try {
            await CallService.requestPermissions(isVideo);
        } catch (err) {
            await Navigation.showModal({ component: { name: 'td.Modal', passProps: { text: err } } });
        }
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    public onAudioDeviceChanged({ currentDevice }: { currentDevice: string }) {
        this.props.tree.audioDeviceIcon.set(devicesIcons[currentDevice]);
    }

    public onAudioDeviceListChanged({ newDeviceList }: { newDeviceList: any[] }) {
        this.props.tree.audioDeviceList.set(newDeviceList);
    }

    public async onCallFailed(event: any) {
        await Navigation.dismissModal(this.props.componentId);
    }

    public async onCallDisconnected(event: any) {
        await Navigation.dismissModal(this.props.componentId);
    }

    public onCallConnected(event: any) {
        this.props.tree.callStatus.set('connected');
    }

    public onCallLocalVideoStreamAdded(event: any) {
        this.props.tree.localVideoStreamId.set(event.videoStream.id);
    }

    public onCallLocalVideoStreamRemoved(event: any) {
        this.props.tree.localVideoStreamId.set(null);
    }

    public onEndpointRemoteVideoStreamAdded(event: any) {
        this.props.tree.remoteVideoStreamId.set(event.videoStream.id);
    }

    public onEndpointRemoteVideoStreamRemoved(event: any) {
        this.props.tree.remoteVideoStreamId.set(null);
    }

    public keypadPressed(value: any) {
        this.subscription.sendTone(value);
    }

    public toggleKeypad() {
        this.props.tree.isKeypadVisible.apply((x) => !x);
    }

    public async toggleAudioMute() {
        this.props.tree.isAudioMuted.apply((x) => !x);
        const isAudioMuted = this.props.tree.isAudioMuted.get();
        await this.subscription.sendAudio(!isAudioMuted);
    }

    public async toggleVideoSend() {
        this.props.tree.isVideoBeingSent.apply((x) => !x);
        const isVideoBeingSent = this.props.tree.isVideoBeingSent.get();
        if (isVideoBeingSent) {
            try {
                await CallService.requestPermissions(true);
            } catch (err) {
                return Navigation.showModal({ component: { name: 'td.Modal', passProps: { text: err } } });
            }
        }
        await this.subscription.sendVideo(isVideoBeingSent);
    }

    public async toggleAudioDeviceSelector() {
        this.props.tree.isAudioDeviceSelectorVisible.apply((x) => !x);

        if (this.props.tree.isAudioDeviceSelectorVisible.get()) {
            const deviceList = await this.subscription.getAudioDevices();
            this.props.tree.audioDeviceList.set(deviceList);
        }
    }

    public setAudioDevice(device: string) {
        this.props.tree.audioDeviceIcon.set(devicesIcons[device]);
        this.subscription.setAudioDevice(device);
    }

    public endCall() {
        this.subscription.endCall();
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
        const isConnected = callStatus === 'connected';

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
                            disabled={!isConnected}
                        />
                        <CallButton
                            icon_name="dialpad"
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleKeypad()}
                            disabled={!isConnected}
                        />
                        <CallButton
                            icon_name={audioDeviceIcon}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleAudioDeviceSelector()}
                            disabled={!isConnected}
                        />
                        <CallButton
                            icon_name={isVideoBeingSent ? 'videocam-off' : 'video-call'}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleVideoSend()}
                            disabled={!isConnected}
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

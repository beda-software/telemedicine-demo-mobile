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
import { schema } from 'src/libs/state';
import { CallService } from 'src/services/call';
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
    isPending: boolean;
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
    isPending: false,
};

interface ComponentProps {
    componentId: string;
    tree: Cursor<Model>;
    session: Session;
    isIncoming: boolean;
    callId: string;
    setAudioDevice: (device: string) => void;
    getAudioDevices: () => Promise<string[]>;
    sendTone: (value: number) => void;
    sendVideo: (send: boolean) => void;
    sendAudio: (send: boolean) => void;
    endCall: () => void;
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

    private readonly unsubscribe: () => void;

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);

        autoBind(this);

        const { callId, isIncoming } = this.props;

        this.unsubscribe = CallService.subscribeToCallEvents(callId, isIncoming, {
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

    public componentWillUnmount() {
        this.unsubscribe();
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
        this.props.sendTone(value);
    }

    public toggleKeypad() {
        this.props.tree.isKeypadVisible.apply((x) => !x);
    }

    public async toggleAudioMute() {
        this.props.tree.isAudioMuted.apply((x) => !x);
        const isAudioMuted = this.props.tree.isAudioMuted.get();
        await this.props.sendAudio(!isAudioMuted);
    }

    public async toggleVideoSend() {
        try {
            await CallService.requestPermissions(true);
        } catch (err) {
            return Navigation.showOverlay({ component: { name: 'td.Modal', passProps: { text: err.message } } });
        }

        this.props.tree.isVideoBeingSent.apply((x) => !x);
        const isVideoBeingSent = this.props.tree.isVideoBeingSent.get();
        await this.props.sendVideo(isVideoBeingSent);
    }

    public async toggleAudioDeviceSelector() {
        this.props.tree.isAudioDeviceSelectorVisible.apply((x) => !x);

        if (this.props.tree.isAudioDeviceSelectorVisible.get()) {
            const deviceList = await this.props.getAudioDevices();
            this.props.tree.audioDeviceList.set(deviceList);
        }
    }

    public setAudioDevice(device: string) {
        this.props.tree.audioDeviceIcon.set(devicesIcons[device]);
        this.props.setAudioDevice(device);
    }

    public endCall() {
        this.props.tree.isPending.set(true);
        this.props.endCall();
    }

    public renderItemSeparator() {
        return <View style={s.itemSeparator} />;
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
            isPending,
        } = this.props.tree.get();
        const isConnected = callStatus === 'connected';

        return (
            <View style={s.useragent}>
                <View style={s.videoPanel}>
                    <Voximplant.VideoView
                        style={s.remoteVideo}
                        videoStreamId={remoteVideoStreamId}
                        scaleType={Voximplant.RenderScaleType.SCALE_FIT}
                    />
                    {isVideoBeingSent ? (
                        <Voximplant.VideoView
                            style={s.selfView}
                            videoStreamId={localVideoStreamId}
                            scaleType={Voximplant.RenderScaleType.SCALE_FIT}
                        />
                    ) : null}
                </View>

                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={s.callConnectingLabel}>{callStatus}</Text>
                </View>

                {isKeypadVisible ? <Keypad keyPressed={(value: any) => this.keypadPressed(value)} /> : null}
                <View style={s.callControls}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            backgroundColor: 'transparent',
                        }}
                    >
                        <CallButton
                            iconName={isAudioMuted ? 'mic' : 'mic-off'}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleAudioMute()}
                            disabled={!isConnected}
                        />
                        <CallButton
                            iconName="dialpad"
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleKeypad()}
                            disabled={!isConnected}
                        />
                        <CallButton
                            iconName={audioDeviceIcon}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleAudioDeviceSelector()}
                            disabled={!isConnected}
                        />
                        <CallButton
                            iconName={isVideoBeingSent ? 'videocam-off' : 'video-call'}
                            color={COLOR.ACCENT}
                            buttonPressed={() => this.toggleVideoSend()}
                            disabled={!isConnected}
                        />
                        <CallButton
                            iconName="call-end"
                            color={COLOR.RED}
                            disabled={isPending}
                            buttonPressed={() => this.endCall()}
                        />
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

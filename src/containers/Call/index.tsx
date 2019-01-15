import * as React from 'react';
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
// @ts-ignore
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Keypad } from 'src/components/Keypad';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
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

    public keypadPressed(event: any) {
        console.log(event);
        // TODO: dispatch action
        // this.props.activeCall.sendTone(value);
    }

    public toggleKeypad() {
        this.props.tree.isKeypadVisible.apply((x) => !x);
    }

    public toggleAudioMute() {
        this.props.tree.isAudioMuted.apply((x) => !x);
    }

    public toggleVideoSend() {
        this.props.tree.isVideoBeingSent.apply((x) => !x);
    }

    public toggleAudioDeviceSelector() {
        this.props.tree.isAudioDeviceSelectorVisible.apply((x) => !x);
    }

    public setAudioDevice(device: Device) {
        this.props.tree.audioDeviceIcon.set(devicesIcons[device]);
    }

    public async endCall() {
        await Navigation.dismissModal(this.props.componentId);
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

                {isKeypadVisible ? <Keypad keyPressed={(event: any) => this.keypadPressed(event)} /> : null}

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

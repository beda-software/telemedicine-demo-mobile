import * as React from 'react';
import autoBind from 'react-autobind';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Cursor } from 'src/contrib/typed-baobab';
import { schema } from 'src/libs/state';
import { CallService } from 'src/services/call';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

const devices = Voximplant.Hardware.AudioDevice;

export interface Model {
    callStatus: string;
    isVideoBeingSent: boolean;
    localVideoStreamId: string | null;
    remoteVideoStreamId: string | null;
    isPending: boolean;
}

export const initial: Model = {
    callStatus: 'waiting',
    isVideoBeingSent: false,
    localVideoStreamId: null,
    remoteVideoStreamId: null,
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

    public async toggleVideoSend() {
        try {
            await CallService.requestPermissions(true);
        } catch (err) {
            return Navigation.showOverlay({ component: { name: 'td.Modal', passProps: { text: err.message } } });
        }

        this.props.tree.isVideoBeingSent.apply((x) => !x);
        const isVideoBeingSent = this.props.tree.isVideoBeingSent.get();
        await this.props.sendVideo(isVideoBeingSent);
        await this.props.setAudioDevice(isVideoBeingSent ? devices.SPEAKER : devices.EARPIECE);
    }

    public endCall() {
        if (this.props.tree.isPending.get()) {
            return;
        }

        this.props.tree.isPending.set(true);
        this.props.endCall();
    }

    public renderContent() {
        const {
            isVideoBeingSent,
            localVideoStreamId,
            remoteVideoStreamId,
            callStatus,
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
                            showOnTop
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

                <View style={s.callControls}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            backgroundColor: 'transparent',
                        }}
                    >
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

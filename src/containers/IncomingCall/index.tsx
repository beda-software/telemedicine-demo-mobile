import * as React from 'react';
import autoBind from 'react-autobind';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { CallButton } from 'src/components/CallButton';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { CallService, IncomingCallSubscription } from 'src/services/call';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

export interface Model {}

export const initial: Model = {};

interface ComponentProps {
    componentId: string;
    callerDisplayName: string;
    tree: Cursor<Model>;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
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

    private readonly subscription: IncomingCallSubscription;

    constructor(props: ComponentProps) {
        super(props);

        autoBind(this);

        this.subscription = CallService.subscribeToIncomingCallEvents(props.callId, {
            onCallDisconnected: this.onCallDisconnected,
            onCallFailed: this.onCallFailed,
        });
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    public async answerCall(isVideo: boolean) {
        // TODO: disable each button on click in the whole project
        await Navigation.showModal({
            component: {
                name: 'td.Call',
                passProps: { isVideo, callId: this.props.callId, isIncoming: true },
            },
        });
        await Navigation.dismissModal(this.props.componentId);
    }

    public async onCallDisconnected() {
        await Navigation.dismissModal(this.props.componentId);
    }

    public async onCallFailed() {
        await Navigation.dismissModal(this.props.componentId);
    }

    public endCall() {
        this.subscription.endCall();
    }

    public render() {
        const { callerDisplayName } = this.props;

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <Text style={s.incoming_call}>Incoming call from:</Text>
                <Text style={s.incoming_call}>{callerDisplayName}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        height: 90,
                    }}
                >
                    <CallButton icon_name="call" color={COLOR.ACCENT} buttonPressed={() => this.answerCall(false)} />
                    <CallButton icon_name="videocam" color={COLOR.ACCENT} buttonPressed={() => this.answerCall(true)} />
                    <CallButton icon_name="call-end" color={COLOR.RED} buttonPressed={() => this.endCall()} />
                </View>
            </SafeAreaView>
        );
    }
}

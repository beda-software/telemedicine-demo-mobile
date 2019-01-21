import * as React from 'react';
import autoBind from 'react-autobind';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { CallButton } from 'src/components/CallButton';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { CallService } from 'src/services/call';
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
    answerCall: () => void;
    declineCall: () => void;
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

        autoBind(this);

        this.unsubscribe = CallService.subscribeToIncomingCallEvents(props.callId, {
            onCallDisconnected: this.onCallDisconnected,
            onCallFailed: this.onCallFailed,
        });
    }

    public componentWillUnmount() {
        this.unsubscribe();
    }

    public async onCallDisconnected() {
        await Navigation.dismissModal(this.props.componentId);
    }

    public async onCallFailed() {
        await Navigation.dismissModal(this.props.componentId);
    }

    public async answerCall() {
        try {
            await CallService.requestPermissions(false);
        } catch (err) {
            return Navigation.showOverlay({ component: { name: 'td.Modal', passProps: { text: err.message } } });
        }

        this.props.answerCall();
    }

    public render() {
        const { callerDisplayName, declineCall } = this.props;

        return (
            <SafeAreaView style={[s.safearea, s.alignCenter]}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <Text style={s.incomingCall}>Incoming call from:</Text>
                <Text style={s.incomingCall}>{callerDisplayName}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        height: 90,
                    }}
                >
                    <CallButton iconName="call" color={COLOR.ACCENT} buttonPressed={() => this.answerCall()} />
                    <CallButton iconName="call-end" color={COLOR.RED} buttonPressed={() => declineCall()} />
                </View>
            </SafeAreaView>
        );
    }
}

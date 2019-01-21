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

export interface Model {
    isPending: boolean;
}

export const initial: Model = {
    isPending: false,
};

interface ComponentProps {
    componentId: string;
    callerDisplayName: string;
    tree: Cursor<Model>;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
    callId: string;
    answerCall: () => Promise<void>;
    declineCall: () => Promise<void>;
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
        this.props.tree.isPending.set(true);

        try {
            await CallService.requestPermissions(false);
        } catch (err) {
            this.props.tree.isPending.set(false);
            return Navigation.showOverlay({ component: { name: 'td.Modal', passProps: { text: err.message } } });
        }

        await this.props.answerCall();
    }

    public async declineCall() {
        this.props.tree.isPending.set(true);
        await this.props.declineCall();
    }

    public render() {
        const { callerDisplayName, tree } = this.props;
        const isPending = tree.isPending.get();

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
                    <CallButton
                        iconName="call"
                        color={COLOR.ACCENT}
                        buttonPressed={() => this.answerCall()}
                        disabled={isPending}
                    />
                    <CallButton
                        iconName="call-end"
                        color={COLOR.RED}
                        buttonPressed={() => this.declineCall()}
                        disabled={isPending}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

import * as React from 'react';
import { FlatList, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Preloader } from 'src/components/Preloader';
import { Bundle, BundleEntry, User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoadingCursor, isNotAskedCursor, isSuccessCursor, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import CallService from 'src/services/call';
import { getFHIRResources } from 'src/services/fhir';
import { clearSession, Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

export interface Model {
    contactListBundleResponse: RemoteData<Bundle<User>>;
}

export const initial: Model = {
    contactListBundleResponse: notAsked,
};

interface ComponentProps {
    tree: Cursor<Model>;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
    deinit: () => void;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                title: {
                    text: 'Telemedicine Demo',
                },
                leftButtons: [],
                rightButtons: [
                    {
                        id: 'logout',
                        text: 'Logout',
                    },
                ],
            },
        };
    }

    constructor(props: ComponentProps) {
        super(props);
        Navigation.events().bindComponent(this);
    }

    public async componentDidMount() {
        await this.fetchContacts();
    }

    public async navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'logout') {
            await this.logout();
        }
    }

    public async logout() {
        await clearSession(this.props.sessionResponseCursor);
        await this.props.deinit();
        await Navigation.setStackRoot('root', { component: { name: 'td.Login' } });
    }

    public async fetchContacts() {
        const { sessionResponseCursor } = this.props;

        // TODO: how to deal with it?
        if (isSuccessCursor(sessionResponseCursor)) {
            await getFHIRResources(
                this.props.tree.contactListBundleResponse,
                'User',
                {},
                sessionResponseCursor.data.get().token
            );
        }
    }

    public async makeOutgoingCall(user: User, isVideo: boolean) {
        const call = await Voximplant.getInstance().call(user.username, {
            video: {
                sendVideo: isVideo,
                receiveVideo: true,
            },
        });
        const callService = CallService.getInstance();
        callService.addCall(call);
        callService.startOutgoingCallViaCallKit(isVideo, user.username);

        await Navigation.showModal({ component: { name: 'td.Call', passProps: { isVideo, callId: call.callId } } });
    }

    public renderContent() {
        const bundleResponseCursor = this.props.tree.contactListBundleResponse;
        if (isNotAskedCursor(bundleResponseCursor) || isLoadingCursor(bundleResponseCursor)) {
            return <Preloader isVisible={true} />;
        }

        if (isSuccessCursor(bundleResponseCursor)) {
            const bundle = bundleResponseCursor.data.get();
            const contactList = bundle.entry || [];

            return (
                <FlatList<BundleEntry<User>>
                    data={contactList}
                    listKey="contact-list"
                    keyExtractor={(item) => item.resource!.id}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                alignSelf: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingLeft: 10,
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={s.contactListItem}>{item.resource!.displayName}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <CallButton
                                    icon_name="call"
                                    color={COLOR.ACCENT}
                                    buttonPressed={() => this.makeOutgoingCall(item.resource!, false)}
                                />
                                <CallButton
                                    icon_name="videocam"
                                    color={COLOR.ACCENT}
                                    buttonPressed={() => this.makeOutgoingCall(item.resource!, true)}
                                />
                            </View>
                        </View>
                    )}
                />
            );
        }

        return (
            <View>
                <Text>Something went wrong</Text>
            </View>
        );
    }

    public render() {
        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <View style={s.useragent}>{this.renderContent()}</View>
            </SafeAreaView>
        );
    }
}

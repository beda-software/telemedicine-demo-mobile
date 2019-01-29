import * as R from 'ramda';
import * as React from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Preloader } from 'src/components/Preloader';
import { Bundle, User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoadingCursor, isNotAskedCursor, isSuccess, isSuccessCursor, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { CallService } from 'src/services/call';
import { createConversation } from 'src/services/chat';
import { getFHIRResources } from 'src/services/fhir';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

type Conversation = Voximplant['Messaging']['Conversation'];

export interface Model {
    contactListBundleResponse: RemoteData<Bundle<User>>;
    createConversationResponse: RemoteData<Conversation>;
    isPending: boolean;
}

export const initial: Model = {
    contactListBundleResponse: notAsked,
    createConversationResponse: notAsked,
    isPending: false,
};

interface ComponentProps {
    componentId: string;
    tree: Cursor<Model>;
    session: Session;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                title: {
                    text: 'Contacts',
                },
                leftButtons: [
                    {
                        id: 'menu',
                        icon:
                            Platform.OS === 'ios'
                                ? require('src/images/burger_ios.png')
                                : require('src/images/burger_android.png'),
                        color: 'black',
                    },
                ],
            },
            sideMenu: {
                left: {
                    enabled: true,
                },
            },
        };
    }

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);

        Navigation.events().bindComponent(this);
    }

    public async componentDidMount() {
        await this.fetchContacts();
    }

    public navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'menu') {
            Navigation.mergeOptions(this.props.componentId, {
                sideMenu: {
                    left: {
                        visible: true,
                    },
                },
            });
        }
    }

    public async fetchContacts() {
        const { session } = this.props;

        await getFHIRResources(this.props.tree.contactListBundleResponse, 'User', {}, session.token);
    }

    public async makeOutgoingCall(user: User) {
        if (this.props.tree.isPending.get()) {
            return;
        }

        this.props.tree.isPending.set(true);

        try {
            try {
                await CallService.requestPermissions(false);
            } catch (err) {
                return Navigation.showOverlay({
                    component: {
                        name: 'td.Modal',
                        passProps: { text: err.message },
                    },
                });
            }
            await CallService.startOutgoingCall(user.username, user.displayName);
        } finally {
            this.props.tree.isPending.set(false);
        }
    }

    public async openChat(user: User, users: User[]) {
        if (this.props.tree.isPending.get()) {
            return;
        }

        this.props.tree.isPending.set(true);

        try {
            const conversationResponse = await createConversation(
                this.props.tree.createConversationResponse,
                this.props.session.username,
                [user.username],
                undefined,
                true
            );

            if (isSuccess(conversationResponse)) {
                await Navigation.push(this.props.componentId, {
                    component: {
                        name: 'td.Chat',
                        passProps: {
                            conversation: conversationResponse.data,
                            users,
                        },
                        options: {
                            topBar: {
                                title: { text: user.displayName, color: COLOR.BLACK },
                            },
                        },
                    },
                });
            } else {
                await Navigation.showOverlay({
                    component: {
                        name: 'td.Modal',
                        passProps: {
                            text: `Something went wrong with conversation creating. ${JSON.stringify(
                                conversationResponse.error
                            )}`,
                        },
                    },
                });
            }
        } finally {
            this.props.tree.isPending.set(false);
        }
    }

    public renderContent() {
        const { tree, session } = this.props;

        const sessionUsername = session.username;
        const bundleResponseCursor = tree.contactListBundleResponse;
        if (isNotAskedCursor(bundleResponseCursor) || isLoadingCursor(bundleResponseCursor)) {
            return <Preloader isVisible={true} />;
        }

        if (isSuccessCursor(bundleResponseCursor)) {
            const bundle = bundleResponseCursor.data.get();
            const contactList = bundle.entry || [];
            const users = R.map((contactEntry) => contactEntry.resource!, contactList);

            return (
                <FlatList<User>
                    data={users}
                    listKey="contact-list"
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        if (item.username === sessionUsername) {
                            return null;
                        }

                        return (
                            <View
                                style={{
                                    alignSelf: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingLeft: 10,
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={s.contactListItem}>{item.displayName}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <CallButton
                                        iconName="chat"
                                        color={COLOR.ACCENT}
                                        buttonPressed={() => this.openChat(item, users)}
                                    />
                                    <CallButton
                                        iconName="call"
                                        color={COLOR.ACCENT}
                                        buttonPressed={() => this.makeOutgoingCall(item)}
                                    />
                                </View>
                            </View>
                        );
                    }}
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
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <View style={s.useragent}>{this.renderContent()}</View>
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

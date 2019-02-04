import * as React from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Preloader } from 'src/components/Preloader';
import { Bundle, User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isFailure, isLoading, isNotAsked, isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { CallService } from 'src/services/call';
import { createConversation, prepareConversationsCache } from 'src/services/chat';
import { getFHIRResources } from 'src/services/fhir';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

type Conversation = Voximplant['Messaging']['Conversation'];

export interface Model {
    contactListBundleResponse: RemoteData<Bundle<User>>;
    createConversationResponse: RemoteData<Conversation>;
    contacts: User[];
    isPending: boolean;
}

export const initial: Model = {
    contactListBundleResponse: notAsked,
    createConversationResponse: notAsked,
    contacts: [],
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
                    visible: false,
                },
            },
        };
    }

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);

        Navigation.events().bindComponent(this);

        prepareConversationsCache(props.session.username);
    }

    public async componentDidAppear() {
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
        const { session, tree } = this.props;

        const response = await getFHIRResources(tree.contactListBundleResponse, 'User', {}, session.token);
        if (isSuccess(response)) {
            const entries = response.data.entry || [];
            tree.contacts.set(entries.map((entry) => entry!.resource!));
        }
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
        const contacts = tree.contacts.get();
        const bundleResponse = tree.contactListBundleResponse.get();

        if (!contacts.length && (isNotAsked(bundleResponse) || isLoading(bundleResponse))) {
            return <Preloader isVisible={true} />;
        }

        if (isFailure(bundleResponse)) {
            return (
                <View>
                    <Text>Something went wrong</Text>
                </View>
            );
        }

        return (
            <FlatList<User>
                data={contacts}
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
                                    buttonPressed={() => this.openChat(item, contacts)}
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

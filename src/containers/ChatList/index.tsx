import * as R from 'ramda';
import * as React from 'react';
import { FlatList, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import { CallButton } from 'src/components/CallButton';
import { Preloader } from 'src/components/Preloader';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoading, isNotAsked, isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { getChatUser, getConversations, makeUsername } from 'src/services/chat';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

type ChatUser = Voximplant['Messaging']['User'];
type Conversation = Voximplant['Messaging']['Conversation'];

export interface Model {
    isPending: boolean;
    chatUserResponse: RemoteData<ChatUser>;
    conversationsResponse: RemoteData<Conversation[]>;
}

export const initial: Model = {
    isPending: false,
    chatUserResponse: notAsked,
    conversationsResponse: notAsked,
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
                    text: 'Chats',
                },
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

    public async componentDidAppear() {
        this.props.tree.isPending.set(true);
        try {
            const userResponse = await getChatUser(this.props.tree.chatUserResponse, this.props.session.username);
            if (isSuccess(userResponse)) {
                if (userResponse.data.conversationsList) {
                    const conversationsResponse = await getConversations(
                        this.props.tree.conversationsResponse,
                        userResponse.data.conversationsList
                    );
                    console.log(conversationsResponse);
                }
            }
        } finally {
            this.props.tree.isPending.set(false);
        }
    }

    public async openChat(conversation: Conversation) {
        await Navigation.push(this.props.componentId, {
            component: {
                name: 'td.Chat',
                passProps: {
                    conversationUuid: conversation.uuid,
                },
            },
        });
    }

    public renderContent() {
        const { tree } = this.props;

        const conversationsResponse = tree.conversationsResponse.get();

        if (isNotAsked(conversationsResponse) || isLoading(conversationsResponse)) {
            return <Preloader isVisible={true} />;
        }

        if (isSuccess(conversationsResponse)) {
            const conversations = conversationsResponse.data;

            return (
                <FlatList<Conversation>
                    data={conversations}
                    listKey="chat-list"
                    keyExtractor={(item) => item.uuid}
                    renderItem={({ item }) => {
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
                                    <Text style={s.contactListItem}>
                                        {item.title
                                            ? item.title
                                            : R.join(
                                                  ', ',
                                                  R.map(({ userId }) => makeUsername(userId), item.participants)
                                              )}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <CallButton
                                        iconName="chat"
                                        color={COLOR.ACCENT}
                                        buttonPressed={() => this.openChat(item)}
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
                <Text>Something went wrong. {JSON.stringify(conversationsResponse.error)}</Text>
            </View>
        );
    }

    public render() {
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                {this.renderContent()}
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

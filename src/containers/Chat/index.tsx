import * as R from 'ramda';
import * as React from 'react';
import autoBind from 'react-autobind';
import { Field, Form } from 'react-final-form';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Voximplant } from 'react-native-voximplant';

import { InputField } from 'src/components/InputFIeld';
import { Preloader } from 'src/components/Preloader';
import { User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoadingCursor, isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import {
    getConversation,
    getMessages,
    makeUserId,
    makeUsername,
    removeConversation,
    sendMessage,
    subscribeToConversationEvents,
} from 'src/services/chat';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

const window = Dimensions.get('window');

type Message = Voximplant['Messaging']['Message'];
type Conversation = Voximplant['Messaging']['Conversation'];

interface FormValues {
    message: string;
}

export interface Model {
    isPending: boolean;
    conversationResponse: RemoteData<Conversation>;
    messagesResponse: RemoteData<Message[]>;
    removeConversationResponse: RemoteData<any>;
    messages: Message[];
    lastSeq: number;
}

export const initial: Model = {
    isPending: false,
    conversationResponse: notAsked,
    messagesResponse: notAsked,
    removeConversationResponse: notAsked,
    messages: [],
    lastSeq: 1,
};

interface ComponentProps {
    componentId: string;
    users: User[];
    tree: Cursor<Model>;
    session: Session;
    conversationUuid: string;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                title: {
                    text: 'Chat',
                },
                rightButtons: [
                    // TODO: discuss and implement better behavior
                    // {
                    //     id: 'delete',
                    //     text: 'Delete',
                    // },
                ],
            },
            sideMenu: {
                left: {
                    enabled: true,
                },
            },
        };
    }

    private readonly unsubscribe: () => void;

    constructor(props: ComponentProps) {
        super(props);

        autoBind(this);
        Navigation.events().bindComponent(this);

        props.tree.set(initial);

        this.unsubscribe = subscribeToConversationEvents(props.conversationUuid, {
            onSendMessage: this.onSendMessage,
        });
    }

    public async navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'delete') {
            this.props.tree.isPending.set(true);
            try {
                await removeConversation(this.props.tree.removeConversationResponse, this.props.conversationUuid);
                await Navigation.pop(this.props.componentId);
            } finally {
                this.props.tree.isPending.set(false);
            }
        }
    }

    public async componentDidMount() {
        const { tree, conversationUuid } = this.props;
        const conversationResponse = await getConversation(tree.conversationResponse, conversationUuid);
        if (isSuccess(conversationResponse)) {
            const { lastSeq } = conversationResponse.data;

            await this.loadMessages(lastSeq);
        } else {
            await Navigation.showOverlay({
                component: {
                    name: 'td.Modal',
                    passProps: { text: 'Something went wrong with fetching chat' },
                },
            });
        }
    }

    public componentWillUnmount() {
        this.unsubscribe();
    }

    public onSendMessage(event: any) {
        if (event.message.conversation === this.props.conversationUuid) {
            const tree = this.props.tree;

            tree.messages.apply((messages) => [...messages, event.message]);
        }
    }

    public async loadMessages(lastSeq: number) {
        const { tree, conversationUuid } = this.props;

        const messagesResponse = await getMessages(tree.messagesResponse, conversationUuid, lastSeq);
        if (isSuccess(messagesResponse)) {
            if (messagesResponse.data.length) {
                tree.lastSeq.set(messagesResponse.data[0].sequence - 1);
            } else {
                tree.lastSeq.set(0);
            }
            tree.messages.apply((messages) => [...messagesResponse.data, ...messages]);
        } else {
            await Navigation.showOverlay({
                component: {
                    name: 'td.Modal',
                    passProps: { text: 'Something went wrong with fetching messages history' },
                },
            });
        }
    }

    public async loadHistory() {
        const { tree } = this.props;
        const lastSeq = tree.lastSeq.get();

        if (lastSeq < 1) {
            return;
        }

        if (isLoadingCursor(tree.messagesResponse)) {
            return;
        }

        const conversationResponse = tree.conversationResponse.get();
        if (isSuccess(conversationResponse)) {
            await this.loadMessages(lastSeq);
        }
    }

    public async onSubmit(values: FormValues, form: any) {
        if (!values.message) {
            return;
        }

        await sendMessage(this.props.conversationUuid, values.message);
        form.reset();
    }

    public renderName(sender: string) {
        const username = makeUsername(sender);
        const { users } = this.props;

        const foundUser = R.find((user) => user.username === username, users);
        if (foundUser) {
            return foundUser.displayName;
        }

        return username;
    }

    public renderMessages() {
        const { tree, session } = this.props;

        const messages = tree.messages.get();

        return (
            <FlatList<Message>
                data={R.reverse(messages)}
                listKey="message-list"
                inverted
                keyExtractor={(item) => item.uuid}
                onEndReachedThreshold={2}
                onEndReached={() => this.loadHistory()}
                ListFooterComponent={tree.lastSeq.get() >= 1 ? <ActivityIndicator size="large" /> : null}
                renderItem={({ item }) => {
                    const isMe = item.sender === makeUserId(session.username);
                    return (
                        <View
                            style={[
                                s.chatMessageWrapper,
                                {
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                },
                            ]}
                        >
                            <View style={s.chatMessage}>
                                {!isMe ? (
                                    <Text style={{ color: COLOR.ACCENT }}>{this.renderName(item.sender)}</Text>
                                ) : null}
                                <Text>{item.text}</Text>
                            </View>
                        </View>
                    );
                }}
            />
        );
    }

    public renderForm() {
        return (
            <Form onSubmit={this.onSubmit}>
                {({ handleSubmit }) => (
                    <View>
                        <View style={s.form}>
                            <View style={s.messageInput}>
                                <Field name="message">
                                    {(fieldProps) => (
                                        <InputField
                                            underlineColorAndroid="transparent"
                                            placeholder="Write a message"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            onSubmitEditing={() => handleSubmit()}
                                            style={{ padding: 8, width: window.width - 45 }}
                                            {...fieldProps}
                                        />
                                    )}
                                </Field>
                                <TouchableOpacity
                                    onPress={() => handleSubmit()}
                                    hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                                >
                                    <Icon name="send" size={20} color={COLOR.ACCENT} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </Form>
        );
    }

    public render() {
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>{this.renderMessages()}</View>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={64}
                    >
                        {this.renderForm()}
                    </KeyboardAvoidingView>
                </View>
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

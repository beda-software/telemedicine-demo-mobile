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
                    {
                        id: 'delete',
                        text: 'Delete',
                    },
                ],
            },
        };
    }

    private readonly unsubscribe: () => void;

    constructor(props: ComponentProps) {
        super(props);

        autoBind(this);
        Navigation.events().bindComponent(this);

        const messaging = Voximplant.getMessenger();
        const handler = (e: any) => {
            console.log('called', e);
            if (e.messengerEventType === 'SendMessage' && e.message.conversation === this.props.conversationUuid) {
                const tree = this.props.tree;
                tree.messages.apply((messages) => [...messages, e.message]);
            }
        };
        Object.keys(Voximplant.Messaging.MessengerEventTypes).forEach((eventName) => {
            messaging.on(eventName, handler);
        });

        this.unsubscribe = () => {
            Object.keys(Voximplant.Messaging.MessengerEventTypes).forEach((eventName) => {
                messaging.off(eventName, handler);
            });
        };
        props.tree.set(initial);
    }

    public async navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'delete') {
            await removeConversation(this.props.tree.removeConversationResponse, this.props.conversationUuid);
            await Navigation.pop(this.props.componentId);
        }
    }

    public async componentDidMount() {
        const { tree, conversationUuid } = this.props;
        const conversationResponse = await getConversation(tree.conversationResponse, conversationUuid);
        if (isSuccess(conversationResponse)) {
            const { lastSeq } = conversationResponse.data;

            const messagesResponse = await getMessages(tree.messagesResponse, conversationUuid, lastSeq);
            if (isSuccess(messagesResponse)) {
                if (messagesResponse.data.length) {
                    tree.lastSeq.set(messagesResponse.data[0].sequence - 1);
                } else {
                    tree.lastSeq.set(0);
                }
                tree.messages.set(messagesResponse.data);
            } else {
                // TODO: handle error!!!!
            }
        }
    }

    public componentWillUnmount() {
        this.unsubscribe();
    }

    public async loadHistory() {
        console.log('LOAD HISTORY CALLED');
        const { tree, conversationUuid } = this.props;
        const lastSeq = tree.lastSeq.get();

        if (lastSeq < 1) {
            console.log('all messages loaded');

            return;
        }

        if (isLoadingCursor(tree.messagesResponse)) {
            console.log('already loading...');
            return;
        }

        const conversationResponse = tree.conversationResponse.get();
        if (isSuccess(conversationResponse)) {
            const messagesResponse = await getMessages(tree.messagesResponse, conversationUuid, lastSeq);
            if (isSuccess(messagesResponse)) {
                if (messagesResponse.data.length) {
                    tree.lastSeq.set(messagesResponse.data[0].sequence - 1);
                } else {
                    tree.lastSeq.set(0);
                }
                tree.messages.apply((messages) => [...messagesResponse.data, ...messages]);
            } else {
                // TODO: handle error!!!!
            }
        }
    }

    public async onSubmit(values: FormValues) {
        if (!values.message) {
            return;
        }

        await sendMessage(this.props.conversationUuid, values.message);
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
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <View
                                style={{
                                    margin: 5,
                                    borderWidth: 1,
                                    borderColor: COLOR.ACCENT,
                                    borderRadius: 15,
                                    padding: 10,
                                    fontSize: 16,
                                }}
                            >
                                {!isMe ? (
                                    <Text style={{ color: COLOR.ACCENT }}>{makeUsername(item.sender)}</Text>
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
                {({ handleSubmit, reset }) => (
                    <View>
                        <View
                            style={{
                                backgroundColor: COLOR.GRAY,
                                padding: 6,
                                borderTopWidth: 1,
                                borderTopColor: COLOR.ACCENT,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: COLOR.WHITE,
                                    borderColor: COLOR.ACCENT,
                                    borderWidth: 1,
                                    borderRadius: 15,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    height: 40,
                                    paddingRight: 5,
                                }}
                            >
                                <Field name="message">
                                    {(fieldProps) => (
                                        <InputField
                                            underlineColorAndroid="transparent"
                                            // style={s.formInput}
                                            // errorStyle={s.formInputError}
                                            placeholder="Type message here"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            onSubmitEditing={() => handleSubmit()!.then(reset)}
                                            style={{ padding: 8, width: window.width - 45 }}
                                            {...fieldProps}
                                        />
                                    )}
                                </Field>
                                <TouchableOpacity
                                    onPress={() => handleSubmit()!.then(reset)}
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

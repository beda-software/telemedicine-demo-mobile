import * as _ from 'lodash';
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
import { Observation, User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoadingCursor, isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import {
    getMessages,
    makeUserId,
    makeUsername,
    removeConversation,
    sendMessage,
    subscribeToMessagingEvents,
    subscribeToUsersStatuses,
    typing,
} from 'src/services/chat';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import { getNameByCode, getValue } from 'src/utils/fhir';
import s from './style';

const window = Dimensions.get('window');

type Message = Voximplant['Messaging']['Message'];
type Conversation = Voximplant['Messaging']['Conversation'];
type EventHandlers = Voximplant['Messaging']['EventHandlers'];
type MessageEvent = EventHandlers['MessageEvent'];
type MessengerEvent = EventHandlers['MessengerEvent'];
type StatusEvent = EventHandlers['StatusEvent'];

interface FormValues {
    message: string;
}

export interface Model {
    isPending: boolean;
    messagesResponse: RemoteData<Message[]>;
    removeConversationResponse: RemoteData<any>;
    messages: Message[];
    lastSeq: number;
    isOnline: boolean;
}

export const initial: Model = {
    isPending: false,
    messagesResponse: notAsked,
    removeConversationResponse: notAsked,
    messages: [],
    lastSeq: 1,
    isOnline: false,
};

interface ComponentProps {
    componentId: string;
    users: User[];
    tree: Cursor<Model>;
    session: Session;
    conversation: Conversation;
}

function getObservationInfo(observation: Observation) {
    const code = R.path<string>(['code', 'coding', 0, 'code'], observation);

    if (code) {
        return `${getNameByCode(code)}: ${getValue(observation)}`;
    }

    return '';
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                title: {
                    text: 'Chat',
                    color: COLOR.BLACK,
                },
                subtitle: { text: 'Offline', color: COLOR.GRAY },

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
                    visible: false,
                },
            },
        };
    }

    private readonly unsubscribe: () => void;
    private onTypingTimeout: NodeJS.Timeout | null;
    private onKeyPressTimeout: NodeJS.Timeout | null;
    private onUserStatusChangeTimeout: NodeJS.Timeout | null;

    constructor(props: ComponentProps) {
        super(props);

        autoBind(this);
        Navigation.events().bindComponent(this);

        props.tree.set(initial);

        const unsubscribeFromConversationEvents = subscribeToMessagingEvents({
            onSendMessage: this.onSendMessage,
            onTyping: this.onTyping,
        });
        const unsubscribeFromUsersStatuses = subscribeToUsersStatuses(
            R.map((user) => user.username, props.users),
            this.onUserStatusChange
        );

        this.unsubscribe = () => {
            unsubscribeFromConversationEvents();
            unsubscribeFromUsersStatuses();
        };
    }

    public async navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'delete') {
            this.props.tree.isPending.set(true);
            try {
                await removeConversation(this.props.tree.removeConversationResponse, this.props.conversation.uuid);
                await Navigation.pop(this.props.componentId);
            } finally {
                this.props.tree.isPending.set(false);
            }
        }
    }

    public async componentDidMount() {
        const { lastSeq } = this.props.conversation;

        await this.loadMessages(lastSeq);
    }

    public componentWillUnmount() {
        this.unsubscribe();

        if (this.onKeyPressTimeout) {
            clearTimeout(this.onKeyPressTimeout);
        }
        if (this.onTypingTimeout) {
            clearTimeout(this.onTypingTimeout);
        }
        if (this.onUserStatusChangeTimeout) {
            clearTimeout(this.onUserStatusChangeTimeout);
        }
    }

    public isCompanion(userId: string) {
        const { session, conversation } = this.props;

        const myUserId = makeUserId(session.username);

        const usersIds = R.filter((pUserId) => pUserId !== myUserId, R.map((p) => p.userId, conversation.participants));
        return R.includes(userId, usersIds);
    }

    public setSubtitle(text: string, color: string) {
        const { componentId } = this.props;

        Navigation.mergeOptions(componentId, {
            topBar: {
                subtitle: {
                    text,
                    color,
                },
            },
        });
    }

    public setOnline(isOnline: boolean) {
        this.setSubtitle(isOnline ? 'Online' : 'Offline', isOnline ? COLOR.ACCENT : COLOR.GRAY);
    }

    public onSendMessage(event: MessageEvent) {
        if (event.message.conversation === this.props.conversation.uuid) {
            const { tree } = this.props;
            const isOnline = tree.isOnline.get();

            tree.messages.apply((messages) => [...messages, event.message]);
            if (this.isCompanion(event.userId)) {
                this.setOnline(isOnline);
            }
        }
    }

    public onTyping(event: MessengerEvent) {
        const { tree } = this.props;

        if (!this.isCompanion(event.userId)) {
            return;
        }

        tree.isOnline.set(true);

        this.setSubtitle('Typing...', COLOR.GRAY);

        if (this.onTypingTimeout) {
            clearTimeout(this.onTypingTimeout);
        }

        this.onTypingTimeout = setTimeout(() => {
            const isOnline = tree.isOnline.get();

            this.setOnline(isOnline);

            this.onTypingTimeout = null;
        }, 5000);
    }

    public async onKeyPress() {
        if (!this.onKeyPressTimeout) {
            await typing(this.props.conversation.uuid);

            this.onKeyPressTimeout = setTimeout(() => {
                this.onKeyPressTimeout = null;
            }, 1000);
        }
    }

    public onUserStatusChange(event: StatusEvent) {
        const { tree } = this.props;
        if (!this.isCompanion(event.userId)) {
            return;
        }

        const isOnline = event.userStatus.online;
        tree.isOnline.set(isOnline);
        this.setOnline(isOnline);

        if (isOnline) {
            if (this.onUserStatusChangeTimeout) {
                clearTimeout(this.onUserStatusChangeTimeout);
            }

            this.onUserStatusChangeTimeout = setTimeout(() => {
                tree.isOnline.set(false);
                this.setOnline(false);
            }, 10000 + 5000);
        }
    }

    public async loadMessages(lastSeq: number) {
        const { tree, conversation } = this.props;

        const messagesResponse = await getMessages(tree.messagesResponse, conversation.uuid, lastSeq);
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

        await this.loadMessages(lastSeq);
    }

    public async onSubmit(values: FormValues, form: any) {
        if (!values.message) {
            return;
        }

        await sendMessage(this.props.conversation.uuid, values.message);
        form.reset();
    }

    public sendObservation() {
        Navigation.push(this.props.componentId, {
            component: {
                name: 'td.ObservationAdd',
                passProps: {
                    onSave: async (item: Observation) => {
                        await sendMessage(this.props.conversation.uuid, '', [
                            {
                                data: item,
                                title: 'FHIR Resource',
                                type: 'fhirResource',
                            },
                        ]);
                    },
                },
            },
        });
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

    public renderMessage(item: Message) {
        if (item.payload && item.payload.length) {
            return R.map((payload: any) => {
                if (payload.type === 'fhirResource') {
                    const resource: Observation = payload.data;

                    return (
                        <View style={s.messagePayload} key={resource.id}>
                            <Icon name="healing" size={25} color={COLOR.ACCENT} />
                            <View style={s.messagePayloadContent}>
                                <Text>{resource.resourceType}</Text>
                                <Text>
                                    {resource.resourceType === 'Observation'
                                        ? getObservationInfo(resource)
                                        : resource.id}
                                </Text>
                            </View>
                        </View>
                    );
                }

                return null;
            }, item.payload);
        }

        return <Text>{item.text}</Text>;
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
                                {this.renderMessage(item)}
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
                                            style={{ padding: 8, width: window.width - 75 }}
                                            {...fieldProps}
                                            onKeyPress={this.onKeyPress}
                                        />
                                    )}
                                </Field>

                                <TouchableOpacity
                                    onPress={() => this.sendObservation()}
                                    hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                                >
                                    <Icon name="healing" size={25} color={COLOR.ACCENT} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleSubmit()}
                                    hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                                >
                                    <Icon name="send" size={25} color={COLOR.ACCENT} />
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

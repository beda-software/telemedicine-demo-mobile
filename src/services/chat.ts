import * as R from 'ramda';
import { AppState, NativeModules } from 'react-native';
import { Voximplant } from 'react-native-voximplant';

import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData, success } from 'src/libs/schema';
import { appName } from './constants';
import { catchEvent, Subscribable, wrapService } from './utils';

type ChatUser = Voximplant['Messaging']['User'];
type Conversation = Voximplant['Messaging']['Conversation'];
type Message = Voximplant['Messaging']['Message'];
type ChatUserStatus = Voximplant['Messaging']['UserStatus'];

interface ChatUserEvent {
    user: ChatUser;
}

interface ConversationEvent {
    conversation: Conversation;
}

interface MessageEvent {
    message: Message;
}

interface RetransmitEvent {
    sequence: number;
    messengerEventType: string;
    userId: string;
    message?: Message;
    conversation?: Conversation;
}

interface RetransmitEventsEvent {
    toSequence: number;
    fromSequence: number;
    events: RetransmitEvent[];
}

interface UserStatusEvent {
    userStatus: ChatUserStatus;
    userId: string;
}

const EventTypes = Voximplant.Messaging.MessengerEventTypes;
const MessagingModule: any = NativeModules.VIMessagingModule;

interface ConversationCallbacks {
    onSendMessage: (event: MessageEvent) => void;
    onTyping: (event: any) => void;
}

function setupConversationListeners(service: Subscribable<any>, callbacks: ConversationCallbacks, setup: boolean) {
    Object.keys(EventTypes).forEach((eventName) => {
        const callbackName = `on${eventName}`;
        if (typeof callbacks[callbackName] !== 'undefined') {
            service[setup ? 'on' : 'off'](eventName, callbacks[callbackName]);
        }
    });
}

export function subscribeToConversationEvents(conversationUuid: string, callbacks: ConversationCallbacks) {
    setupConversationListeners(messaging, callbacks, true);

    return () => {
        setupConversationListeners(messaging, callbacks, false);
    };
}

export function subscribeToUsersStatuses(usernames: string[], callback: (event: UserStatusEvent) => void) {
    const usersIds = R.map(makeUserId, usernames);
    messaging.subscribe(usersIds);

    function handler(event: UserStatusEvent) {
        if (R.includes(event.userId, usersIds)) {
            callback(event);
        }
    }

    messaging.on(EventTypes.SetStatus, handler);

    return () => {
        messaging.unsubscribe(usersIds);
        messaging.off(EventTypes.SetStatus, handler);
    };
}

export function makeUserId(username: string) {
    return `${username}@${appName}`;
}

export function makeUsername(userId: string) {
    return userId.split('@')[0];
}

const messaging = Voximplant.getMessenger();

async function catchChatUser(uuid: string) {
    const event = await catchEvent<ChatUserEvent>(messaging, EventTypes.GetUser, ({ user }) => user.userId === uuid);

    return event.user;
}

export function getChatUser(cursor: Cursor<RemoteData<ChatUser>>, username: string) {
    return wrapService(cursor, async () => {
        const userId = makeUserId(username);
        messaging.getUser(userId);

        return catchChatUser(userId);
    });
}

interface ConversationsCache {
    [uuid: string]: Conversation;
}

const conversationsCache: ConversationsCache = {};

export async function createConversation(
    cursor: Cursor<RemoteData<Conversation>>,
    myUsername: string,
    participantsUsernames: string[],
    title?: string,
    distinct?: boolean
) {
    return wrapService(cursor, async () => {
        if (distinct) {
            // This is just a workaround for distinct. Rewrite it after the issue is fixed
            const myUserId = makeUserId(myUsername);
            messaging.getUser(myUserId);
            const myUser = await catchChatUser(myUserId);
            messaging.getConversations(myUser.conversationsList);
            const conversations = await Promise.all(R.map(catchConversation, myUser.conversationsList));
            const existingConversation = R.find(
                (conversation) =>
                    R.equals(
                        R.sort(R.descend(R.identity), R.map((p) => p.userId, conversation.participants)),
                        R.sort(R.descend(R.identity), [myUserId, ...R.map(makeUserId, participantsUsernames)])
                    ),
                conversations
            );
            if (existingConversation) {
                return existingConversation;
            }
        }

        messaging.createConversation(
            R.map(
                (username) => ({
                    userId: makeUserId(username),
                    canManageParticipants: false,
                    canWrite: true,
                }),
                participantsUsernames
            ),
            title
        );

        const event = await catchEvent<ConversationEvent>(
            messaging,
            EventTypes.CreateConversation
            // TODO: write predicate
        );

        return event.conversation;
    });
}

export async function removeConversation(cursor: Cursor<RemoteData<any>>, uuid: string) {
    return wrapService(cursor, async () => {
        MessagingModule.removeConversation(uuid);

        await catchEvent<ConversationEvent>(
            messaging,
            EventTypes.RemoveConversation,
            ({ conversation }) => conversation.uuid === uuid
        );

        return null;
    });
}

async function catchConversation(uuid: string): Promise<Conversation> {
    if (R.has(uuid, conversationsCache)) {
        return conversationsCache[uuid];
    }

    const event = await catchEvent<ConversationEvent>(
        messaging,
        EventTypes.GetConversation,
        ({ conversation }) => conversation.uuid === uuid
    );

    return event.conversation;
}

export function getConversation(cursor: Cursor<RemoteData<Conversation>>, uuid: string) {
    return wrapService(cursor, () => {
        messaging.getConversation(uuid);

        return catchConversation(uuid);
    });
}

export function getConversations(cursor: Cursor<RemoteData<Conversation[]>>, uuids: string[]) {
    return wrapService(cursor, () => {
        messaging.getConversations(uuids);

        return Promise.all(R.map(catchConversation, uuids));
    });
}

export async function sendMessage(conversationUuid: string, message: string, payload: any[] = []) {
    MessagingModule.sendMessage(conversationUuid, message, payload);
    // TODO: await catch event
}

export async function typing(conversationUuid: string) {
    MessagingModule.typing(conversationUuid);
    // TODO: await catch event
}

export function getMessages(cursor: Cursor<RemoteData<Message[]>>, conversationUuid: string, seq: number) {
    const pageSize = 20;
    const fromSequence = R.max(1, seq - pageSize + 1);
    const toSequence = R.max(1, seq);

    if (fromSequence === toSequence) {
        return success([]);
    }

    return wrapService(cursor, async () => {
        MessagingModule.retransmitEvents(conversationUuid, fromSequence, toSequence);
        const events = await catchEvent<RetransmitEventsEvent>(
            messaging,
            EventTypes.RetransmitEvents,
            (event) => event.fromSequence === fromSequence && event.toSequence === toSequence
        );

        // TODO: process delete message and edit message
        return events.events
            .filter(({ messengerEventType }) => messengerEventType === 'SendMessage')
            .map(({ message }) => message!);
    });
}

export function chatServiceSetup() {
    messaging.on(EventTypes.Error, (event) => {
        console.log('EVENT ERROR CAUGHT', event);
    });
    [EventTypes.GetConversation, EventTypes.CreateConversation, EventTypes.EditConversation].map((eventName) =>
        messaging.on(eventName, (event: ConversationEvent) => {
            conversationsCache[event.conversation.uuid] = event.conversation;
        })
    );
    messaging.on(EventTypes.SendMessage, async (event: MessageEvent) => {
        const conversationUuid = event.message.conversation;

        if (R.has(conversationUuid, conversationsCache)) {
            conversationsCache[conversationUuid] = {
                ...conversationsCache[conversationUuid],
                lastSeq: event.message.sequence,
            };
        }
    });

    AppState.addEventListener('change', async (appState) => {
        if (appState === 'active') {
            messaging.setStatus(true);
        } else {
            messaging.setStatus(false);
        }
    });
}

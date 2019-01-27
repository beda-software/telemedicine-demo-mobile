import * as R from 'ramda';
import { NativeModules } from 'react-native';
import { Voximplant } from 'react-native-voximplant';

import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, RemoteDataResult, success } from 'src/libs/schema';
import { appName } from './constants';

interface Subscribable<T> {
    on: (eventName: string, callback: (event: T) => void) => void;
    off: (eventName: string, callback: (event: T) => void) => void;
}

type ChatUser = Voximplant['Messaging']['User'];
type Conversation = Voximplant['Messaging']['Conversation'];
type Message = Voximplant['Messaging']['Message'];

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

const EventTypes = Voximplant.Messaging.MessengerEventTypes;
const MessagingModule: any = NativeModules.VIMessagingModule;

async function wrapService<T>(cursor: Cursor<RemoteData<T>>, fn: () => Promise<T>): Promise<RemoteDataResult<T>> {
    cursor.set(loading);

    try {
        const result = success(await fn());
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);
        cursor.set(result);

        return result;
    }
}

function catchEvent<T>(
    service: Subscribable<T>,
    eventName: string,
    predicate = (data: T) => true,
    asyncTimeout = 60000
) {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            service.off(eventName, handler);
            reject({ message: 'No events caught' });
        }, asyncTimeout);

        function handler(event: T) {
            console.log('CAUGHT', event);
            if (!predicate(event)) {
                return;
            }

            clearTimeout(timeout);
            service.off(eventName, handler);

            resolve(event);
        }

        service.on(eventName, handler);
    });
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

export async function createConversation(cursor: Cursor<RemoteData<Conversation>>, participantsUsernames: string[]) {
    return wrapService(cursor, async () => {
        messaging.createConversation(
            R.map(
                (username) => ({
                    userId: makeUserId(username),
                    canManageParticipants: false,
                    canWrite: true,
                }),
                participantsUsernames
            ),
            undefined,
            true
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

        return Promise.all(uuids.map(catchConversation));
    });
}

export async function sendMessage(conversationUuid: string, message: string, payload: any[] = []) {
    MessagingModule.sendMessage(conversationUuid, message, payload);
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

export async function setup() {
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
}

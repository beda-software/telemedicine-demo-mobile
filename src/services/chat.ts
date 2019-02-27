import * as _ from 'lodash';
import { NativeModules } from 'react-native';
import { Voximplant } from 'react-native-voximplant';

import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData, success } from 'src/libs/schema';
import { appName } from './constants';
import { catchEvent, Subscribable, wrapService } from './utils';

type User = Voximplant['Messaging']['User'];
type Conversation = Voximplant['Messaging']['Conversation'];
type Message = Voximplant['Messaging']['Message'];

type EventHandlers = Voximplant['Messaging']['EventHandlers'];
type StatusEvent = EventHandlers['StatusEvent'];
type RetransmitEventsEvent = EventHandlers['RetransmitEventsEvent'];
type MessageEvent = EventHandlers['MessageEvent'];
type ConversationEvent = EventHandlers['ConversationEvent'];
type UserEvent = EventHandlers['UserEvent'];
type MessengerEvent = EventHandlers['MessengerEvent'];

const EventTypes = Voximplant.Messaging.MessengerEventTypes;
const MessagingModule: any = NativeModules.VIMessagingModule;

interface ConversationCallbacks {
    onSendMessage: (event: MessageEvent) => void;
    onTyping: (event: MessengerEvent) => void;
}

export interface ChatMessage extends Message {
    timestamp: number;
}

function setupMessagingListeners(service: Subscribable<any>, callbacks: ConversationCallbacks, setup: boolean) {
    Object.keys(EventTypes).forEach((eventName) => {
        const callbackName = `on${eventName}`;
        if (typeof callbacks[callbackName] !== 'undefined') {
            service[setup ? 'on' : 'off'](eventName, callbacks[callbackName]);
        }
    });
}

export function subscribeToMessagingEvents(callbacks: ConversationCallbacks) {
    setupMessagingListeners(messaging, callbacks, true);

    return () => {
        setupMessagingListeners(messaging, callbacks, false);
    };
}

export function subscribeToUsersStatuses(usernames: string[], callback: (event: StatusEvent) => void) {
    const usersIds = _.map(usernames, makeUserId);
    messaging.subscribe(usersIds);

    function handler(event: StatusEvent) {
        if (_.includes(usersIds, event.userId)) {
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

async function catchUser(uuid: string) {
    const event = await catchEvent<UserEvent>(messaging, EventTypes.GetUser, ({ user }) => user.userId === uuid);

    return event.user;
}

export function getUser(cursor: Cursor<RemoteData<User>>, username: string) {
    return wrapService(cursor, async () => {
        const userId = makeUserId(username);
        messaging.getUser(userId);

        return catchUser(userId);
    });
}

interface ConversationsCache {
    [uuid: string]: Conversation;
}

const conversationsCache: ConversationsCache = {};

export async function prepareConversationsCache(myUsername: string) {
    // This is just a workaround for distinct. Rewrite it after the issue is fixed
    const myUserId = makeUserId(myUsername);
    messaging.getUser(myUserId);
    const myUser = await catchUser(myUserId);
    messaging.getConversations(myUser.conversationsList);
    await Promise.all(_.map(myUser.conversationsList, catchConversation));
}

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
            const myUser = await catchUser(myUserId);
            messaging.getConversations(myUser.conversationsList);
            const conversations = await Promise.all(_.map(myUser.conversationsList, catchConversation));
            const existingConversation = _.find(conversations, (conversation) =>
                _.isEqual(
                    _.orderBy(_.map(conversation.participants, (p) => p.userId), _.identity, ['desc']),
                    _.orderBy([myUserId, ..._.map(participantsUsernames, makeUserId)], _.identity, ['desc'])
                )
            );
            if (existingConversation) {
                return existingConversation;
            }
        }

        messaging.createConversation(
            _.map(participantsUsernames, (username) => ({
                userId: makeUserId(username),
                canManageParticipants: false,
                canWrite: true,
            })),
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
    if (_.has(conversationsCache, uuid)) {
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

        return Promise.all(_.map(uuids, catchConversation));
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

export function getMessages(cursor: Cursor<RemoteData<ChatMessage[]>>, conversationUuid: string, seq: number) {
    const pageSize = 20;
    const fromSequence = _.max([1, seq - pageSize + 1]);
    const toSequence = _.max([1, seq]);

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
            .map(({ message, timestamp }) => ({ ...message!, timestamp }));
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

        if (_.has(conversationsCache, conversationUuid)) {
            conversationsCache[conversationUuid] = {
                ...conversationsCache[conversationUuid],
                lastSeq: event.message.sequence,
            };
        }
    });

    const client = Voximplant.getInstance();

    setInterval(async () => {
        const connectionState = await client.getClientState();
        if (connectionState === Voximplant.ClientState.LOGGED_IN) {
            messaging.setStatus(true);
        }
    }, 10 * 1000);
}

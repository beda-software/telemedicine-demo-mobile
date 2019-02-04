declare module 'react-native-voximplant' {
    import * as React from 'react';

    interface Subscribable<T> {
        on: (eventName: string, callback: (event: T) => void) => void;
        off: (eventName: string, callback: (event: T) => void) => void;
    }

    interface Instance extends Subscribable<Event> {
        getCallById: (id: string) => Call;
        handlePushNotification: (notification: any) => void;
        registerPushNotificationsToken: (token: string) => void;
        unregisterPushNotificationsToken: (token: string) => void;
        disconnect: () => void;
        call: (username: string, config: object) => Call;
        connect: () => void;
        getClientState: () => string;
        login: () => void;
        loginWithToken: (fullUserName: string, accessToken: string) => { tokens: LoginTokens };
        loginWithOneTimeKey: (fullUserName: string, hash: string) => { tokens: LoginTokens };
        requestOneTimeLoginKey: (fullUserName: string) => { oneTimeKey: string };
    }

    interface Endpoint extends Subscribable<Event> {
        displayName: string;
    }

    interface Event {}

    interface Call extends Subscribable<Event> {
        callId: string;
        decline: () => void;
        hangup: () => void;
        answer: (config: any) => void;
        sendTone: (num: number) => void;
        sendAudio: (send: boolean) => void;
        sendVideo: (send: boolean) => void;
        getEndpoints: () => Endpoint[];
    }

    interface AudioDeviceManager extends Subscribable<Event> {
        selectAudioDevice: (device: string) => void;
        getAudioDevices: () => string[];
        callKitStartAudio: () => void;
        callKitStopAudio: () => void;
        callKitReleaseAudioSession: () => void;
        callKitConfigureAudioSession: () => void;
    }

    interface AudioDevice {
        [x: string]: string;
    }

    interface Hardware {
        AudioDevice: AudioDevice;
        AudioDeviceEvents: object;
        AudioDeviceManager: {
            getInstance: () => AudioDeviceManager;
        };
    }

    interface RenderScaleType {
        [x: string]: string;
    }

    interface ClientEvents {
        [x: string]: string;
    }

    interface EndpointEvents {
        [x: string]: string;
    }

    interface MessengerEventTypes {
        [x: string]: string;
    }

    interface CallEvents {
        [x: string]: string;
    }

    interface ClientState {
        [x: string]: string;
    }

    interface LoginTokens {
        [x: string]: string;
    }

    interface MessagingUser {
        conversationsList: string[];
        userId: string;
    }

    interface MessagingParticipant {
        canManageParticipants: boolean;
        canWrite: boolean;
        userId: string;
    }

    interface MessagingConversation {
        uuid: string;

        createdAt: number;
        customData: object;
        distinct: boolean;
        isUber: boolean;
        lastRead: number;
        lastSeq: number;
        lastUpdate: number;
        participants: MessagingParticipant[];
        publicJoin: boolean;
        title: string;
    }

    interface MessagingMessage {
        conversation: string;
        payload: any[];
        sender: string;
        sequence: number;
        text: string;
        uuid: string;
    }

    interface MessagingUserStatus {
        online: boolean;
        timestamp: number;
    }

    interface MessengerEvent {
        userId: string;
    }

    interface UserEvent extends MessengerEvent {
        user: MessagingUser;
    }

    interface ConversationEvent extends MessengerEvent {
        conversation: MessagingConversation;
    }

    interface MessageEvent extends MessengerEvent {
        message: MessagingMessage;
    }

    interface RetransmitEvent extends MessengerEvent {
        sequence: number;
        messengerEventType: string;
        userId: string;
        message?: MessagingMessage;
        conversation?: MessagingConversation;
    }

    interface RetransmitEventsEvent {
        toSequence: number;
        fromSequence: number;
        events: RetransmitEvent[];
        userId: string;
    }

    interface StatusEvent extends MessengerEvent {
        userStatus: MessagingUserStatus;
    }

    interface MessengerNotifications {
        SendMessage: string;
        EditMessage: string;
    }

    interface Messaging extends Subscribable<any> {
        setStatus: (status: boolean) => void;
        getMe: () => string;
        getUser: (uuid: string) => void;
        getUsers: (uuids: string[]) => void;
        subscribe: (users: string[]) => void;
        unsubscribe: (users: string[]) => void;
        createConversation: (
            participants: MessagingParticipant[],
            title?: string,
            distinct?: boolean,
            enablePublicJoin?: boolean,
            customData?: any,
            isUber?: boolean
        ) => void;
        getConversation: (uuid: string) => void;
        getConversations: (uuids: string[]) => void;
        User: MessagingUser;
        UserStatus: MessagingUserStatus;
        Conversation: MessagingConversation;
        Message: MessagingMessage;
        MessengerEventTypes: MessengerEventTypes;
        EventHandlers: {
            StatusEvent: StatusEvent;
            RetransmitEvent: RetransmitEvent;
            RetransmitEventsEvent: RetransmitEventsEvent;
            MessageEvent: MessageEvent;
            ConversationEvent: ConversationEvent;
            UserEvent: UserEvent;
            MessengerEvent: MessengerEvent;
        };
        MessengerNotifications: MessengerNotifications;
        managePushNotifications: (notifications: string[]) => void;
    }

    interface Voximplant {
        Instance: Instance;
        getInstance: () => Instance;
        getMessenger: () => Messaging;
        Hardware: Hardware;
        CallEvents: CallEvents;
        EndpointEvents: EndpointEvents;
        ClientEvents: ClientEvents;
        ClientState: ClientState;
        Endpoint: Endpoint;
        Call: Call;
        Event: Event;
        VideoView: React.ComponentClass<any, any>;
        RenderScaleType: RenderScaleType;
        LoginTokens: LoginTokens;
        Messaging: Messaging;
    }

    export const Voximplant: Voximplant;
}

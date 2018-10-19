import FCM, { FCMEvent } from 'react-native-fcm';
import { eventChannel, buffers } from 'redux-saga';

export function createPushTokenChannel() {
    return eventChannel((emit) => {
        const handler = (token) => {
            emit(token);
        };
        // TODO: handle token refresh event

        FCM.requestPermissions();

        FCM.getFCMToken()
            .then((token) => {
                handler(token);
            })
            .catch(() => {
                console.warn('PushManager android: failed to get FCM token');
            });
        return () => {
        };
    });
}

export function createPushNotificationChannel() {
    // We use fixed buffer for the first initial message
    return eventChannel((emit) => {
        const handler = (notification) => {
            if (notification.local_notification) {
                return;
            }
            emit(notification);
        };

        FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'Default',
            priority: 'high',
        });
        FCM.on(FCMEvent.Notification, handler);

        return () => {};
    }, buffers.fixed(1));
}

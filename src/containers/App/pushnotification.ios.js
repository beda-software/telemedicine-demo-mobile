import NotificationsIOS from 'react-native-notifications';
import { eventChannel, buffers } from 'redux-saga';

export function createPushTokenChannel() {
    return eventChannel((emit) => {
        const handler = (token) => {
            emit(token);
        };
        NotificationsIOS.requestPermissions();
        NotificationsIOS.addEventListener('pushKitRegistered', handler);
        NotificationsIOS.registerPushKit();

        return () => {
            NotificationsIOS.removeEventListener('pushKitRegistered', handler);
        };
    });
}

export function createPushNotificationChannel() {
    return eventChannel((emit) => {
        const handler = (notification) => {
            emit(notification.getData());
        };
        NotificationsIOS.consumeBackgroundQueue();
        NotificationsIOS.addEventListener('notificationReceivedBackground', handler);
        NotificationsIOS.addEventListener('notificationReceivedForeground', handler);

        return () => {
            NotificationsIOS.removeEventListener('notificationReceivedBackground', handler);
            NotificationsIOS.removeEventListener('notificationReceivedForeground', handler);
        };
    }, buffers.fixed(1));
}

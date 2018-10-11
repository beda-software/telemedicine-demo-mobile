import NotificationsIOS from 'react-native-notifications';
import { eventChannel } from 'redux-saga';

export function createPushTokenChannel() {
    return eventChannel((emit) => {
        const handler = (token) => {
            emit(token);
        };
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
            console.log('New notification', notification);
            emit(notification);
        };
        NotificationsIOS.consumeBackgroundQueue();
        NotificationsIOS.addEventListener('notificationReceivedBackground', handler);
        NotificationsIOS.addEventListener('notificationReceivedForeground', handler);

        return () => {
            NotificationsIOS.removeEventListener('notificationReceivedBackground', handler);
            NotificationsIOS.removeEventListener('notificationReceivedForeground', handler);
        };
    });
}

// class PushManager {
//
//     showLocalNotification(from) {
//         let localNotification = NotificationsIOS.localNotification({
//             alertBody: 'from: ' + from,
//             alertTitle: 'Incoming call',
//             soundName: 'chime.aiff',
//             silent: false,
//         });
//     }
// }
//
// const pushManager = new PushManager();
// export default pushManager;

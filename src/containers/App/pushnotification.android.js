import FCM, { FCMEvent } from 'react-native-fcm';
import { eventChannel } from 'redux-saga';

export function createPushTokenChannel() {
    return eventChannel((emit) => {
        const handler = (token) => {
            emit(token);
        };

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
    return eventChannel((emit) => {
        const handler = (notification) => {
            emit(notification);
        };

        FCM.on(FCMEvent.Notification, handler);
        return () => {
            FCM.off(FCMEvent.Notification, handler);
        };
    });
}

// class PushManager {
//     showLocalNotification(from) {
//         FCM.presentLocalNotification({
//             title: 'Incoming call',
//             body: 'from:' + from,
//             priority: 'high',
//             show_in_foreground: false,
//             icon: 'ic_vox_notification',
//             number: 10,
//         });
//     }
// }
//
// const pushManager = new PushManager();
// export default pushManager;

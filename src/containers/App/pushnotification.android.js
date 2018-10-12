import FCM, { FCMEvent } from 'react-native-fcm';
import { eventChannel } from 'redux-saga';

export function createPushTokenChannel() {
    return eventChannel((emit) => {
        const handler = (token) => {
            emit(token);
        };

        FCM.requestPermissions();
        FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'Default',
            priority: 'high',
        });

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
            if (notification.local_notification) {
                return;
            }
            emit(notification);
        };

        FCM.on(FCMEvent.Notification, handler);
        return () => {
            FCM.off(FCMEvent.Notification, handler);
        };
    });
}

export function showLocalNotification(from) {
    FCM.presentLocalNotification({
        channel: 'default',
        title: 'Incoming call',
        body: `from: ${from}`,
        priority: 'high',
        show_in_foreground: true,
        icon: 'ic_vox_notification',
        number: 10,
    });
}

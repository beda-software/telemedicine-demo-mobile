import FCM, { FCMEvent } from 'react-native-fcm';
import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, success } from 'src/libs/schema';

export type PushToken = string;

export async function getPushToken(cursor: Cursor<RemoteData<PushToken>>): Promise<RemoteData<PushToken>> {
    cursor.set(loading);

    await FCM.requestPermissions();

    try {
        const result = success(await FCM.getFCMToken());
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);

        cursor.set(result);
        console.warn('PushManager android: failed to get FCM token');

        return result;
    }
}

export function subscribeToPushNotifications(callback: (x: any) => void) {
    const handler = (notification: any) => {
        if (notification.local_notification) {
            return;
        }
        callback(notification);
    };
    FCM.createNotificationChannel({
        id: 'default',
        name: 'Default',
        description: 'Default',
        priority: 'high',
    });
    FCM.on(FCMEvent.Notification, handler);

    // TODO: unsubscribe
    return () => {};
}

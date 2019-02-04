// @ts-ignore
import NotificationsIOS from 'react-native-notifications';

import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, success } from 'src/libs/schema';

export type PushToken = string;

export async function getPushToken(cursor: Cursor<RemoteData<PushToken>>): Promise<RemoteData<PushToken>> {
    cursor.set(loading);

    try {
        const token = await new Promise<PushToken>((resolve, reject) => {
            function handler(pushToken: PushToken) {
                resolve(pushToken);
                NotificationsIOS.removeEventListener('pushKitRegistered', handler);
            }

            NotificationsIOS.addEventListener('pushKitRegistered', handler);
            setTimeout(() => {
                NotificationsIOS.removeEventListener('pushKitRegistered', handler);
                reject();
            }, 1000);
        });

        const result = success(token);
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);

        cursor.set(result);
        console.warn('PushManager ios: failed to get push token');

        return result;
    }
}

export function subscribeToPushNotifications(callback: (x: any) => void) {
    console.log('Subscribed to push notifications');

    const handler = (notification: any) => {
        callback(notification.getData());
    };

    NotificationsIOS.requestPermissions();
    NotificationsIOS.registerPushKit();
    NotificationsIOS.consumeBackgroundQueue();
    NotificationsIOS.addEventListener('notificationReceivedBackground', handler);
    NotificationsIOS.addEventListener('notificationReceivedForeground', handler);
}

export function showLocalNotification(title: string, text: string) {}

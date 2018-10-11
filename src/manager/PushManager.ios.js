
import React from 'react';

// import loginManager from './LoginManager';
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

class PushManager {
  pushToken = '';
  constructor() {
    console.log("Push manager ios");
    NotificationsIOS.consumeBackgroundQueue();
    NotificationsIOS.addEventListener('pushKitRegistered', this.onPushKitRegistered.bind(this));
    NotificationsIOS.registerPushKit();
    NotificationsIOS.addEventListener('notificationReceivedBackground', this.onNotificationReceivedBackground.bind(this));
    NotificationsIOS.addEventListener('notificationReceivedForeground', this.onNotificationReceivedForeground.bind(this));
  }

  init() {
    console.log("PushManager init");
  }

  onPushKitRegistered(deviceToken) {
    console.log("PushKit Token Received: " + deviceToken);
    this.pushToken = deviceToken;
  }

  getPushToken() {
    return this.pushToken;
  }

  pushNotificationReceived(notification) {
    // loginManager.getInstance().pushNotificationReceived(notification);
  }

  onNotificationReceivedForeground(notification) {
    console.log("Notification Received Foreground: " + notification.getData());
    // loginManager.getInstance().pushNotificationReceived(notification.getData());
  }

  onNotificationReceivedBackground(notification) {
    console.log("Notification Received Background: " + notification.getData());
    // loginManager.getInstance().pushNotificationReceived(notification.getData());
  }

  showLocalNotification(from) {
    let localNotification = NotificationsIOS.localNotification({
      alertBody: "from: " + from,
      alertTitle: "Incoming call",
      soundName: "chime.aiff",
      silent: false
    });
  }
}

const pushManager = new PushManager();
export default pushManager;

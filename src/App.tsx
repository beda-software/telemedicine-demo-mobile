import { AppState } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import * as Call from 'src/containers/Call';
import * as Chat from 'src/containers/Chat';
import * as ObservationList from 'src/containers/ObservationList';
import * as ContactList from 'src/containers/ContactList';
import * as IncomingCall from 'src/containers/IncomingCall';
import * as LeftMenu from 'src/containers/LeftMenu';
import * as Login from 'src/containers/Login';
import * as Modal from 'src/containers/Modal';
import * as SignUp from 'src/containers/SignUp';
import { getTree } from 'src/contrib/typed-baobab';
import { isSuccess, loading, RemoteData } from 'src/libs/schema';
import { CallService } from 'src/services/call';
import { chatServiceSetup } from 'src/services/chat';
import { voxImplantReLogin } from 'src/services/login';
import { getPushToken, PushToken, subscribeToPushNotifications } from 'src/services/pushnotifications';
import { getSession, saveSession, Session } from 'src/services/session';
import { registerContainer, registerSessionAwareContainer } from 'src/utils/register-container';
import { runInQueue } from 'src/utils/run-in-queue';

const initial: Model = {
    sessionResponse: loading,
    pushTokenResponse: loading,
    login: Login.initial,
    signUp: SignUp.initial,
    contactList: ContactList.initial,
    observationList: ObservationList.initial,
    chat: Chat.initial,
    call: Call.initial,
    incomingCall: IncomingCall.initial,
    leftMenu: LeftMenu.initial,
};

interface Model {
    sessionResponse: RemoteData<Session>;
    pushTokenResponse: RemoteData<PushToken>;
    login: Login.Model;
    signUp: SignUp.Model;
    contactList: ContactList.Model;
    observationList: ObservationList.Model;
    chat: Chat.Model;
    call: Call.Model;
    incomingCall: IncomingCall.Model;
    leftMenu: LeftMenu.Model;
}

const rootTree = getTree(initial, {});

registerContainer('td.Modal', Modal.Component);
registerContainer('td.Login', Login.Component, {
    tree: rootTree.login,
    sessionResponseCursor: rootTree.sessionResponse,
    init,
});
registerContainer('td.SignUp', SignUp.Component, {
    tree: rootTree.signUp,
});
registerContainer('td.LeftMenu', LeftMenu.Component, {
    tree: rootTree.leftMenu,
    sessionResponseCursor: rootTree.sessionResponse,
    deinit,
});
registerSessionAwareContainer('td.ObservationList', ObservationList.Component, rootTree.sessionResponse, {
    tree: rootTree.observationList,
});
registerSessionAwareContainer('td.ContactList', ContactList.Component, rootTree.sessionResponse, {
    tree: rootTree.contactList,
});
registerSessionAwareContainer('td.Chat', Chat.Component, rootTree.sessionResponse, {
    tree: rootTree.chat,
});
registerSessionAwareContainer('td.Call', Call.Component, rootTree.sessionResponse, {
    tree: rootTree.call,
});
registerSessionAwareContainer('td.IncomingCall', IncomingCall.Component, rootTree.sessionResponse, {
    tree: rootTree.incomingCall,
});

async function init() {
    const client = Voximplant.getInstance();

    const pushTokenResponse = rootTree.pushTokenResponse.get();

    if (isSuccess(pushTokenResponse)) {
        await client.registerPushNotificationsToken(pushTokenResponse.data);
        console.log('PushToken registered', pushTokenResponse.data);
    }
}

async function deinit() {
    const client = Voximplant.getInstance();
    try {
        await client.disconnect();
    } catch (err) {}
    await client.connect();
    const pushTokenResponse = rootTree.pushTokenResponse.get();

    if (isSuccess(pushTokenResponse)) {
        client.unregisterPushNotificationsToken(pushTokenResponse.data);
    }

    await client.disconnect();
}

/*
 Prepare listeners for app launching and notifications.

 There are two entry points: the first is when user launch the application, and the second
 when new notification is received.

 When new notifications is received,
 IOS invokes all callbacks at the same time, but Android invokes only notifications callback.
 */
function bootstrap() {
    // To avoid race conditions in the simultaneously invokes of `restoreSession` function
    // we wrap this into `runInQueue` wrapper (see docstring of this function for details).
    // It is necessary because `restoreSession` uses Voximplant API, which doesn't work correctly
    // in multiple threads because it is a singleton, and multiple connects/disconnects between calls
    // leads to errors
    async function _restoreSession() {
        const sessionResponse = await getSession(rootTree.sessionResponse);

        if (isSuccess(sessionResponse)) {
            const session = sessionResponse.data;

            const voxImplantTokensResponse = await voxImplantReLogin(session);
            if (isSuccess(voxImplantTokensResponse)) {
                await saveSession(rootTree.sessionResponse, {
                    ...session,
                    voxImplantTokens: voxImplantTokensResponse.data,
                });

                return true;
            }
        }

        return false;
    }

    const restoreSession = runInQueue(_restoreSession);

    Navigation.events().registerAppLaunchedListener(async () => {
        if (await restoreSession()) {
            await Navigation.setRoot({
                root: {
                    sideMenu: {
                        left: {
                            component: {
                                name: 'td.LeftMenu',
                            },
                        },
                        center: {
                            stack: {
                                id: 'root',
                                children: [
                                    {
                                        component: {
                                            name: 'td.ContactList',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            });
        } else {
            await Navigation.setRoot({
                root: {
                    sideMenu: {
                        left: {
                            component: {
                                name: 'td.LeftMenu',
                            },
                        },
                        center: {
                            stack: {
                                id: 'root',
                                children: [
                                    {
                                        component: {
                                            name: 'td.Login',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            });
        }
    });

    subscribeToPushNotifications(async (notification) => {
        console.log('New notification', notification);

        if (await restoreSession()) {
            const client = Voximplant.getInstance();

            client.handlePushNotification({ voximplant: notification.voximplant });
        }
    });

    AppState.addEventListener('change', async (appState) => {
        if (appState === 'active') {
            await restoreSession();
        }
    });

    CallService.setup({
        showIncomingCallScreen: async (passProps) => {
            await Navigation.showModal({
                component: {
                    id: 'incomingCall',
                    name: 'td.IncomingCall',
                    passProps,
                },
            });
        },
        showCallScreen: async (passProps) => {
            await Navigation.showModal({
                component: {
                    name: 'td.Call',
                    passProps,
                },
            });
        },
    });
    chatServiceSetup();
    getPushToken(rootTree.pushTokenResponse);
}

bootstrap();

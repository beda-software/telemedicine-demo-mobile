// @ts-ignore
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { AppState } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Voximplant } from 'react-native-voximplant';

import * as Call from 'src/containers/Call';
import * as IncomingCall from 'src/containers/IncomingCall';
import * as Login from 'src/containers/Login';
import * as Main from 'src/containers/Main';
import * as Modal from 'src/containers/Modal';
import * as SignUp from 'src/containers/SignUp';
import { getTree } from 'src/contrib/typed-baobab';
import { isSuccess, loading, RemoteData } from 'src/libs/schema';
import CallService from 'src/services/call';
import { voxImplantReLogin } from 'src/services/login';
import { getPushToken, PushToken, subscribeToPushNotifications } from 'src/services/pushnotifications';
import { getSession, saveSession, Session } from 'src/services/session';
import { runInQueue } from 'src/utils/run-in-queue';

const initial: Model = {
    sessionResponse: loading,
    pushTokenResponse: loading,
    login: Login.initial,
    signUp: SignUp.initial,
    main: Main.initial,
    call: Call.initial,
    incomingCall: IncomingCall.initial,
};

interface Model {
    sessionResponse: RemoteData<Session>;
    pushTokenResponse: RemoteData<PushToken>;
    login: Login.Model;
    signUp: SignUp.Model;
    main: Main.Model;
    call: Call.Model;
    incomingCall: IncomingCall.Model;
}

const rootTree = getTree(initial, {});

function withProps<P>(Component: React.ComponentClass<P>, props: P) {
    class Wrapper extends React.Component<P> {
        public render() {
            return <Component {...this.props} {...props} />;
        }
    }

    hoistNonReactStatics(Wrapper, Component);

    return Wrapper;
}

Navigation.registerComponent('td.Login', () =>
    withProps(Login.Component, { tree: rootTree.login, sessionResponseCursor: rootTree.sessionResponse, init })
);
Navigation.registerComponent('td.SignUp', () =>
    withProps(SignUp.Component, { tree: rootTree.signUp, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.Main', () =>
    withProps(Main.Component, { tree: rootTree.main, sessionResponseCursor: rootTree.sessionResponse, deinit })
);
Navigation.registerComponent('td.Call', () =>
    withProps(Call.Component, { tree: rootTree.call, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.IncomingCall', () =>
    withProps(IncomingCall.Component, { tree: rootTree.incomingCall, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.Modal', () => Modal.Component);

async function init() {
    const client = Voximplant.getInstance();

    const pushTokenResponse = await getPushToken(rootTree.pushTokenResponse);

    if (isSuccess(pushTokenResponse)) {
        await client.registerPushNotificationsToken(pushTokenResponse.data);
        console.log('PushToken registered', pushTokenResponse.data);
    }

    CallService.getInstance().init();
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

    CallService.getInstance().deinit();

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
            CallService.getInstance().init();

            await Navigation.setRoot({
                root: {
                    stack: {
                        id: 'root',
                        children: [
                            {
                                component: {
                                    name: 'td.Main',
                                },
                            },
                        ],
                    },
                },
            });
        } else {
            await Navigation.setRoot({
                root: {
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
            });
        }
    });

    subscribeToPushNotifications(async (notification) => {
        console.log('New notification', notification);

        if (await restoreSession()) {
            const client = Voximplant.getInstance();

            CallService.getInstance().init();

            client.handlePushNotification({ voximplant: notification.voximplant });
        }
    });

    AppState.addEventListener('change', async (appState) => {
        if (appState === 'active') {
            await restoreSession();
        }
    });
}

bootstrap();

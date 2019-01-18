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
import { VoxImplantTokens } from 'src/contrib/vox-implant';
import { isSuccess, isSuccessCursor, loading, notAsked, RemoteData } from 'src/libs/schema';
import CallService from 'src/services/call';
import { voxImplantReLogin } from 'src/services/login';
import { getPushToken, PushToken, subscribeToPushNotifications } from 'src/services/pushnotifications';
import { getSession, saveSession, Session } from 'src/services/session';

const initial: Model = {
    sessionResponse: loading,
    voxImplantTokensResponse: notAsked,
    pushTokenResponse: loading,
    login: Login.initial,
    signUp: SignUp.initial,
    main: Main.initial,
    call: Call.initial,
    incomingCall: IncomingCall.initial,
};

interface Model {
    sessionResponse: RemoteData<Session>;
    voxImplantTokensResponse: RemoteData<VoxImplantTokens>;
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

async function refreshVoxImplantConnection() {
    if (isSuccessCursor(rootTree.sessionResponse)) {
        const session = rootTree.sessionResponse.get().data;

        const voxImplantTokensResponse = await voxImplantReLogin(rootTree.voxImplantTokensResponse, session);
        if (isSuccess(voxImplantTokensResponse)) {
            await saveSession(rootTree.sessionResponse, {
                ...session,
                voxImplantTokens: voxImplantTokensResponse.data,
            });
        }
    }
}

// TODO: move init and deinit to Main screen Lifecycle
async function init() {
    const client = Voximplant.getInstance();

    const pushTokenResponse = await getPushToken(rootTree.pushTokenResponse);

    if (isSuccess(pushTokenResponse)) {
        await client.registerPushNotificationsToken(pushTokenResponse.data);
        console.log('pushtoken registered', pushTokenResponse.data);
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

    await client.disconnect();
}

Navigation.events().registerAppLaunchedListener(async () => {
    const sessionResponse = await getSession(rootTree.sessionResponse);

    AppState.addEventListener('change', async (appState) => {
        if (appState === 'active') {
            await refreshVoxImplantConnection();
        }
    });

    if (isSuccess(sessionResponse)) {
        await refreshVoxImplantConnection();
        await init();

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
    const sessionResponse = await getSession(rootTree.sessionResponse);

    console.log('NEW NOTIFICATION', notification);

    if (isSuccess(sessionResponse)) {
        const client = Voximplant.getInstance();

        await refreshVoxImplantConnection();
        // TODO: ???
        CallService.getInstance().init();

        client.handlePushNotification({ voximplant: notification.voximplant });
    }
});

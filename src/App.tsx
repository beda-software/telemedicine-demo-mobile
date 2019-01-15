// @ts-ignore
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';

import * as Call from 'src/containers/Call';
import * as IncomingCall from 'src/containers/IncomingCall';
import * as Login from 'src/containers/Login';
import * as Main from 'src/containers/Main';
import * as Modal from 'src/containers/Modal';
import * as SignUp from 'src/containers/SignUp';
import { getTree } from 'src/contrib/typed-baobab';
import { isSuccess, loading, RemoteData } from 'src/libs/schema';
import { getSession, Session } from 'src/services/session';

import { Navigation } from 'react-native-navigation';

const initial: Model = {
    sessionResponse: loading,
    login: Login.initial,
    signUp: SignUp.initial,
    main: Main.initial,
    call: Call.initial,
    incomingCall: IncomingCall.initial,
};

interface Model {
    sessionResponse: RemoteData<Session>;
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
    withProps(Login.Component, { tree: rootTree.login, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.SignUp', () =>
    withProps(SignUp.Component, { tree: rootTree.signUp, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.Main', () =>
    withProps(Main.Component, { tree: rootTree.main, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.Call', () =>
    withProps(Call.Component, { tree: rootTree.call, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.IncomingCall', () =>
    withProps(IncomingCall.Component, { tree: rootTree.incomingCall, sessionResponseCursor: rootTree.sessionResponse })
);
Navigation.registerComponent('td.Modal', () => Modal.Component);

Navigation.events().registerAppLaunchedListener(async () => {
    const result = await getSession(rootTree.sessionResponse);

    if (isSuccess(result)) {
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

import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as Login from 'src/containers/Login';
import { getTree } from 'src/contrib/typed-baobab';
import { Token } from 'src/contrib/aidbox';
import { loading, RemoteData } from 'src/libs/schema';
// import { getToken, resetToken } from 'src/services/token';

import { Navigation } from 'react-native-navigation';

const initial: Model = {
    tokenResponse: loading,
    login: Login.initial,
};

interface Model {
    tokenResponse: RemoteData<Token>;
    login: Login.Model;
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
    withProps(Login.Component, { tree: rootTree.login, tokenResponseCursor: rootTree.tokenResponse })
);
// Navigation.registerComponentWithRedux('td.SignUp', () => SignUp, Provider, store);
// Navigation.registerComponentWithRedux('td.Main', () => Main, Provider, store);
// Navigation.registerComponentWithRedux('td.Call', () => Call, Provider, store);
// Navigation.registerComponentWithRedux('td.IncomingCall', () => IncomingCall, Provider, store);

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
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
});

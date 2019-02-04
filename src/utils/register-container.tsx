// @ts-ignore
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { Preloader } from 'src/components/Preloader';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoading, isSuccess, RemoteData } from 'src/libs/schema';
import { Session } from 'src/services/session';

function withProps<P>(Component: React.ComponentType<P>, props: Partial<P>) {
    class Wrapper extends React.Component<P> {
        public render() {
            return <Component {...this.props} {...props} />;
        }
    }

    hoistNonReactStatics(Wrapper, Component);

    return Wrapper;
}

function withSession<P>(
    Component: React.ComponentType<P & { session: Session }>,
    sessionResponseCursor: Cursor<RemoteData<Session>>
) {
    class Wrapper extends React.Component<P> {
        constructor(props: P) {
            super(props);
            this.onUpdate = this.onUpdate.bind(this);

            (sessionResponseCursor as any).on('update', this.onUpdate);
        }

        public componentWillUnmount() {
            (sessionResponseCursor as any).off('update', this.onUpdate);
        }

        public onUpdate() {
            this.forceUpdate();
        }

        public render() {
            const sessionResponse = sessionResponseCursor.get();

            if (isLoading(sessionResponse)) {
                return <Preloader isVisible={true} />;
            }

            if (isSuccess(sessionResponse)) {
                return <Component {...this.props} session={sessionResponse.data} />;
            }

            return (
                <View>
                    <Text>Sorry, but you don't have a session. Please try to login again</Text>

                    <Button
                        onPress={() => Navigation.setStackRoot('root', { component: { name: 'Login' } })}
                        title="Go to login"
                    />
                </View>
            );
        }
    }

    hoistNonReactStatics(Wrapper, Component);

    return Wrapper;
}

export function registerContainer<P>(name: string, component: React.ComponentType<P>, passProps: Partial<P> = {}) {
    Navigation.registerComponent(name, () => withProps(component, passProps));
}

export function registerSessionAwareContainer<P>(
    name: string,
    component: React.ComponentType<P & { session: Session }>,
    sessionResponseCursor: Cursor<RemoteData<Session>>,
    passProps: Partial<P & { session: Session }> = {}
) {
    Navigation.registerComponent(name, () => withSession(withProps(component, passProps), sessionResponseCursor));
}

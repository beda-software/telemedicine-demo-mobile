// @ts-ignore
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';

export function withProps<P>(Component: React.ComponentClass<P>, props: P) {
    class Wrapper extends React.Component<P> {
        public render() {
            return <Component {...this.props} {...props} />;
        }
    }

    hoistNonReactStatics(Wrapper, Component);

    return Wrapper;
}

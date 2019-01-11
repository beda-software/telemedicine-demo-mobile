import * as React from 'react';
import * as _ from 'lodash';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Cursor } from '../contrib/my-baobab';

function initCursor(cursor: Cursor, modelSchema: any): void {
    if (_.isFunction(modelSchema)) {
        if (!cursor.exists()) {
            modelSchema(cursor);
        }
    } else if (_.isPlainObject(modelSchema) && !_.isArray(modelSchema)) {
        _.each(modelSchema, (childSchema, path) => {
            initCursor(cursor.select(path), childSchema);
        });
    } else if (!cursor.exists()) {
        cursor.set(modelSchema);
    }
}

function arePropsEqual(oldProps: any, newProps: any) {
    const oldKeys = _.keys(oldProps);
    const newKeys = _.keys(newProps);
    if (oldKeys.length !== newKeys.length) {
        return false;
    }

    return !_.some(oldProps, (oldProp, key) => {
        if (oldProp instanceof Cursor) {
            return oldProp.path !== newProps[key].path;
        }
        return !_.isEqual(oldProp, newProps[key]);
    });
}

export function schema<P>(model: any) {
    return ((Component: React.ComponentClass<any>) => {
        class Wrapper extends React.Component<any, {}> {
            constructor(props: any) {
                super(props);

                this.onUpdate = this.onUpdate.bind(this);

                _.each(props, (prop, propName) => {
                    if (prop instanceof Cursor) {
                        this.handleNewCursor(prop, propName);
                    }
                });
            }

            public handleNewCursor(cursor: Cursor, cursorName: string) {
                const schemaPart = model[cursorName];
                if (schemaPart) {
                    initCursor(cursor, schemaPart);
                    cursor.tree.commit();
                }
                cursor.on('update', this.onUpdate);
            }

            public componentWillUnmount() {
                _.each(this.props, (cursor) => {
                    if (cursor instanceof Cursor) {
                        cursor.off('update', this.onUpdate);
                    }
                });
            }

            public shouldComponentUpdate(nextProps: any, nextState: any) {
                return !arePropsEqual(this.props, nextProps);
            }

            public componentWillReceiveProps(props: any) {
                _.each(props, (prop, propName) => {
                    if (prop instanceof Cursor) {
                        const oldProp = this.props[propName];
                        if (oldProp.path !== prop.path) {
                            oldProp.off('update', this.onUpdate);
                            this.handleNewCursor(prop, propName);
                            console.error("Cursor path's was changed. This should never happen!!!");
                        }
                    }
                });
            }

            public onUpdate() {
                this.forceUpdate();
            }

            public render() {
                const { innerRef, ...rest } = this.props;

                return <Component ref={innerRef} {...rest} />;
            }
        }

        const WrapperForwardingRef = React.forwardRef((props, ref) => <Wrapper innerRef={ref} {...props} />);

        return hoistNonReactStatics(WrapperForwardingRef, Component);
    }) as any;
}

// @ts-ignore
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as _ from 'lodash';
import * as React from 'react';
import { Cursor } from '../contrib/my-baobab';

function initCursor(cursor: Cursor, modelSchema: any): void {
    if (_.isFunction(modelSchema)) {
        if (!cursor.exists()) {
            modelSchema(cursor);
        }
    } else if (_.isPlainObject(modelSchema) && !_.isArray(modelSchema)) {
        _.forEach(modelSchema, (childSchema, path: string) => {
            initCursor(cursor.select(path), childSchema);
        });
    } else if (!cursor.exists()) {
        cursor.set(modelSchema);
    }
}

export function arePropsEqual(oldProps: any, newProps: any) {
    const oldKeys = _.keys(oldProps);
    const newKeys = _.keys(newProps);
    if (oldKeys.length !== newKeys.length) {
        return false;
    }

    return !_.some(oldProps, (oldProp, key) => {
        if (oldProp instanceof Cursor && oldProp && newProps[key]) {
            return oldProp.path !== newProps[key].path;
        }

        return !_.isEqual(oldProp, newProps[key]);
    });
}

export function schema<P>(model: any) {
    interface WrapperProps {
        Component: React.ComponentClass<P>;
        forwardedRef: React.Ref<React.ComponentClass<P>>;
        passProps: P;
    }

    class Wrapper extends React.Component<WrapperProps, {}> {
        constructor(props: WrapperProps) {
            super(props);

            this.onUpdate = this.onUpdate.bind(this);

            _.forEach(props.passProps as any, (prop, propName: string) => {
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
            _.forEach(this.props.passProps as any, (prop) => {
                if (prop instanceof Cursor) {
                    prop.off('update', this.onUpdate);
                }
            });
        }

        public shouldComponentUpdate(nextProps: WrapperProps) {
            return !arePropsEqual(this.props.passProps, nextProps.passProps);
        }

        public componentWillReceiveProps(props: WrapperProps) {
            _.forEach(props.passProps as any, (prop, propName: string) => {
                if (prop instanceof Cursor) {
                    const oldProp = this.props.passProps[propName];
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
            const { Component, forwardedRef, passProps } = this.props;

            return <Component ref={forwardedRef} {...passProps} />;
        }
    }

    return ((Component: React.ComponentClass<P>) => {
        const RefForwardedComponent = React.forwardRef((props: P, ref: React.Ref<React.ComponentClass<P>>) => (
            <Wrapper Component={Component} forwardedRef={ref} passProps={props} />
        ));

        return hoistNonReactStatics(
            RefForwardedComponent,
            Component as React.ComponentClass<React.PropsWithoutRef<P>> // I don't know how to deal with exotic component which forwardRef returns
        );
    }) as any;
}

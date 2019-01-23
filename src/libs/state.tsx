// @ts-ignore
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import * as React from 'react';
import { Cursor } from '../contrib/my-baobab';

function initCursor(cursor: Cursor, modelSchema: any): void {
    if (RA.isFunction(modelSchema)) {
        if (!cursor.exists()) {
            modelSchema(cursor);
        }
    } else if (RA.isPlainObject(modelSchema) && !RA.isArray(modelSchema)) {
        R.forEachObjIndexed((childSchema, path: string) => {
            initCursor(cursor.select(path), childSchema);
        }, modelSchema);
    } else if (!cursor.exists()) {
        cursor.set(modelSchema);
    }
}

export function arePropsEqual(oldProps: any, newProps: any) {
    const oldKeys = R.keys(oldProps);
    const newKeys = R.keys(newProps);
    if (oldKeys.length !== newKeys.length) {
        return false;
    }

    return !R.any(
        RA.isTrue,
        R.values(
            R.mapObjIndexed((oldProp, key: string) => {
                if (oldProp instanceof Cursor) {
                    return oldProp.path !== newProps[key].path;
                }

                return !R.equals(oldProp, newProps[key]);
            }, oldProps)
        )
    );
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

            R.forEachObjIndexed(
                (prop, propName: string) => {
                    if (prop instanceof Cursor) {
                        this.handleNewCursor(prop, propName);
                    }
                },
                props.passProps as any
            );
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
            R.forEachObjIndexed(
                (prop) => {
                    if (prop instanceof Cursor) {
                        prop.off('update', this.onUpdate);
                    }
                },
                this.props.passProps as any
            );
        }

        public shouldComponentUpdate(nextProps: WrapperProps) {
            return !arePropsEqual(this.props.passProps, nextProps.passProps);
        }

        public componentWillReceiveProps(props: WrapperProps) {
            R.forEachObjIndexed(
                (prop, propName: string) => {
                    if (prop instanceof Cursor) {
                        const oldProp = this.props.passProps[propName];
                        if (oldProp.path !== prop.path) {
                            oldProp.off('update', this.onUpdate);
                            this.handleNewCursor(prop, propName);
                            console.error("Cursor path's was changed. This should never happen!!!");
                        }
                    }
                },
                props.passProps as any
            );
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

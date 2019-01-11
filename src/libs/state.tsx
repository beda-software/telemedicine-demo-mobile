import * as React from 'react';
import * as _ from 'lodash';
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
    class Wrapper extends React.Component<{ passProps: P; component: any }, {}> {
        constructor(props: any) {
            super(props);

            this.onUpdate = this.onUpdate.bind(this);
            const passProps: any = props.passProps;

            _.each(passProps, (prop, propName) => {
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
            const passProps: any = this.props.passProps;
            _.each(passProps, (cursor) => {
                if (cursor instanceof Cursor) {
                    cursor.off('update', this.onUpdate);
                }
            });
        }

        public shouldComponentUpdate(nextProps: { passProps: P }, nextState: any) {
            return !arePropsEqual(this.props.passProps, nextProps.passProps);
        }

        public componentWillReceiveProps(props: any) {
            _.each(props.passProps, (prop, propName) => {
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
            const Component = this.props.component;

            return <Component {...this.props.passProps} />;
        }
    }

    return ((Component: any) => {
        return (props: P) => <Wrapper passProps={props} component={Component} />;
    }) as any;
}

import * as React from 'react';
import autoBind from 'react-autobind';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { Preloader } from 'src/components/Preloader';
import { Cursor } from 'src/contrib/typed-baobab';
import { isSuccess, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { clearSession, Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

export interface Model {
    isPending: boolean;
}

export const initial: Model = {
    isPending: false,
};

interface ComponentProps {
    tree: Cursor<Model>;
    componentId: string;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
    deinit: () => void;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    constructor(props: ComponentProps) {
        super(props);

        autoBind(this);
    }

    public async logout() {
        this.props.tree.isPending.set(true);
        try {
            await clearSession(this.props.sessionResponseCursor);
            await this.props.deinit();
            await Navigation.setStackRoot('root', { component: { name: 'td.Login' } });
        } finally {
            this.props.tree.isPending.set(false);
        }
    }

    public async hideMenu() {
        await Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: false,
                },
            },
        });
    }

    public render() {
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                {isSuccess(this.props.sessionResponseCursor.get()) ? (
                    <View>
                        <TouchableOpacity
                            style={{ padding: 15, borderBottomWidth: 1, color: COLOR.ACCENT }}
                            onPress={async () => {
                                await Navigation.setStackRoot('root', { component: { name: 'td.ContactList' } });
                                await this.hideMenu();
                            }}
                        >
                            <Text>Contacts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 15, borderBottomWidth: 1, color: COLOR.ACCENT }}
                            onPress={async () => {
                                await Navigation.setStackRoot('root', { component: { name: 'td.ChatList' } });
                                await this.hideMenu();
                            }}
                        >
                            <Text>Chats</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 15, borderBottomWidth: 1, color: COLOR.ACCENT }}
                            onPress={async () => {
                                await this.logout();
                                await this.hideMenu();
                            }}
                        >
                            <Text>Logout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View />
                )}
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

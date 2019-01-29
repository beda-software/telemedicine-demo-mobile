import * as R from 'ramda';
import * as React from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { Preloader } from 'src/components/Preloader';
import { Bundle, Observation } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';

export interface Model {
    isPending: boolean;
    observationListBundleResponse: RemoteData<Bundle<Observation>>;
}

export const initial: Model = {
    isPending: false,
    observationListBundleResponse: notAsked,
};

interface ComponentProps {
    componentId: string;
    tree: Cursor<Model>;
    session: Session;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                title: {
                    text: 'Add observation',
                },
                rightButtons: [
                    {
                        id: 'save',
                        text: 'Save',
                    },
                ],
            },
            sideMenu: {
                left: {
                    enabled: true,
                },
            },
        };
    }

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);

        Navigation.events().bindComponent(this);
    }

    public navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'menu') {
            Navigation.mergeOptions(this.props.componentId, {
                sideMenu: {
                    left: {
                        visible: true,
                    },
                },
            });
        }
    }

    public renderContent() {
        return <View />;
    }

    public render() {
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <View style={s.useragent}>{this.renderContent()}</View>
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

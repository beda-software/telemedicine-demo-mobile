import * as R from 'ramda';
import * as React from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { Preloader } from 'src/components/Preloader';
import { Bundle, Observation } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isLoadingCursor, isNotAskedCursor, isSuccessCursor, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { getFHIRResources } from 'src/services/fhir';
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
                    text: 'Observations',
                },
                leftButtons: [
                    {
                        id: 'menu',
                        icon:
                            Platform.OS === 'ios'
                                ? require('src/images/burger_ios.png')
                                : require('src/images/burger_android.png'),
                        color: 'black',
                    },
                ],
                rightButtons: [
                    {
                        id: 'add',
                        text: 'Add',
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

    public async componentDidAppear() {
        await this.fetchObservations();
    }

    public navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'add') {
            Navigation.push(this.props.componentId, {
                component: {
                    name: 'td.ObservationAdd',
                },
            });
        }
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

    public async fetchObservations() {
        const { session } = this.props;

        await getFHIRResources(this.props.tree.observationListBundleResponse, 'Observation', {}, session.token);
    }

    public renderContent() {
        const { tree } = this.props;

        const bundleResponseCursor = tree.observationListBundleResponse;
        if (isNotAskedCursor(bundleResponseCursor) || isLoadingCursor(bundleResponseCursor)) {
            return <Preloader isVisible={true} />;
        }

        if (isSuccessCursor(bundleResponseCursor)) {
            const bundle = bundleResponseCursor.data.get();
            const resources = R.map((entry) => entry.resource!, bundle.entry || []);

            return (
                <FlatList<Observation>
                    data={resources}
                    listKey="observation-list"
                    keyExtractor={(item) => item.id!}
                    renderItem={({ item }) => {
                        return (
                            <View
                                style={{
                                    alignSelf: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingLeft: 10,
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={s.contactListItem}>{item.id!}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }} />
                            </View>
                        );
                    }}
                />
            );
        }

        return (
            <View>
                <Text>Something went wrong</Text>
            </View>
        );
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

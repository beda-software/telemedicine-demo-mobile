import * as React from 'react';
import { Field, Form } from 'react-final-form';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { InputField } from 'src/components/InputFIeld';
import { Preloader } from 'src/components/Preloader';
import { Observation } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { saveFHIRResource } from 'src/services/fhir';
import { Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';
import validate from './validation';

interface FormValues {
    value: string;
}

export interface Model {
    isPending: boolean;
    response: RemoteData<Observation>;
}

export const initial: Model = {
    isPending: false,
    response: notAsked,
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

    private handleSubmit: () => void;

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);

        Navigation.events().bindComponent(this);
    }

    public navigationButtonPressed({ buttonId }: any) {
        if (buttonId === 'save') {
            this.handleSubmit();
        }
    }

    public async onSubmit(values: FormValues) {
        const { tree, session, componentId } = this.props;

        if (tree.isPending.get()) {
            return;
        }

        const d = new Date();

        const resource: Observation = {
            resourceType: 'Observation',
            status: 'preliminary',
            code: {
                coding: [
                    {
                        system: 'http://loinc.org',
                        code: '8310-5',
                    },
                ],
            },
            value: {
                Quantity: {
                    system: 'http://unitsofmeasure.org',
                    value: parseFloat(values.value),
                    code: 'degF',
                },
            },
            effective: {
                dateTime: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
            },
        };

        tree.isPending.set(true);
        try {
            const response = await saveFHIRResource(tree.response, resource, session.token);
            if (isSuccess(response)) {
                await Navigation.pop(componentId);
            } else {
                await Navigation.showOverlay({
                    component: {
                        name: 'td.Modal',
                        passProps: {
                            text: `Something went wrong while creating the obsevation. ${JSON.stringify(
                                response.error
                            )}`,
                        },
                    },
                });
            }
        } finally {
            tree.isPending.set(false);
        }
    }

    public renderForm() {
        return (
            <Form onSubmit={(values: FormValues) => this.onSubmit(values)} validate={validate}>
                {({ handleSubmit }) => {
                    // It is the only one possible option to do it
                    // https://github.com/final-form/react-final-form/blob/master/docs/faq.md#via-closure
                    this.handleSubmit = handleSubmit;

                    return (
                        <View>
                            <Text style={s.formInputLabel}>Your current temperature</Text>
                            <Field name="value">
                                {(fieldProps) => (
                                    <InputField
                                        underlineColorAndroid="transparent"
                                        style={s.formInput}
                                        errorStyle={s.formInputError}
                                        placeholder="Value"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onSubmitEditing={() => handleSubmit()}
                                        blurOnSubmit
                                        autoFocus
                                        {...fieldProps}
                                    />
                                )}
                            </Field>
                        </View>
                    );
                }}
            </Form>
        );
    }

    public render() {
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <View style={[s.useragent, s.addForm]}>{this.renderForm()}</View>
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

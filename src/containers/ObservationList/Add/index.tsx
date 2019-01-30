import * as React from 'react';
import { Field, Form } from 'react-final-form';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { InputField } from 'src/components/InputFIeld';
import { PickerField } from 'src/components/PickerField';
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
    code: string;
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

function getUnitByCode(code: string) {
    switch (code) {
        case '8310-5': {
            return 'degF';
        }
        case '3141-9': {
            return 'kg';
        }
        case '8302-2': {
            return 'cm';
        }
        default: {
            return undefined;
        }
    }
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
                        code: values.code,
                    },
                ],
            },
            value: {
                Quantity: {
                    system: 'http://unitsofmeasure.org',
                    value: parseFloat(values.value),
                    code: getUnitByCode(values.code),
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
                            <Text style={s.formInputLabel}>Select measure type</Text>
                            <Field name="code">
                                {(fieldProps) => (
                                    <PickerField
                                        underlineColorAndroid="transparent"
                                        style={s.formInput}
                                        errorStyle={s.formInputError}
                                        options={[
                                            { label: 'Temperature', value: '8310-5' },
                                            { label: 'Weight', value: '3141-9' },
                                            { label: 'Height', value: '8302-2' },
                                        ]}
                                        {...fieldProps}
                                    />
                                )}
                            </Field>

                            {console.log(Form)}
                            <Text style={s.formInputLabel}>Your current measure</Text>
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

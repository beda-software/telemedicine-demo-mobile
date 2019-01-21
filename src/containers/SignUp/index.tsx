import * as React from 'react';
import { Field, Form } from 'react-final-form';
import {
    Keyboard,
    KeyboardAvoidingView,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import { InputField } from 'src/components/InputFIeld';
import { Logo } from 'src/components/Logo';
import { Preloader } from 'src/components/Preloader';
import { User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { Session } from 'src/services/session';
import { signUp } from 'src/services/sign-up';
import COLOR from 'src/styles/Color';
import s from './style';
import validate from './validation';

interface FormValues {
    username: string;
    displayName: string;
    password: string;
    passwordConfirm: string;
}

export interface Model {
    response: RemoteData<User>;
    isPending: boolean;
}

export const initial: Model = {
    response: notAsked,
    isPending: false,
};

interface ComponentProps {
    tree: Cursor<Model>;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                visible: false,
            },
        };
    }

    private displayNameRef = React.createRef<TextInput>();
    private passwordRef = React.createRef<TextInput>();
    private passwordConfirmRef = React.createRef<TextInput>();

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);
    }

    public async onSubmit(values: FormValues) {
        this.props.tree.isPending.set(true);
        try {
            const response = await signUp(this.props.tree.response, values);

            if (isSuccess(response)) {
                await Navigation.showOverlay({
                    component: {
                        name: 'td.Modal',
                        passProps: {
                            text: 'You have successfully registered. Please login using your username and password',
                        },
                    },
                });
                await Navigation.setStackRoot('root', { component: { name: 'td.Login' } });
            } else {
                await Navigation.showOverlay({
                    component: {
                        name: 'td.Modal',
                        passProps: { text: `Something went wrong. ${JSON.stringify(response.error)}` },
                    },
                });
            }
        } finally {
            this.props.tree.isPending.set(false);
        }
    }

    public renderForm() {
        return (
            <Form onSubmit={(values: FormValues) => this.onSubmit(values)} validate={validate}>
                {({ handleSubmit }) => (
                    <View>
                        <Field name="username">
                            {(fieldProps) => (
                                <InputField
                                    underlineColorAndroid="transparent"
                                    style={s.formInput}
                                    errorStyle={s.formInputError}
                                    placeholder="Username"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onSubmitEditing={() => this.displayNameRef.current!.focus()}
                                    blurOnSubmit
                                    autoFocus
                                    {...fieldProps}
                                />
                            )}
                        </Field>
                        <Field name="displayName">
                            {(fieldProps) => (
                                <InputField
                                    underlineColorAndroid="transparent"
                                    style={s.formInput}
                                    errorStyle={s.formInputError}
                                    placeholder="Display Name"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    ref={this.displayNameRef}
                                    onSubmitEditing={() => this.passwordRef.current!.focus()}
                                    blurOnSubmit
                                    {...fieldProps}
                                />
                            )}
                        </Field>
                        <Field name="password">
                            {(fieldProps) => (
                                <InputField
                                    underlineColorAndroid="transparent"
                                    style={s.formInput}
                                    errorStyle={s.formInputError}
                                    placeholder="Password"
                                    ref={this.passwordRef}
                                    onSubmitEditing={() => this.passwordConfirmRef.current!.focus()}
                                    blurOnSubmit
                                    secureTextEntry
                                    {...fieldProps}
                                />
                            )}
                        </Field>
                        <Field name="passwordConfirm">
                            {(fieldProps) => (
                                <InputField
                                    underlineColorAndroid="transparent"
                                    style={s.formInput}
                                    errorStyle={s.formInputError}
                                    placeholder="Confirm password"
                                    onSubmitEditing={() => handleSubmit()}
                                    ref={this.passwordConfirmRef}
                                    blurOnSubmit
                                    secureTextEntry
                                    {...fieldProps}
                                />
                            )}
                        </Field>
                        <TouchableOpacity
                            onPress={() => handleSubmit()}
                            style={{
                                width: 220,
                                alignSelf: 'center',
                            }}
                        >
                            <Text style={s.signUpButton}>SIGN UP</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Navigation.setStackRoot('root', { component: { name: 'td.Login' } })}
                            style={{
                                width: 220,
                                alignSelf: 'center',
                            }}
                        >
                            <Text style={s.signUpButton}>GO TO LOGIN</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Form>
        );
    }

    public render() {
        const isPending = this.props.tree.isPending.get();

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[s.container]}>
                        <Logo />

                        <KeyboardAvoidingView behavior="padding" style={s.signUpForm}>
                            {this.renderForm()}
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

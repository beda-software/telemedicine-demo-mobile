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
import { Voximplant } from 'react-native-voximplant';

import { InputField } from 'src/components/InputFIeld';
import { Logo } from 'src/components/Logo';
import { Preloader } from 'src/components/Preloader';
import { Token } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { isSuccess, notAsked, RemoteData } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { login, voxImplantLogin } from 'src/services/login';
import { saveSession, Session } from 'src/services/session';
import COLOR from 'src/styles/Color';
import s from './style';
import validate from './validation';

interface FormValues {
    username: string;
    password: string;
}

export interface Model {
    tokenResponse: RemoteData<Token>;
    voxImplantTokensResponse: RemoteData<Voximplant['LoginTokens']>;
    isPending: boolean;
}

export const initial: Model = {
    tokenResponse: notAsked,
    voxImplantTokensResponse: notAsked,
    isPending: false,
};

interface ComponentProps {
    tree: Cursor<Model>;
    sessionResponseCursor: Cursor<RemoteData<Session>>;
    init: () => void;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    public static options() {
        return {
            topBar: {
                visible: false,
            },
            sideMenu: {
                left: {
                    enabled: false,
                },
            },
        };
    }

    private passwordRef = React.createRef<TextInput>();

    constructor(props: ComponentProps) {
        super(props);

        props.tree.set(initial);
    }

    public async onSubmit(values: FormValues) {
        this.props.tree.isPending.set(true);
        try {
            const tokenResponse = await login(this.props.tree.tokenResponse, values);

            if (isSuccess(tokenResponse)) {
                const voxImplantTokensResponse = await voxImplantLogin(this.props.tree.voxImplantTokensResponse, {
                    username: values.username,
                    token: tokenResponse.data,
                });

                if (isSuccess(voxImplantTokensResponse)) {
                    const session = {
                        username: values.username,
                        token: tokenResponse.data,
                        voxImplantTokens: voxImplantTokensResponse.data,
                    };
                    await saveSession(this.props.sessionResponseCursor, session);
                    await this.props.init();
                    await Navigation.setStackRoot('root', { component: { name: 'td.ContactList' } });
                } else {
                    await Navigation.showOverlay({
                        component: {
                            name: 'td.Modal',
                            passProps: { text: `Something went wrong with VI login` },
                        },
                    });
                }
            } else {
                await Navigation.showOverlay({
                    component: {
                        name: 'td.Modal',
                        passProps: { text: 'Something went wrong with login' },
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
                                    onSubmitEditing={() => this.passwordRef.current!.focus()}
                                    blurOnSubmit
                                    autoFocus
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
                                    placeholder="User password"
                                    onSubmitEditing={() => handleSubmit()}
                                    ref={this.passwordRef}
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
                            <Text style={s.loginButton}>LOGIN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Navigation.setStackRoot('root', { component: { name: 'td.SignUp' } })}
                            style={{
                                width: 220,
                                alignSelf: 'center',
                            }}
                        >
                            <Text style={s.loginButton}>GO TO SIGN UP</Text>
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
                        <View style={s.logo}>
                            <Logo />
                        </View>
                        <KeyboardAvoidingView behavior="padding" style={s.loginForm}>
                            {this.renderForm()}
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
                <Preloader isVisible={isPending} />
            </SafeAreaView>
        );
    }
}

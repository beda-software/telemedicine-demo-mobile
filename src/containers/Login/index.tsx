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
import { Token } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { VoxImplantTokens } from 'src/contrib/vox-implant';
import { isLoadingCursor, isSuccess, notAsked, RemoteData } from 'src/libs/schema';
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
    voxImplantTokensResponse: RemoteData<VoxImplantTokens>;
}

export const initial: Model = {
    tokenResponse: notAsked,
    voxImplantTokensResponse: notAsked,
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
        };
    }

    private passwordRef = React.createRef<TextInput>();

    public async onSubmit(values: FormValues) {
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
                await Navigation.setStackRoot('root', { component: { name: 'td.Main' } });
            } else {
                await Navigation.showOverlay({
                    component: { name: 'td.Modal', passProps: { text: `Something went wrong with VI login` } },
                });
            }
        } else {
            await Navigation.showOverlay({
                component: { name: 'td.Modal', passProps: { text: 'Something went wrong with login' } },
            });
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
                                    style={s.forminput}
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
                                    style={s.forminput}
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
                            <Text style={s.loginbutton}>LOGIN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Navigation.setStackRoot('root', { component: { name: 'td.SignUp' } })}
                            style={{
                                width: 220,
                                alignSelf: 'center',
                            }}
                        >
                            <Text style={s.loginbutton}>GO TO SIGN UP</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Form>
        );
    }

    public render() {
        const isLoading =
            isLoadingCursor(this.props.tree.tokenResponse) || isLoadingCursor(this.props.tree.voxImplantTokensResponse);

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[s.container]}>
                        <Logo />
                        <KeyboardAvoidingView behavior="padding" style={s.loginform}>
                            {this.renderForm()}
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
                <Preloader isVisible={isLoading} />
            </SafeAreaView>
        );
    }
}

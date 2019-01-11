import * as React from 'react';
import { View, SafeAreaView, StatusBar, TouchableOpacity, Text, KeyboardAvoidingView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import COLOR from 'src/styles/Color';
import Logo from 'src/components/Logo';

import { Token } from 'src/contrib/aidbox';
import { RemoteData, notAsked } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { Cursor } from 'src/contrib/typed-baobab';
import { Input } from 'src/components/Input';
import s from './style';

export interface Model {
    form: {
        username: string;
        password: string;
    };
    response: RemoteData<Token>;
}

export const initial: Model = {
    form: {
        username: '',
        password: '',
    },
    response: notAsked,
};

interface ComponentProps {
    tree: Cursor<Model>;
    tokenResponseCursor: Cursor<RemoteData<Token>>;
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

    private passwordRef = React.createRef<Input>();

    // constructor(props: LoginProps) {
    //     super(props);
    //
    //     this.onSubmit = this.onSubmit.bind(this);
    //     this.props.tree.response.set(notAsked);
    // }
    //
    public async onSubmit() {
        // const form = this.props.tree.form.get();
        // const response = await login(this.props.tree.response, form);
        // if (isSuccess(response)) {
        //     await setToken(this.props.tokenResponseCursor, response.data);
        //     this.props.history.push('/app');
        // }
    }
    //
    // public renderSubmit() {
    //     return <input className={s.submit} onClick={this.onSubmit} type="submit" value="Sign in" />;
    // }
    //
    // public renderResponse() {
    //     const response = this.props.tree.response.get();
    //
    //     if (isNotAsked(response)) {
    //         return this.renderSubmit();
    //     }
    //
    //     if (isLoading(response)) {
    //         return <p>Loading ...</p>;
    //     }
    //
    //     if (isSuccess(response)) {
    //         return <p>{response.data.access_token}</p>;
    //     }
    //
    //     if (isFailure(response)) {
    //         return (
    //             <div>
    //                 <p>{JSON.stringify(response.error)}</p>
    //                 {this.renderSubmit()}
    //             </div>
    //         );
    //     }
    //
    //     return null;
    // }

    public render() {
        const formCursor = this.props.tree.form;

        return (
            <SafeAreaView style={s.safearea}>
                <StatusBar backgroundColor={COLOR.PRIMARY_DARK} />
                <KeyboardAvoidingView behavior="padding" style={[s.container]}>
                    <View>
                        <Logo />

                        <View style={s.loginform}>
                            <Input
                                cursor={formCursor.username}
                                underlineColorAndroid="transparent"
                                style={s.forminput}
                                placeholder="Username"
                                autoCapitalize="none"
                                autoCorrect={false}
                                onSubmitEditing={() => {
                                    if (this.passwordRef.current) {
                                        this.passwordRef.current.focus();
                                    }
                                }}
                                blurOnSubmit
                                autoFocus
                            />
                            <Input
                                cursor={formCursor.password}
                                underlineColorAndroid="transparent"
                                style={s.forminput}
                                placeholder="User password"
                                onSubmitEditing={() => this.onSubmit()}
                                ref={this.passwordRef}
                                withRef
                                blurOnSubmit
                                secureTextEntry
                            />
                            <TouchableOpacity
                                onPress={() => this.onSubmit()}
                                style={{
                                    width: 220,
                                    alignSelf: 'center',
                                }}
                            >
                                <Text style={s.loginbutton}>LOGIN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Navigation.setStackRoot('root', { component: { name: 'td.SIgnUp' } })}
                                style={{
                                    width: 220,
                                    alignSelf: 'center',
                                }}
                            >
                                <Text style={s.loginbutton}>GO TO SIGN UP</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

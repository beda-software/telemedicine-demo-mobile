import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Field, reduxForm } from 'redux-form';
import styles from 'styles/Styles';
import TextInput from 'components/TextInput';

class LoginForm extends React.PureComponent {
    constructor(props) {
        super(props);
        this.passwordRef = React.createRef();
    }

    render() {
        return (
            <View>
                <View style={styles.loginform}>
                    <Field
                        name="username"
                        component={TextInput}
                        underlineColorAndroid="transparent"
                        style={styles.forminput}
                        placeholder="Username"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onSubmitEditing={() => this.passwordRef.current.getRenderedComponent().focus()}
                        blurOnSubmit
                        autoFocus
                    />
                    <Field
                        name="password"
                        component={TextInput}
                        underlineColorAndroid="transparent"
                        style={styles.forminput}
                        placeholder="User password"
                        onSubmitEditing={this.props.handleSubmit}
                        ref={this.passwordRef}
                        withRef
                        blurOnSubmit
                        secureTextEntry
                    />
                    <TouchableOpacity
                        onPress={this.props.handleSubmit}
                        style={{
                            width: 220,
                            alignSelf: 'center',
                        }}
                    >
                        <Text style={styles.loginbutton}>
                            LOGIN
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.props.goToSignUp}
                        style={{
                            width: 220,
                            alignSelf: 'center',
                        }}
                    >
                        <Text style={styles.loginbutton}>
                            GO TO SIGN UP
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default reduxForm({
    form: 'login',
})(LoginForm);

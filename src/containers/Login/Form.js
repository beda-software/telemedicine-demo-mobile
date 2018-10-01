import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Field, reduxForm } from 'redux-form';
import styles from '../../styles/Styles';
import TextInput from '../../components/TextInput';

const LoginForm = props => {
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
                    // onSubmitEditing={() => this.focusNextField('password')}
                    blurOnSubmit
                    autoFocus
                />
                <Field
                    name="password"
                    component={TextInput}
                    underlineColorAndroid="transparent"
                    style={styles.forminput}
                    placeholder="User password"
                    onSubmitEditing={props.handleSubmit}
                    blurOnSubmit
                    secureTextEntry
                />
                <TouchableOpacity
                    onPress={props.handleSubmit}
                    style={{
                        width: 220,
                        alignSelf: 'center'
                    }}
                >
                    <Text style={styles.loginbutton}>
                        LOGIN
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default reduxForm({
    form: 'login',
})(LoginForm);

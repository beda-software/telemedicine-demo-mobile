import React from 'react';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import {
    View,
    Platform,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';

import styles from 'styles/Styles';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import Logo from 'components/Logo';
import Modal from 'components/Modal';
import Preloader from 'components/Preloader';
import { login } from './actions';
import Form from './Form';

class Login extends React.PureComponent {
    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar
                    barStyle={Platform.OS === 'ios' ? COLOR_SCHEME.DARK : COLOR_SCHEME.LIGHT}
                    backgroundColor={COLOR.PRIMARY_DARK}
                />
                <KeyboardAwareView>
                    <View style={[styles.container]}>
                        <Logo />
                        <Form
                            onSubmit={this.props.login}
                            goToSignUp={this.props.goToSignUp}
                        />
                        <Modal />
                        <Preloader />
                    </View>
                </KeyboardAwareView>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
    login,
    goToSignUp: () => NavigationActions.navigate({ routeName: 'SignUp' }),
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

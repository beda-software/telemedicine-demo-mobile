import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
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
import Preloader from 'containers/Preloader';
import GlobalModal from 'containers/Modal';
import { login } from './actions';
import Form from './Form';
import validate from './validator';

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
                        <GlobalModal />
                        <Preloader />
                    </View>
                </KeyboardAwareView>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    login: compose(login, validate),
    goToSignUp: () => NavigationActions.navigate({ routeName: 'SignUp' }),
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

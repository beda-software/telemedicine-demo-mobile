import React from 'react';
import { connect } from 'react-redux';

import {
    View,
    Platform,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';
import { NavigationActions } from 'react-navigation';

import styles from 'styles/Styles';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import Logo from 'components/Logo';
import Modal from 'components/Modal';
import { signUp } from './actions';
import Form from './Form';

class SignUp extends React.PureComponent {
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
                            onSubmit={this.props.signUp}
                            goToLogin={this.props.goToLogin}
                        />
                        <Modal />
                    </View>
                </KeyboardAwareView>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
    signUp: (values) => dispatch(signUp(values)),
    goToLogin: () => dispatch(NavigationActions.navigate({ routeName: 'Login' })),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);

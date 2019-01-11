import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Platform, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from 'styles/Styles';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import Logo from 'components/Logo';
import Preloader from 'containers/Preloader';
import GlobalModal from 'containers/Modal';
import { signUp } from './actions';
import Form from './Form';
import validate from './validator';

class SignUp extends React.PureComponent {
    static options() {
        return {
            topBar: {
                visible: false,
            },
        };
    }

    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar
                    barStyle={Platform.OS === 'ios' ? COLOR_SCHEME.DARK : COLOR_SCHEME.LIGHT}
                    backgroundColor={COLOR.PRIMARY_DARK}
                />
                <ScrollView contentContainerStyle={[styles.container]}>
                    <Logo />
                    <Form
                        onSubmit={this.props.signUp}
                        goToLogin={() =>
                            Navigation.setStackRoot('root', {
                                component: {
                                    name: 'td.Login',
                                },
                            })
                        }
                    />
                    <GlobalModal />
                    <Preloader />
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    signUp: compose(
        signUp,
        validate
    ),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SignUp);

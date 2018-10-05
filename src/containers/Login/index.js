import React from 'react';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import {
    Text,
    View,
    Platform,
    Modal,
    TouchableHighlight,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';

import styles from 'styles/Styles';
import COLOR_SCHEME from 'styles/ColorScheme';
import COLOR from 'styles/Color';
import Logo from 'components/Logo';
import Form from './Form';
import { login } from './actions';

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
                        <Modal
                            animationType="fade"
                            transparent
                            visible={false}
                            // visible={this.state.isModalOpen}
                            onRequestClose={() => {
                            }}
                        >
                            <TouchableHighlight
                                onPress={() => this.setState({ isModalOpen: false })}
                                style={styles.container}
                            >
                                <View style={[styles.container, styles.modalBackground]}>
                                    <View
                                        style={[styles.innerContainer, styles.innerContainerTransparent]}
                                    >
                                        <Text>
                                            {/*{this.state.modalText}*/}

                                        </Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </Modal>
                    </View>
                </KeyboardAwareView>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => ({
    login: (values) => dispatch(login(values)),
    goToSignUp: () => dispatch(NavigationActions.navigate({ routeName: 'SignUp' })),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

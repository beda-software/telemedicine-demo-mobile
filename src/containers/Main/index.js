import React from 'react';
import { Navigation } from 'react-native-navigation';
import { SafeAreaView, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { logout } from 'containers/App/actions';
import { makeOutgoingCall } from 'containers/Call/actions';
import COLOR from 'styles/Color';
import COLOR_SCHEME from 'styles/ColorScheme';
import styles from 'styles/Styles';
import GlobalModal from 'containers/Modal';
import Form from './Form';
import { fetchContacts } from './actions';
import { selectContactList } from './selectors';

class App extends React.Component {
    static options() {
        return {
            topBar: {
                title: {
                    text: 'Telemedicine Demo',
                },
                leftButtons: [],
                rightButtons: [
                    {
                        id: 'logout',
                        text: 'Logout',
                    },
                ],
            },
        };
    }

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
    }

    componentDidMount() {
        this.props.fetchContacts();
    }

    navigationButtonPressed({ buttonId }) {
        if (buttonId === 'logout') {
            this.props.logout();
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar barStyle={COLOR_SCHEME.LIGHT} backgroundColor={COLOR.PRIMARY_DARK} />

                <Form makeOutgoingCall={this.props.makeOutgoingCall} contactList={this.props.contactList || []} />
                <GlobalModal />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    contactList: selectContactList,
});

const mapDispatchToProps = {
    fetchContacts,
    makeOutgoingCall,
    logout,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

import React from 'react';
import {
    ActivityIndicator,
    StatusBar,
    View,
} from 'react-native';
import styles from 'styles/Styles';

import GlobalModal from 'containers/Modal';

class Bootstrap extends React.Component {
    render() {
        return (
            <View style={styles.modal}>
                <View style={[styles.container]}>
                    <View
                        style={[styles.innerContainer]}
                    >
                        <ActivityIndicator size="large" />
                        <StatusBar barStyle="default" />
                        <GlobalModal />
                    </View>
                </View>
            </View>
        );
    }
}

export default Bootstrap;

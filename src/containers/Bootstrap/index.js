import React from 'react';
import {
    ActivityIndicator,
    StatusBar,
    View,
} from 'react-native';
import styles from 'styles/Styles';

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
                    </View>
                </View>
            </View>
        );
    }
}

export default Bootstrap;

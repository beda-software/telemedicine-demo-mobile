import React from 'react';
import styles from 'styles/Styles';
import {
    View,
    ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { selectIsPreloaderVisible } from './selectors';

function Preloader(props) {
    if (props.isVisible) {
        return (
            <View style={styles.modal}>
                <View style={[styles.container]}>
                    <View
                        style={[styles.innerContainer]}
                    >
                        <ActivityIndicator size="large" />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View />
    );
}

const mapStateToProps = createStructuredSelector({
    isVisible: selectIsPreloaderVisible,
});

export default connect(mapStateToProps)(Preloader);

import React from 'react';
import styles from 'styles/Styles';
import {
    View,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { selectIsPreloaderVisible } from 'containers/App/selectors';

function Preloader(props) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.isPreloaderVisible}
            onRequestClose={() => {}}
        >
            <View style={[styles.container, styles.preloaderBackground]}>
                <View
                    style={[styles.innerContainer]}
                >
                    <ActivityIndicator size='large' />
                </View>
            </View>
        </Modal>
    );
}

const mapStateToProps = createStructuredSelector({
    isPreloaderVisible: selectIsPreloaderVisible,
});

export default connect(mapStateToProps)(Preloader);

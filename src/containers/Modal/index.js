import React from 'react';
import styles from 'styles/Styles';
import {
    Text,
    View,
    Modal,
    TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { selectIsModalVisible, selectModalText } from './selectors';
import { hideModal } from './actions';

function GlobalModal(props) {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={props.isVisible}
            onRequestClose={() => {
            }}
        >
            <TouchableHighlight
                onPress={props.hideModal}
                style={styles.container}
            >
                <View style={[styles.container, styles.modalBackground]}>
                    <View
                        style={[styles.innerContainer, styles.innerContainerTransparent]}
                    >
                        <Text>
                            {props.text}
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
        </Modal>
    );
}

const mapStateToProps = createStructuredSelector({
    isVisible: selectIsModalVisible,
    text: selectModalText,
});

const mapDispatchToProps = (dispatch) => ({
    hideModal: () => dispatch(hideModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GlobalModal);

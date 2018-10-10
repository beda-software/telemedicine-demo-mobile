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

import { selectIsModalVisible, selectModalText } from 'containers/App/selectors';
import { hideModal } from 'containers/App/actions';

// TODO: think about moving to containers
// TODO: it is a not dumb component!
function MyModal(props) {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={props.isModalVisible}
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
                            {props.modalText}
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
        </Modal>
    );
}

const mapStateToProps = createStructuredSelector({
    isModalVisible: selectIsModalVisible,
    modalText: selectModalText,
});

const mapDispatchToProps = (dispatch) => ({
    hideModal: () => dispatch(hideModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MyModal);

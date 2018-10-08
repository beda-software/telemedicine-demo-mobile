import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import Modal from 'components/Modal';
import CallButton from 'components/CallButton';
import styles from 'styles/Styles';
import COLOR from 'styles/Color';
import { answerCall, answerVideoCall, declineCall } from './actions';

class IncomingCall extends React.Component {
    render() {
        return (
            <SafeAreaView style={[styles.safearea, styles.aligncenter]}>
                <Text style={styles.incoming_call}>
                    Incoming call from:
                </Text>
                <Text style={styles.incoming_call}>
                    {this.state.displayName}
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        height: 90,
                    }}
                >
                    <CallButton
                        icon_name="call"
                        color={COLOR.ACCENT}
                        buttonPressed={() => this.props.answerCall()}
                    />
                    <CallButton
                        icon_name="videocam"
                        color={COLOR.ACCENT}
                        buttonPressed={() => this.props.answerVideoCall()}
                    />
                    <CallButton
                        icon_name="call-end"
                        color={COLOR.RED}
                        buttonPressed={() => this.props.declineCall()}
                    />
                </View>
                <Modal />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({});

const mapDispatchToProps = (dispatch) => ({
    answerCall: () => dispatch(answerCall()),
    answerVideoCall: () => dispatch(answerVideoCall()),
    declineCall: () => dispatch(declineCall()),
});

export default connect(mapStateToProps, mapDispatchToProps)(IncomingCall);

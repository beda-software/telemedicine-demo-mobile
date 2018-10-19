import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import CallButton from 'components/CallButton';
import styles from 'styles/Styles';
import COLOR from 'styles/Color';
import GlobalModal from 'containers/Modal';
import {
    answerCall,
    endCall,
} from 'containers/Call/actions';
import { selectCallerDisplayName } from './selectors';

class IncomingCall extends React.Component {
    render() {
        return (
            <SafeAreaView style={[styles.safearea, styles.aligncenter]}>
                <Text style={styles.incoming_call}>
                    Incoming call from:
                </Text>
                <Text style={styles.incoming_call}>
                    {this.props.callerDisplayName}
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
                        buttonPressed={() => this.props.answerCall(false)}
                    />
                    <CallButton
                        icon_name="videocam"
                        color={COLOR.ACCENT}
                        buttonPressed={() => this.props.answerCall(true)}
                    />
                    <CallButton
                        icon_name="call-end"
                        color={COLOR.RED}
                        buttonPressed={() => this.props.endCall()}
                    />
                </View>
                <GlobalModal />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    callerDisplayName: selectCallerDisplayName,
});

const mapDispatchToProps = {
    answerCall,
    endCall,
};

export default connect(mapStateToProps, mapDispatchToProps)(IncomingCall);

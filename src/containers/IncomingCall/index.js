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
import { selectActiveCall } from 'containers/App/selectors';
import {
    subscribeToIncomingCallEvents,
    unsubscribeFromIncomingCallEvents,
    answerCall,
    answerVideoCall,
    declineCall,
} from './actions';
import { selectCallerDisplayName } from './selectors';

class IncomingCall extends React.Component {
    componentDidMount() {
        this.props.subscribeToIncomingCallEvents(this.props.activeCall);
    }

    componentWillUnmount() {
        this.props.unsubscribeFromIncomingCallEvents();
    }

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
                        buttonPressed={() => this.props.answerCall(this.props.activeCall)}
                    />
                    <CallButton
                        icon_name="videocam"
                        color={COLOR.ACCENT}
                        buttonPressed={() => this.props.answerVideoCall(this.props.activeCall)}
                    />
                    <CallButton
                        icon_name="call-end"
                        color={COLOR.RED}
                        buttonPressed={() => this.props.declineCall(this.props.activeCall)}
                    />
                </View>
                <GlobalModal />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    activeCall: selectActiveCall,
    callerDisplayName: selectCallerDisplayName,
});

const mapDispatchToProps = {
    subscribeToIncomingCallEvents,
    unsubscribeFromIncomingCallEvents,
    answerCall,
    answerVideoCall,
    declineCall,
};

export default connect(mapStateToProps, mapDispatchToProps)(IncomingCall);

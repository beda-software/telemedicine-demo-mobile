import React from 'react';
import { connect } from 'react-redux';

import { Text, TouchableOpacity } from 'react-native';

import { incrementCounter } from './actions';

class Login extends React.PureComponent {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onIncrementButtonPressed} style={{ width: 220, alignSelf: 'center' }}>
        <Text>
          CLICKS COUNT: {this.props.login.count}
        </Text>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => {
  const { login } = state;
  return { login };
};

const mapDispatchToProps = (dispatch) => ({
  onIncrementButtonPressed: evt => dispatch(incrementCounter())
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);

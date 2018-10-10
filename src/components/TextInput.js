import React from 'react';
import { TextInput, Text, View } from 'react-native';

import styles from 'styles/Styles';

export default class MyTextInput extends React.PureComponent {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

    focus() {
        this.inputRef.current.focus();
    }

    render() {
        const { input, meta, ...inputProps } = this.props;
        const { touched, error } = meta;

        return (
            <View>
                <TextInput
                    {...inputProps}
                    onChangeText={input.onChange}
                    onBlur={input.onBlur}
                    onFocus={input.onFocus}
                    value={input.value}
                    ref={this.inputRef}
                />
                { touched && error &&
                    <Text style={styles.forminputError}>
                        {error}
                    </Text>
                }
            </View>
        );
    }
}

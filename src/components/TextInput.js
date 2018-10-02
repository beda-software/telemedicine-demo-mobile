import React from 'react';
import { TextInput, View } from 'react-native';

export default class MyTextInput extends React.PureComponent {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

    focus() {
        this.inputRef.current.focus();
    }

    render() {
        const { input, ...inputProps } = this.props;

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
            </View>
        );
    }
}

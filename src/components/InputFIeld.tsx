import * as React from 'react';
import { FieldRenderProps } from 'react-final-form';
import { Text, TextInput, View } from 'react-native';

interface InputFieldProps extends FieldRenderProps {
    [x: string]: any;
}

export const InputField = React.forwardRef((props: InputFieldProps, ref: React.Ref<TextInput>) => {
    const { input, meta, ...inputProps } = props;
    const { touched, error } = meta;

    return (
        <View>
            <TextInput
                {...inputProps}
                onChangeText={(value) => input.onChange(value)}
                onBlur={() => input.onBlur()}
                onFocus={() => input.onFocus()}
                value={input.value}
                ref={ref}
            />
            {touched && error && <Text style={props.errorStyle}>{error}</Text>}
        </View>
    );
});

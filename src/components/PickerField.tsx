import * as React from 'react';
import { FieldRenderProps } from 'react-final-form';
import { Text, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface PickerFieldOption {
    label: string;
    value: string;
}

interface PickerFieldProps extends FieldRenderProps {
    options: PickerFieldOption[];
    [x: string]: any;
}

export const PickerField = React.forwardRef((props: PickerFieldProps, ref: React.Ref<RNPickerSelect>) => {
    const { input, meta, options, ...inputProps } = props;
    const { touched, error } = meta;

    return (
        <View>
            <RNPickerSelect
                {...inputProps}
                onValueChange={(value) => input.onChange(value)}
                value={input.value}
                ref={ref}
                items={options}
            />
            {touched && error && <Text style={props.errorStyle}>{error}</Text>}
        </View>
    );
});

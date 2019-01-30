import * as React from 'react';
import { FieldRenderProps } from 'react-final-form';
import { Picker, Text, View } from 'react-native';

interface PickerFieldOption {
    label: string;
    value: string;
}

interface PickerFieldProps extends FieldRenderProps {
    options: PickerFieldOption[];
    [x: string]: any;
}

export const PickerField = React.forwardRef((props: PickerFieldProps, ref: React.Ref<Picker>) => {
    const { input, meta, options, ...inputProps } = props;
    const { touched, error } = meta;

    return (
        <View>
            <Picker
                {...inputProps}
                onValueChange={(value) => input.onChange(value)}
                selectedValue={input.value}
                ref={ref}
            >
                {options.map(({ label, value }) => (
                    <Picker.Item label={label} value={value} />
                ))}
            </Picker>
            {touched && error && <Text style={props.errorStyle}>{error}</Text>}
        </View>
    );
});

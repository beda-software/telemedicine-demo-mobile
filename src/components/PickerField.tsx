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
    style: object;
    errorStyle: object;
    [x: string]: any;
}

export const PickerField = React.forwardRef((props: PickerFieldProps, ref: React.Ref<RNPickerSelect>) => {
    const { input, meta, options, errorStyle, style, ...inputProps } = props;
    const { touched, error } = meta;

    return (
        <View>
            <RNPickerSelect
                {...inputProps}
                style={style}
                onValueChange={(value) => input.onChange(value)}
                value={input.value}
                ref={ref}
                items={options}
                useNativeAndroidPickerStyle={false}
            />
            {touched && error && <Text style={errorStyle}>{error}</Text>}
        </View>
    );
});

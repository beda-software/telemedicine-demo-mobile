import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import s from './style';

interface ComponentProps {
    buttonPressed: () => void;
    color: string;
    iconName: string;
    disabled?: boolean;
}

export class CallButton extends React.Component<ComponentProps> {
    public render() {
        const { buttonPressed, disabled, iconName, color } = this.props;

        return (
            <TouchableOpacity onPress={() => buttonPressed()} disabled={disabled}>
                <View style={[s.icon, { borderColor: color }]}>
                    <Icon name={iconName} color={color} size={20} backgroundColor="transparent" />
                </View>
            </TouchableOpacity>
        );
    }
}

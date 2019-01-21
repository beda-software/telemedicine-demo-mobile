import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import s from './style';

interface KeypadButtonProps {
    onPressIn?: (event: any) => void;
    onPressOut?: (event: any) => void;
    onLongPress?: (event: any) => void;
    onPress: (value: string) => void;
    style: object;
    txt1: string;
    txt2?: string;
}

export class KeypadButton extends React.Component<KeypadButtonProps> {
    public render() {
        const touchableProps = {
            onPress: () => this.props.onPress(this.props.txt1),
            onPressIn: this.props.onPressIn,
            onPressOut: this.props.onPressOut,
            onLongPress: this.props.onLongPress,
        };

        return (
            <TouchableOpacity {...touchableProps}>
                <View style={[this.props.style, { flexDirection: 'column' }]}>
                    <Text style={[s.digits, { alignSelf: 'center' }]}>{this.props.txt1}</Text>
                    {this.props.txt2 ? (
                        <Text style={[s.letters, { alignSelf: 'center' }]}>{this.props.txt2}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    }
}

interface KeypadProps {
    keyPressed: (value: string) => void;
    style?: object;
}

export class Keypad extends React.Component<KeypadProps> {
    public handleKeypadPressed(value: string) {
        this.props.keyPressed(value);
    }

    public render() {
        return (
            <View style={[s.keypad, this.props.style]}>
                <View style={s.keypadRow}>
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="1"
                        txt2=""
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="2"
                        txt2="A B C"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="3"
                        txt2="D E F"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                </View>
                <View style={s.keypadRow}>
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="4"
                        txt2="G H I"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="5"
                        txt2="J K L"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="6"
                        txt2="M N O"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                </View>
                <View style={s.keypadRow}>
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="7"
                        txt2="P Q R S"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="8"
                        txt2="T U V"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="9"
                        txt2="W X Y Z"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                </View>
                <View style={s.keypadRow}>
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="*"
                        txt2=""
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="0"
                        txt2="+"
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                    <KeypadButton
                        style={s.keypadButton}
                        txt1="#"
                        txt2=""
                        onPress={(value: string) => this.handleKeypadPressed(value)}
                    />
                </View>
            </View>
        );
    }
}

import * as React from 'react';
import { TextInput } from 'react-native';
import { Cursor } from 'src/contrib/typed-baobab';
import { schema } from 'src/libs/state';

export interface InputProps {
    cursor: Cursor<string>;
    placeholder?: string;
    [x: string]: any;
}

@schema<InputProps>({})
export class Input extends React.Component<InputProps, {}> {
    private ref = React.createRef<TextInput>();

    public focus() {
        const node = this.ref.current;

        if (node) {
            node.focus();
        }
    }

    public render() {
        return (
            <TextInput
                {...this.props}
                ref={this.ref}
                placeholder={this.props.placeholder}
                value={this.props.cursor.get()}
                onChangeText={(value) => this.props.cursor.set(value)}
            />
        );
    }
}

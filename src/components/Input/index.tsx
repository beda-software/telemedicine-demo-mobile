import * as React from 'react';
import { Cursor } from '../../contrib/typed-baobab';
import { schema } from '../../libs/state';

interface InputProps {
    cursor: Cursor<string>;
    type?: string;
    placeholder?: string;
    className?: string;
}

class Input extends React.Component<InputProps, {}> {
    public render() {
        return (
            <input
                className={this.props.className}
                type={this.props.type}
                placeholder={this.props.placeholder}
                value={this.props.cursor.get()}
                onChange={(e) => this.props.cursor.set(e.target.value)}
            />
        );
    }
}

export default schema<InputProps>({})(Input);

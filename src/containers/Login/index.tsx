import * as React from 'react';
import { View, Text } from 'react-native';
import { Token } from 'src/contrib/aidbox';
import { RemoteData, notAsked } from 'src/libs/schema';
import { schema } from 'src/libs/state';
import { Cursor } from 'src/contrib/typed-baobab';

export interface Model {
    form: {
        username: string;
        password: string;
    };
    response: RemoteData<Token>;
}

export const initial: Model = {
    form: {
        username: '',
        password: '',
    },
    response: notAsked,
};

export interface ComponentProps {
    tree: Cursor<Model>;
    tokenResponseCursor: Cursor<RemoteData<Token>>;
}

@schema({ tree: {} })
export class Component extends React.Component<ComponentProps, {}> {
    // constructor(props: LoginProps) {
    //     super(props);
    //
    //     this.onSubmit = this.onSubmit.bind(this);
    //     this.props.tree.response.set(notAsked);
    // }
    //
    // public async onSubmit() {
    //     const form = this.props.tree.form.get();
    //
    //     const response = await login(this.props.tree.response, form);
    //     if (isSuccess(response)) {
    //         await setToken(this.props.tokenResponseCursor, response.data);
    //         this.props.history.push('/app');
    //     }
    // }
    //
    // public renderSubmit() {
    //     return <input className={s.submit} onClick={this.onSubmit} type="submit" value="Sign in" />;
    // }
    //
    // public renderResponse() {
    //     const response = this.props.tree.response.get();
    //
    //     if (isNotAsked(response)) {
    //         return this.renderSubmit();
    //     }
    //
    //     if (isLoading(response)) {
    //         return <p>Loading ...</p>;
    //     }
    //
    //     if (isSuccess(response)) {
    //         return <p>{response.data.access_token}</p>;
    //     }
    //
    //     if (isFailure(response)) {
    //         return (
    //             <div>
    //                 <p>{JSON.stringify(response.error)}</p>
    //                 {this.renderSubmit()}
    //             </div>
    //         );
    //     }
    //
    //     return null;
    // }

    public render() {
        // const formCursor = this.props.tree.form;

        return (
            <View>
                <Text>LOGIN {JSON.stringify(this.props.tree.get())}</Text>
            </View>
        );
    }
}

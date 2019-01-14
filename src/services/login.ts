// @ts-ignore
import { Voximplant } from 'react-native-voximplant';
import { Token } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, RemoteDataResult, success } from 'src/libs/schema';
import { service, request, appDomain } from './base';
import { VoxImplantTokens } from 'src/contrib/vox-implant';

interface LoginBody {
    username: string;
    password: string;
}

export function login(cursor: Cursor<RemoteData<Token>>, body: LoginBody) {
    return service(cursor, {
        path: '/td/signin/',
        method: 'POST',
        body,
        hydrate: ({ username, password }) => JSON.stringify({ username, password }),
    });
}

async function requestOneTimeLoginKey(fullUsername: string) {
    const client = Voximplant.getInstance();

    try {
        await client.requestOneTimeLoginKey(fullUsername);
    } catch (err) {
        if (err.name === Voximplant.ClientEvents.AuthResult && err.code === 302) {
            return err.key;
        }
        throw err;
    }
}

interface VoxImplantLoginBody {
    username: string;
}

export async function voxImplantLogin(
    cursor: Cursor<RemoteData<VoxImplantTokens>>,
    body: VoxImplantLoginBody,
    token: Token
): Promise<RemoteDataResult<VoxImplantTokens>> {
    cursor.set(loading);

    const { username } = body;
    const fullUsername = `${username}@${appDomain}`;

    const client = Voximplant.getInstance();

    try {
        // Connection to the Voximplant Cloud is stayed alive on reloading of the app's
        // JavaScript code. Calling "disconnect" API here makes the SDK and app states
        // synchronized.
        try {
            await client.disconnect();
        } catch (err) {}
        await client.connect();

        const oneTimeKey = await requestOneTimeLoginKey(fullUsername);
        const { hash } = await request({
            method: 'POST',
            path: '/td/voximplant-hash/',
            body: { oneTimeKey },
            headers: { Authorization: `Bearer ${token.access_token}` },
        });

        const { tokens } = await client.loginWithOneTimeKey(fullUsername, hash);

        const result = success(tokens);
        cursor.set(result);

        return result;
    } catch (err) {
        // switch (err.name) {
        //     case Voximplant.ClientEvents.ConnectionFailed: {
        //         console.log({ message: 'Connection failed. Please try again.' });
        //         break;
        //     }
        //     default:
        //         console.log({ message: `Something went wrong. Code: ${err.code}` });
        // }
        const result = failure(err);
        cursor.set(result);

        return result;
    }
}

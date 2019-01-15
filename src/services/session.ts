import { AsyncStorage } from 'react-native';
import { Token } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { VoxImplantTokens } from 'src/contrib/vox-implant';
import { failure, loading, notAsked, RemoteData, success } from 'src/libs/schema';

export interface Session {
    token: Token;
    voxImplantTokens: VoxImplantTokens;
    username: string;
}

export async function getSession(cursor: Cursor<RemoteData<Session>>): Promise<RemoteData<Session>> {
    cursor.set(loading);

    const session = await AsyncStorage.getItem('session');

    if (session) {
        const result = success(JSON.parse(session));
        cursor.set(result);

        return result;
    } else {
        const result = failure({});
        cursor.set(result);

        return result;
    }
}

export async function saveSession(cursor: Cursor<RemoteData<Session>>, session: Session): Promise<RemoteData<Session>> {
    cursor.set(loading);

    try {
        await AsyncStorage.setItem('session', JSON.stringify(session));

        const result = success(session);
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);
        cursor.set(result);

        return result;
    }
}

export async function clearSession(cursor: Cursor<RemoteData<Session>>) {
    cursor.set(loading);

    try {
        await AsyncStorage.removeItem('session');
        cursor.set(notAsked);

        return notAsked;
    } catch (err) {
        const result = failure(err);
        cursor.set(result);

        return result;
    }
}

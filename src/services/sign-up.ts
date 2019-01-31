import { User } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { service } from './base';

interface SignUpBody {
    username: string;
    displayName: string;
    password: string;
}

export function signUp(cursor: Cursor<RemoteData<User>>, body: SignUpBody) {
    return service(cursor, {
        path: '/td/signup/',
        method: 'POST',
        body,
        hydrate: ({ username, displayName, password }) => JSON.stringify({ username, displayName, password }),
    });
}

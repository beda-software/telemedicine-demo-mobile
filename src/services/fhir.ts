import { AidboxReference, AidboxResource, Bundle, Token } from 'src/contrib/aidbox';
import { Cursor } from 'src/contrib/typed-baobab';
import { RemoteData } from 'src/libs/schema';
import { service } from './base';

export function getFHIRResource<R extends AidboxReference>(cursor: Cursor<RemoteData<R>>, reference: R, token: Token) {
    return service(cursor, {
        method: 'GET',
        path: `/${reference.resourceType}/${reference.id}`,
        headers: { Authorization: `Bearer ${token.access_token}` },
    });
}

export function getFHIRResources<R>(
    cursor: Cursor<RemoteData<Bundle<R>>>,
    resourceType: string,
    params: object,
    token: Token
) {
    return service(cursor, {
        method: 'GET',
        path: `/${resourceType}`,
        params,
        headers: { Authorization: `Bearer ${token.access_token}` },
    });
}

export function saveFHIRResource<R extends AidboxResource>(cursor: Cursor<RemoteData<R>>, resource: R, token: Token) {
    return service(cursor, {
        method: resource.id ? 'PUT' : 'POST',
        body: resource,
        path: `/${resource.resourceType}${resource.id ? '/' + resource.id : ''}`,
        headers: { Authorization: `Bearer ${token.access_token}` },
    });
}

export function deleteFHIRResource<R extends AidboxReference>(
    cursor: Cursor<RemoteData<R>>,
    resource: R,
    token: Token
) {
    return service(cursor, {
        method: 'DELETE',
        path: `/${resource.resourceType}${resource.id}`,
        headers: { Authorization: `Bearer ${token.access_token}` },
    });
}

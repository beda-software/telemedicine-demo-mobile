import { AidboxReference, AidboxResource, Token, Bundle } from 'src/contrib/aidbox';
import { service } from './base';
import { RemoteData } from 'src/libs/schema';
import { Cursor } from 'src/contrib/typed-baobab';

export function getFHIRResource<R>(cursor: Cursor<RemoteData<R>>, reference: AidboxReference, token: Token) {
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

export function saveFHIRResource<R>(cursor: Cursor<RemoteData<R>>, resource: AidboxResource, token: Token) {
    return service(cursor, {
        method: resource.id ? 'PUT' : 'POST',
        body: resource,
        path: `/${resource.resourceType}${resource.id ? '/' + resource.id : ''}`,
        headers: { Authorization: `Bearer ${token.access_token}` },
    });
}

export function deleteFHIRResource<R>(cursor: Cursor<RemoteData<R>>, resource: AidboxReference, token: Token) {
    return service(cursor, {
        method: 'DELETE',
        path: `/${resource.resourceType}${resource.id}`,
        headers: { Authorization: `Bearer ${token.access_token}` },
    });
}

import * as _ from 'lodash';
import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, RemoteDataResult, success } from 'src/libs/schema';
import { baseUrl } from './constants';

interface ServiceConfig {
    method: string;
    path: string;
    hydrate?: (x: any) => any;
    dehydrate?: (x: any) => any;
    headers?: object;
    params?: object;
    body?: any;
}

function buildQueryParams(params: object) {
    return Object.keys(params)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}

export async function request<S = any>(config: ServiceConfig): Promise<S> {
    const { method, path, headers, params, body, hydrate = JSON.stringify, dehydrate = _.identity } = config;

    const resultingHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    const payload = {
        body: _.includes(['POST', 'PUT', 'PATCH'], method) ? hydrate(body) : undefined,
        method,
        headers: resultingHeaders,
    };

    const url = `${baseUrl}${path}?${params ? buildQueryParams(params) : ''}`;
    const response = await fetch(url, payload);

    if (response.status >= 200 && response.status < 300) {
        let dehydratedData = null;
        if (response.status !== 204) {
            const respData = await response.json();
            dehydratedData = dehydrate(respData);
        }

        return Promise.resolve(dehydratedData);
    } else {
        const errorData = await response.text();
        try {
            return Promise.reject(JSON.parse(errorData));
        } catch (err) {
            return Promise.reject(errorData);
        }
    }
}

// TODO: use utils/wrapService
export async function service<S = any, F = any>(
    cursor: Cursor<RemoteData<S, F>>,
    config: ServiceConfig
): Promise<RemoteDataResult<S, F>> {
    cursor.set(loading);

    try {
        const data = await request(config);

        const result = success(data);
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);
        cursor.set(result);

        return result;
    }
}

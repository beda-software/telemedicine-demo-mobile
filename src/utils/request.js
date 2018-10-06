import { Platform } from 'react-native';

// TODO: get from env
const baseUrl = Platform.OS === 'ios' ? 'http://192.168.1.3:7777' : 'http://10.0.2.2:7777';

function parseJSON(response) {
    if (response.status === 204 || response.status === 205) {
        return null;
    }
    return response.json();
}

function checkStatus(response) {
    if (response.status >= 200 && response.status <= 300) {
        return response;
    }
    const error = new Error(`Error in response: ${response.status}: ${response.statusText}`);
    error.response = response;
    throw error;
}


function request(path, options) {
    return fetch(`${baseUrl}${path}`, options)
        .then(checkStatus)
        .then(parseJSON);
}

function* makeRequest(method, path, body, token = null) {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        method,
    };
    if (method === 'POST') {
        options.body = JSON.stringify(body);
    }
    try {
        return yield request(path, options);
    } catch (err) {
        const data = yield err.response.json();
        const error = new Error();
        error.code = err.status;
        error.data = data;
        throw error;
    }
}

export function* makePost(path, body, token = null) {
    return yield* makeRequest('POST', path, body, token);
}

export function* makeGet(path, body, token = null) {
    return yield* makeRequest('GET', path, body, token);
}

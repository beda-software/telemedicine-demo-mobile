// // TODO: move into config
export const baseUrl = 'http://telemedicine-demo.beda.software';
export const appDomain = 'voice-chat.beda-software.voximplant.com';

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
        const error = new Error();
        error.code = err.status;
        if (err.response) {
            error.data = yield err.response.json();
        } else {
            error.data = { message: 'Something went wrong. Can not parse output' };
        }

        throw error;
    }
}

export function* makePost(path, body, token = null) {
    return yield* makeRequest('POST', path, body, token);
}

export function* makeGet(path, body, token = null) {
    return yield* makeRequest('GET', path, body, token);
}

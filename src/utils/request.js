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

function* makeRequest(method, url, body, token = null) {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        method: method,
    };
    try {
        return yield request(url, options);
    } catch (err) {
        const content = yield err.response.json();
        const error = new Error(content);
        error.code = err.status;
        throw error;
    }
}

export function* makePost(url, body, token = null) {
    return yield* makeRequest('POST', url, body, token);
}

export function* makeGet(url, body, token = null) {
    return yield* makeRequest('GET', url, body, token);
}

export default function request(url, options) {
    return fetch(url, options)
        .then(checkStatus)
        .then(parseJSON);
}

import makeValidator from 'utils/validator';

const schema = {
    properties: {
        username: {
            type: 'string',
            description: 'real user name',
            minLength: 3,
        },
        displayName: {
            type: 'string',
            description: 'nickname to diplay in contact list',
            minLength: 3,
        },
        password: {
            type: 'string',
            description: 'user password',
            minLength: 8,
        },
        passwordConfirm: {
            type: 'string',
            description: 'confirm user password',
            'const': {
                '$data': '1/password',
            },
        },
    },
    required: ['username', 'displayName', 'password', 'passwordConfirm'],
};

export default validator = makeValidator(schema);

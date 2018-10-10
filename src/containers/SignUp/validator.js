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
    },
    required: ['username', 'displayName', 'password'],
};

export default validator = makeValidator(schema);

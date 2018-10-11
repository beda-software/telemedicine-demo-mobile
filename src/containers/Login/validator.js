import makeValidator from 'utils/validator';

const schema = {
    properties: {
        username: {
            type: 'string',
            description: 'real user name',
            minLength: 3,
        },
        password: {
            type: 'string',
            description: 'user password',
            minLength: 8,
        },
    },
    required: ['username', 'password'],
};

export default validator = makeValidator(schema);

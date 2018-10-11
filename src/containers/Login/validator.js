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
            minLength: 1,
        },
    },
    required: ['username', 'password'],
};

export default makeValidator(schema);

import makeValidator from 'src/utils/validator';

const schema = {
    properties: {
        value: {
            type: 'string',
            pattern: '^\\d{1,3}(\\.\\d{1,2})?$',
            description: 'value',
            errorMessage: 'should be valid number',
            minLength: 1,
        },
    },
    required: ['code', 'value'],
};

export default makeValidator(schema);

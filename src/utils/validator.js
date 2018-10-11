import Ajv from 'ajv';
import { SubmissionError } from 'redux-form';

function extractPropertyNameToMessage(error) {
    let propertyName =
        error.params.missingProperty || error.dataPath.replace('.', '');
    return { [propertyName]: error.message };
}

export default function makeValidator(jsonSchema) {
    const ajvInstance = new Ajv({ 'allErrors': true, '$data': true });
    const validate = ajvInstance.compile(jsonSchema);
    return function (values) {
        if (!validate(values)) {
            const errors = validate.errors.reduce(
                (acc, error) => ({ ...acc, ...extractPropertyNameToMessage(error) }),
                {}
            );
            throw new SubmissionError(errors);
        }
        return values;
    }
}

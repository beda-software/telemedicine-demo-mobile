// @ts-ignore
import Ajv from 'ajv';

function extractPropertyNameToMessage(error: Ajv.ErrorObject) {
    const propertyName = error.params.missingProperty || error.dataPath.replace('.', '');

    return { [propertyName]: error.message };
}

export default function makeValidator(jsonSchema: any) {
    const ajvInstance = new Ajv({ allErrors: true, $data: true });
    const validate = ajvInstance.compile(jsonSchema);

    return (values: any) => {
        if (!validate(values) && validate.errors) {
            return validate.errors.reduce(
                (acc: object, error: Ajv.ErrorObject) => ({ ...acc, ...extractPropertyNameToMessage(error) }),
                {}
            );
        }

        return {};
    };
}

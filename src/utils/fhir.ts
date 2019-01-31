import * as R from 'ramda';

import { Observation } from 'src/contrib/aidbox';

export function getUnitByCode(code: string) {
    switch (code) {
        case '8310-5': {
            return 'degC';
        }
        case '3141-9': {
            return 'kg';
        }
        case '8302-2': {
            return 'cm';
        }
        default: {
            return undefined;
        }
    }
}

export function getNameByCode(code: string) {
    switch (code) {
        case '8310-5': {
            return 'Temperature';
        }
        case '3141-9': {
            return 'Body weight';
        }
        case '8302-2': {
            return 'Body height';
        }
        default: {
            return undefined;
        }
    }
}

export function getValue(observation: Observation) {
    return `${R.path(['value', 'Quantity', 'value'], observation)} ${R.path(
        ['value', 'Quantity', 'code'],
        observation
    )}`;
}

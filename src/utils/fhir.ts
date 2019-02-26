import * as _ from 'lodash';

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
    return `${_.get(observation, ['value', 'Quantity', 'value'])} ${_.get(observation, ['value', 'Quantity', 'code'])}`;
}

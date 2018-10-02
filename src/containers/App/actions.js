import { NAVIGATE } from './constants';

export function navigate(routeName) {
    return {
        type: NAVIGATE,
        routeName,
    };
}

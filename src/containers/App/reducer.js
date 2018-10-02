import NavigationService from '../../routes/NavigationService';

import { NAVIGATE } from './constants';

export default function appReducer(state = {}, action) {
    switch (action.type) {
    case NAVIGATE:
        NavigationService.navigate(action.routeName);
        return state;
    default:
        return state;
    }
}

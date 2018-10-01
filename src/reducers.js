import { combineReducers } from 'redux';

import loginReducer from './containers/Login/reducer';

export default function createReducer(injectedReducers) {
  return combineReducers({
    login: loginReducer,
    ...injectedReducers
  });
}

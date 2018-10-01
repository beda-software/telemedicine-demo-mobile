import { combineReducers } from 'redux';

import { INCREMENT_COUNTER } from './constants';

const initialState = {
  count: 0
};

export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return Object.assign({}, state, {
        count: state.count + 1
      });
    default:
      return state
  }
}

import { INCREMENT_COUNTER } from './constants'

export function incrementCounter() {
  return {
    type: INCREMENT_COUNTER,
  };
}

import { createStore, applyMiddleware, compose } from 'redux';
import createReducer from './reducers';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
  const store = createStore(
    createReducer(),
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  store.runSaga = sagaMiddleware.run;
 
  return store;
}

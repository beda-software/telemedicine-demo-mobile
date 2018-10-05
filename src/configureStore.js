import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import { navigationMiddleware } from './navigators';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
    const store = createStore(
        createReducer(),
        initialState,
        applyMiddleware(sagaMiddleware, navigationMiddleware),
    );

    store.runSaga = sagaMiddleware.run;
    return store;
}

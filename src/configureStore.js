import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import rootSaga from './sagas';
import { navigationMiddleware } from './navigators';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(sagaMiddleware, navigationMiddleware),
    );

    sagaMiddleware.run(rootSaga);

    return store;
}

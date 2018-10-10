import React from 'react';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import rootSaga from './sagas';
import { AppNavigator } from './navigators';

const store = configureStore();
store.runSaga(rootSaga);

export default class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <AppNavigator />
            </Provider>
        );
    }
}

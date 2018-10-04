import React from 'react';
import { Provider } from 'react-redux';

import configureStore from './configureStore';
import rootSaga from './sagas.js';
import RootStack from './routes/routes';
import NavigationService from './routes/NavigationService';

const store = configureStore();

store.runSaga(rootSaga);

export default class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <RootStack
                    ref={(navigatorRef) => {
                        NavigationService.setTopLevelNavigator(navigatorRef);
                    }}
                />
            </Provider>
        );
    }
}

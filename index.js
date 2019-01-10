import React from 'react';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Login from 'containers/Login';

import configureStore from './src/configureStore';

const store = configureStore();

Navigation.registerComponentWithRedux('td.Login', () => Login, Provider, store);

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            stack: {
                children: [
                    {
                        component: {
                            name: 'td.Login',
                            id: 'td.Login',
                        },
                    },
                ],
            },
        },
    });
});

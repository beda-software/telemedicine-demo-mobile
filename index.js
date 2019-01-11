import React from 'react';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Login from 'containers/Login';
import SignUp from 'containers/SignUp';
import Main from 'containers/Main';
import Call from 'containers/Call';
import IncomingCall from 'containers/IncomingCall';

import configureStore from './src/configureStore';

const store = configureStore();

Navigation.registerComponentWithRedux('td.Login', () => Login, Provider, store);
Navigation.registerComponentWithRedux('td.SignUp', () => SignUp, Provider, store);
Navigation.registerComponentWithRedux('td.Main', () => Main, Provider, store);
Navigation.registerComponentWithRedux('td.Call', () => Call, Provider, store);
Navigation.registerComponentWithRedux('td.IncomingCall', () => IncomingCall, Provider, store);

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            stack: {
                id: 'root',
                children: [
                    {
                        component: {
                            name: 'td.Login',
                        },
                    },
                ],
            },
        },
    });
});

import { SwitchNavigator, StackNavigator } from 'react-navigation';
import { createReactNavigationReduxMiddleware, reduxifyNavigator } from 'react-navigation-redux-helpers';

import Login from 'containers/Login';
import SignUp from 'containers/SignUp';
import App from 'containers/App';
import IncomingCall from 'containers/IncomingCall';
import Call from 'containers/Call';
// import MainScreen from '../screens/MainScreen';
// import SettingsScreen from '../screens/SettingsScreen';

import COLOR from 'styles/Color';
import { connect } from 'react-redux';

const AppStack = StackNavigator(
    {
        Main: {
            screen: App,
        },
        /*Settings: {
            screen: Settings,
        },*/
    },
    {
        navigationOptions: {
            headerStyle: {
                backgroundColor: COLOR.PRIMARY,
            },
            headerTintColor: COLOR.WHITE,
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        },
    }
);

const RootNavigator = SwitchNavigator(
    {
        App: AppStack,
        Login,
        SignUp,
        Call,
        IncomingCall,
    },
    {
        initialRouteName: 'Login',
    }
);

const navigationMiddleware = createReactNavigationReduxMiddleware(
    'root',
    (state) => state.navigation
);

const AppWithNavigationState = reduxifyNavigator(RootNavigator, 'root');

const mapStateToProps = (state) => ({
    state: state.navigation,
});

const AppNavigator = connect(mapStateToProps)(AppWithNavigationState);

export { RootNavigator, AppNavigator, navigationMiddleware };

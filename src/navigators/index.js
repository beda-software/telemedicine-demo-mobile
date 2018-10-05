import { SwitchNavigator, StackNavigator } from 'react-navigation';
import { createReactNavigationReduxMiddleware, reduxifyNavigator } from 'react-navigation-redux-helpers';

import Login from 'containers/Login';
import SignUp from 'containers/SignUp';
import App from 'containers/App';
// import MainScreen from '../screens/MainScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import CallScreen from '../screens/CallScreen';
// import IncomingCallScreen from '../screens/IncomingCallScreen';

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
        Login,
        SignUp,
        App: AppStack,
        // Call: CallScreen,
        // IncomingCall: IncomingCallScreen
    },
    {
        initialRouteName: 'App',
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

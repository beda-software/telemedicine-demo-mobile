import { SwitchNavigator, StackNavigator } from 'react-navigation';
import { createReactNavigationReduxMiddleware, reduxifyNavigator } from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';

import Login from 'containers/Login';
import SignUp from 'containers/SignUp';
import IncomingCall from 'containers/IncomingCall';
import Call from 'containers/Call';
import Main from 'containers/Main';
import COLOR from 'styles/Color';

const AppStack = StackNavigator(
    {
        Main: {
            screen: Main,
        },
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

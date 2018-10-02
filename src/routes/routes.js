import { SwitchNavigator } from 'react-navigation';
import Login from '../containers/Login';
import SignUp from '../containers/SignUp';
// import MainScreen from '../screens/MainScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import CallScreen from '../screens/CallScreen';
// import IncomingCallScreen from '../screens/IncomingCallScreen';

// import COLOR from '../styles/Color';

// const AppStack = StackNavigator(
//     {
//         Main: {
//             screen: MainScreen,
//         },
//         Settings: {
//             screen: SettingsScreen,
//         }
//     },
//     {
//         navigationOptions: {
//             headerStyle: {
//                 backgroundColor: COLOR.PRIMARY,
//             },
//             headerTintColor: COLOR.WHITE,
//             headerTitleStyle: {
//                 fontWeight: 'bold',
//             },
//         },
//     }
// );

const RootStack = SwitchNavigator(
    {
        Login,
        SignUp,
        // App: AppStack,
        // Call: CallScreen,
        // IncomingCall: IncomingCallScreen
    },
    {
        initialRouteName: 'Login',
    }
);

export default RootStack;

import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: COLOR.WHITE,
    },
    incomingCall: {
        justifyContent: 'center',
        alignSelf: 'center',
        fontSize: 22,
    },
    alignCenter: {
        justifyContent: 'center',
    },
});

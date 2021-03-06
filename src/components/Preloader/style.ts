import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR.GRAY,
        opacity: 0.6,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },

    innerContainer: {
        borderRadius: 10,
    },
});

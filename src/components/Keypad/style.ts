import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    keypad: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        // flex: 1,
        // marginTop: 0,
        // marginBottom: 10
    },
    keypadRow: {
        flexDirection: 'row',
        alignSelf: 'center',
    },
    keypadButton: {
        margin: 10,
        width: 70,
        height: 70,
        borderWidth: 0.5,
        borderColor: '#2B2B2B',
        borderRadius: 35,
        paddingTop: 7,
    },
    digits: {
        fontFamily: 'Helvetica Neue',
        fontSize: 36,
    },
    letters: {
        fontFamily: 'Helvetica Neue',
        marginTop: -5,
        fontSize: 8,
    },
});

import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: COLOR.WHITE,
    },
    addForm: {
        paddingHorizontal: 20,
        paddingTop: 20,
        alignItems: 'stretch',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    formInput: {
        padding: 5,
        marginBottom: 10,
        color: COLOR.ACCENT,
        height: 40,
        borderColor: COLOR.ACCENT,
        borderWidth: 1,
        borderRadius: 4,
    },
    formInputError: {
        marginTop: -5,
        marginBottom: 15,
        color: COLOR.RED,
        textAlign: 'right',
    },
    formInputLabel: {
        paddingBottom: 10,
    },
    useragent: {
        flex: 1,
        flexDirection: 'column',
    },
});

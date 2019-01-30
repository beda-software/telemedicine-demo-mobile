import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: COLOR.WHITE,
    },
    useragent: {
        flex: 1,
        flexDirection: 'column',
    },
    form: {
        backgroundColor: COLOR.GRAY,
        padding: 6,
        borderTopWidth: 1,
        borderTopColor: COLOR.ACCENT,
    },
    messageInput: {
        backgroundColor: COLOR.WHITE,
        borderColor: COLOR.ACCENT,
        borderWidth: 1,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 40,
        paddingRight: 5,
    },
    chatMessage: {
        margin: 5,
        borderWidth: 1,
        borderColor: COLOR.ACCENT,
        borderRadius: 15,
        padding: 10,
        fontSize: 16,
    },
    chatMessageWrapper: { flex: 1, flexDirection: 'row' },
    messagePayload: {
        borderWidth: 1,
        borderRadius: 15,
        padding: 15,
        marginTop: 5,
        borderColor: COLOR.ACCENT,
    },
});

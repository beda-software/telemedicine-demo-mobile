import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: COLOR.WHITE,
    },
    contactListItem: {
        color: COLOR.BUTTON,
        fontSize: 16,
        alignSelf: 'flex-start',
        paddingTop: 10,
        textAlign: 'center',
    },
    useragent: {
        flex: 1,
        flexDirection: 'column',
    },
});

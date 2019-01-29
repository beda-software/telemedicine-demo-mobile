import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: COLOR.WHITE,
    },
    header: { alignItems: 'center', paddingRight: 40, paddingBottom: 20, paddingTop: 20 },
    headerText: { fontSize: 20, color: COLOR.ACCENT },
    menuItem: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: COLOR.ACCENT,
        flexDirection: 'row',
    },
    menuItemText: { marginLeft: 5 },
});

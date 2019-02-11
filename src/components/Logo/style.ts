import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    logo: {
        alignItems: 'center',
        padding: 5,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLOR.BLACK,
    },
    subLogo: {
        alignItems: 'center',
    },
    subLogoText: {
        fontSize: 18,
        color: COLOR.ACCENT,
    },
});

import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    logo: {
        alignItems: 'center',
        padding: 5,
    },
    logoText: {
        fontSize: 35,
        color: COLOR.ACCENT,
    },
    subLogo: {
        alignItems: 'center',
        marginBottom: 50,
    },
    subLogoText: {
        fontSize: 18,
        color: COLOR.ACCENT,
    },
});

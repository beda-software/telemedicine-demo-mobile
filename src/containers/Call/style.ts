import { StyleSheet } from 'react-native';

import COLOR from 'src/styles/Color';

export default StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: COLOR.WHITE,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    modalBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    innerContainer: {
        borderRadius: 10,
    },
    innerContainerTransparent: {
        backgroundColor: COLOR.WHITE,
        padding: 20,
    },
    useragent: {
        flex: 1,
        flexDirection: 'column',
    },
    selfView: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 100,
        height: 120,
    },
    remoteVideo: {
        flex: 1,
    },
    videoPanel: {
        flex: 1,
        position: 'relative',
    },
    callControls: {
        height: 70,
    },
    callConnectingLabel: {
        fontSize: 18,
        alignSelf: 'center',
    },
    itemSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: '#607D8B',
        marginTop: 10,
        marginBottom: 10,
    },
});

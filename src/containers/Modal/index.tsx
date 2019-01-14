import * as React from 'react';
import { Text, View, Modal as RNModal, TouchableHighlight } from 'react-native';
import { Navigation } from 'react-native-navigation';
import styles from 'src/styles/Styles';

export function Component({ text, componentId }: { text: string; componentId: string }) {
    return (
        <RNModal animationType="fade" transparent visible={true} onRequestClose={() => {}}>
            <TouchableHighlight onPress={() => Navigation.dismissOverlay(componentId)} style={styles.container}>
                <View style={[styles.container, styles.modalBackground]}>
                    <View style={[styles.innerContainer, styles.innerContainerTransparent]}>
                        <Text>{text}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        </RNModal>
    );
}

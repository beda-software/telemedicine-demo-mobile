import * as React from 'react';
import { Modal as RNModal, Text, TouchableHighlight, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import s from './style';

export function Component({ text, componentId }: { text: string; componentId: string }) {
    return (
        <RNModal animationType="fade" transparent visible={true} onRequestClose={() => {}}>
            <TouchableHighlight onPress={() => Navigation.dismissOverlay(componentId)} style={s.container}>
                <View style={[s.container, s.modalBackground]}>
                    <View style={[s.innerContainer, s.innerContainerTransparent]}>
                        <Text>{text}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        </RNModal>
    );
}

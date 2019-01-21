import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import s from './style';

export function Preloader({ isVisible }: { isVisible: boolean }) {
    if (isVisible) {
        return (
            <View style={s.modal}>
                <View style={[s.container]}>
                    <View style={[s.innerContainer]}>
                        <ActivityIndicator size="large" />
                    </View>
                </View>
            </View>
        );
    }

    return <View />;
}

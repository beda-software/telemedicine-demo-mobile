import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import styles from 'src/styles/Styles';

export function Preloader({ isVisible }: { isVisible: boolean }) {
    if (isVisible) {
        return (
            <View style={styles.modal}>
                <View style={[styles.container]}>
                    <View style={[styles.innerContainer]}>
                        <ActivityIndicator size="large" />
                    </View>
                </View>
            </View>
        );
    }

    return <View />;
}

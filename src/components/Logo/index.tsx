import * as React from 'react';
import { Text, View } from 'react-native';

import styles from './style';

export function Logo() {
    return (
        <View>
            <View style={styles.logo}>
                <Text style={styles.logoText}>beda.software</Text>
            </View>

            <View style={styles.subLogo}>
                <Text style={styles.subLogoText}>Telemedicine Demo</Text>
            </View>
        </View>
    );
}

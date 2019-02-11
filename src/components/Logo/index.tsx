import * as React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

import styles from './style';

export function Logo() {
    return (
        <View>
            <TouchableOpacity onPress={() => Linking.openURL('http://beda.software')} style={styles.logo}>
                <Text style={styles.logoText}>BEDA >> SOFTWARE</Text>
            </TouchableOpacity>

            <View style={styles.subLogo}>
                <Text style={styles.subLogoText}>Telemedicine Demo</Text>
            </View>
        </View>
    );
}

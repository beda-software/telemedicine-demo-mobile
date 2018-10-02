import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/Styles';

export default function () {
    return (
        <View>
            <View style={styles.logo}>
                <Text style={styles.logotext}>beda.software</Text>
            </View>

            <View style={styles.sublogo}>
                <Text style={styles.sublogotext}>Telemedicine Demo</Text>
            </View>
        </View>
    );
}

import React from 'react';
import { View, Text, FlatList } from 'react-native';

import styles from 'styles/Styles';
import COLOR from 'styles/Color';
import CallButton from 'components/CallButton';

function AppForm(props) {
    return (
        <View style={styles.useragent}>
            <FlatList
                data={props.contactList}
                keyExtractor={(item) => item.voxImplantId}
                renderItem={({ item }) => (
                    <View
                        style={{
                            alignSelf: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactListItem}>
                                {item.displayName}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <CallButton
                                icon_name="call"
                                color={COLOR.ACCENT}
                                buttonPressed={() => props.makeCall(item.username, false)}
                            />
                            <CallButton
                                icon_name="videocam"
                                color={COLOR.ACCENT}
                                buttonPressed={() => props.makeCall(item.username, true)}
                            />
                        </View>
                    </View>
                )}
            />

        </View>
    );
}

export default AppForm;

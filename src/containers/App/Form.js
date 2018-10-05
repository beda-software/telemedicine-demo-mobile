import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Field, reduxForm } from 'redux-form';

import styles from 'styles/Styles';
import TextInput from 'components/TextInput';
import COLOR from 'styles/Color';
import CallButton from 'components/CallButton';

function AppForm(props) {
    return (
        <View style={styles.useragent}>
            <Field
                component={TextInput}
                name="callTo"
                underlineColorAndroid="transparent"
                style={[styles.forminput, styles.margin]}
                placeholder="Search for contacts"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <FlatList
                data={props.userList}
                keyExtractor={(item, index) => item.voxImplantId}
                renderItem={({item}) =>
                    <View
                        style={{
                            alignSelf: 'center',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                        }}
                    >
                        <View style={{flex: 1}}>
                            <Text style={styles.contactListItem}>
                                {item.displayName}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <CallButton
                                icon_name="call"
                                color={COLOR.ACCENT}
                                buttonPressed={() => props.makeCall(item)}
                            />
                            <CallButton
                                icon_name="videocam"
                                color={COLOR.ACCENT}
                                buttonPressed={() => props.makeVideoCall(item)}
                            />
                        </View>
                    </View>
                }
            />

        </View>
    );
}

export default reduxForm({
    form: 'app',
})(AppForm);

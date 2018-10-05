import React from 'react';
import { View } from 'react-native';
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
                placeholder="Call to"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                height: 90,
            }}
            >
                <CallButton
                    icon_name="call"
                    color={COLOR.ACCENT}
                    buttonPressed={() => props.makeCall(false)}
                />
                <CallButton
                    icon_name="videocam"
                    color={COLOR.ACCENT}
                    buttonPressed={() => props.makeCall(true)}
                />
            </View>


        </View>
    );
}

export default reduxForm({
    form: 'app',
})(AppForm);

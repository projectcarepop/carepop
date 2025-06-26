import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../src/components';

export const SelectDateTimeScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Date & Time</Text>
            <Text>Coming Soon...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    title: {
        ...theme.typography.h2,
        marginBottom: theme.spacing.lg,
    },
}); 
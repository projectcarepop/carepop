import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../src/components/button.native';
import { theme } from '../src/components/theme';
import { MailCheck } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../src/navigation/AppNavigator';

type EmailConfirmationNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const EmailConfirmationScreen = () => {
    const navigation = useNavigation<EmailConfirmationNavigationProp>();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <MailCheck size={80} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>Confirm Your Email</Text>
                <Text style={styles.message}>
                    We&apos;ve sent a confirmation link to your email address. Please click the link to complete your registration.
                </Text>
                <Button
                    title="Go to Login"
                    onPress={() => navigation.navigate('Login')}
                    variant="default"
                    size="lg"
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    iconContainer: {
        marginBottom: theme.spacing['2xl'],
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    message: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: theme.spacing['2xl'],
        lineHeight: 24,
    },
    button: {
        width: '100%',
    },
}); 
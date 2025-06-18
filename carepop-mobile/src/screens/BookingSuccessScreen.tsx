import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { BookingStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

type BookingSuccessNavigationProp = NavigationProp<BookingStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen = () => {
    const navigation = useNavigation<BookingSuccessNavigationProp>();

    const handleViewAppointments = () => {
        // This action first navigates to the root 'Dashboard' screen in the drawer, then opens the 'Appointments' screen.
        navigation.dispatch(
            CommonActions.navigate({
                name: 'Dashboard', 
                params: {
                    screen: 'Appointments', // This is a screen within the Drawer
                },
            })
        );
        // Then, ensure the drawer is closed if it was open.
        navigation.dispatch(DrawerActions.closeDrawer());
    };

    const handleBookAnother = () => {
        // This resets the booking stack to the beginning for a fresh start.
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'ClinicSelection' }],
            })
        );
    };

    const handleGoHome = () => {
        // A simple action to go back to the main dashboard screen.
        navigation.dispatch(
             CommonActions.navigate({ name: 'Dashboard' })
        );
         navigation.dispatch(DrawerActions.closeDrawer());
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                     <Ionicons name="checkmark-done-circle" size={120} color={theme.colors.success} />
                </View>
                <Text style={styles.header}>Booking Confirmed!</Text>
                <Text style={styles.subHeader}>
                    You will receive a confirmation and reminder via email.
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleViewAppointments}>
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.primaryForeground} style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>View My Appointments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleBookAnother}>
                         <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
                        <Text style={styles.secondaryButtonText}>Book Another Service</Text>
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.tertiaryButton} onPress={handleGoHome}>
                        <Text style={styles.tertiaryButtonText}>Go to Dashboard</Text>
                    </TouchableOpacity>
                </View>
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
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl, // Extra space at bottom
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: theme.radius.full,
        padding: theme.spacing.md,
    },
    header: {
        ...theme.typography.h1,
        color: theme.colors.foreground,
        marginBottom: theme.spacing.sm,
    },
    subHeader: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: theme.spacing.xl * 2, // Large space before buttons
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.md,
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    primaryButtonText: {
        color: theme.colors.primaryForeground,
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilyBold,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        width: '100%',
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilyBold,
    },
    tertiaryButton: {
        marginTop: theme.spacing.sm,
    },
    tertiaryButtonText: {
        color: theme.colors.mutedForeground,
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        textDecorationLine: 'underline',
    },
    buttonIcon: {
        marginRight: theme.spacing.sm,
    }
}); 
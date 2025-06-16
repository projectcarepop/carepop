import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator'; // Navigating back to the main app structure
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';

// Use a more general navigation prop as we are navigating outside the AppointmentStack
type BookingSuccessNavigationProp = NavigationProp<RootStackParamList>;

export const BookingSuccessScreen = () => {
    const navigation = useNavigation<BookingSuccessNavigationProp>();

    const handleViewAppointments = () => {
        // Reset the stack and navigate to the Dashboard's Appointment tab.
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ 
                    name: 'MainApp', 
                    state: { 
                        routes: [{ name: 'Dashboard', state: { routes: [{ name: 'My' }] } }] 
                    } 
                }],
            })
        );
    };

    const handleBookAnother = () => {
        // Reset the appointment stack to its beginning
        navigation.dispatch(
             CommonActions.reset({
                index: 0,
                routes: [{ 
                    name: 'MainApp', 
                    state: { 
                        routes: [{ name: 'Appointments' }] 
                    } 
                }],
            })
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                     <Ionicons name="checkmark-circle" size={100} color={theme.colors.success} />
                </View>
                <Text style={styles.header}>Success!</Text>
                <Text style={styles.subHeader}>Your appointment has been booked.</Text>
                <Text style={styles.message}>
                    You will receive a confirmation email and a reminder before your scheduled date.
                </Text>

                <TouchableOpacity style={styles.primaryButton} onPress={handleViewAppointments}>
                    <Text style={styles.primaryButtonText}>View My Appointments</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleBookAnother}>
                    <Text style={styles.secondaryButtonText}>Book Another Appointment</Text>
                </TouchableOpacity>
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
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subHeader: {
        fontSize: 18,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.lg,
    },
    message: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    primaryButtonText: {
        color: theme.colors.card,
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        width: '100%',
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    }
}); 
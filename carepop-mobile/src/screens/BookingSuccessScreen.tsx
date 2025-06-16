import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator'; // Navigating back to the main app structure
import { Ionicons } from '@expo/vector-icons';

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
                        routes: [
                            { name: 'Dashboard' },
                            // Navigate specifically to the 'My' tab within the Dashboard's nested navigator
                            // This part is complex and depends on the exact structure of your tab navigator
                            // Assuming 'Dashboard' contains a tab navigator with a 'My' route
                        ] 
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
                     <Ionicons name="checkmark-done-circle" size={120} color={theme.colors.success} />
                </View>
                <Text style={styles.header}>Booking Confirmed!</Text>
                <Text style={styles.subHeader}>
                    You will receive a confirmation and reminder via email.
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleViewAppointments}>
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.card} style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>View Appointments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={handleBookAnother}>
                         <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
                        <Text style={styles.secondaryButtonText}>Book Another</Text>
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
        // Optional: Add a subtle background to the icon
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        borderRadius: theme.borderRadius.full,
        padding: theme.spacing.md,
    },
    header: {
        fontSize: theme.typography.heading,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subHeader: {
        fontSize: theme.typography.body,
        color: theme.colors.textMuted,
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
        borderRadius: theme.borderRadius.md,
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    primaryButtonText: {
        color: theme.colors.card,
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        width: '100%',
    },
    secondaryButtonText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: theme.spacing.sm,
    }
}); 
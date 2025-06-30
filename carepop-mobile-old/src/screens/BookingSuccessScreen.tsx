import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';

import { theme } from '../components/theme';
import { BookingStackParamList } from '../navigation/BookingNavigator';
import { Button } from '../components/button.native';

type BookingSuccessRouteProp = RouteProp<BookingStackParamList, 'BookingSuccess'>;
type BookingSuccessNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen = () => {
    const navigation = useNavigation<BookingSuccessNavigationProp>();
    const route = useRoute<BookingSuccessRouteProp>();
    
    // Appointment details are available here if needed for display
    const { appointmentDetails } = route.params;

    const handleViewAppointments = () => {
        // Navigate to the main App navigator, then to the appointments screen.
        navigation.getParent()?.navigate('App', { screen: 'Appointments' });
    };

    const handleBookAnother = () => {
        // Reset the booking stack to the beginning (ServiceSelection).
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'ServiceSelection' }],
            })
        );
    };

    const handleGoHome = () => {
        // Navigate to the root of the parent navigator (the App Drawer).
        navigation.getParent()?.navigate('App', { screen: 'Dashboard' });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                     <CheckCircle2 size={100} color={theme.colors.success} strokeWidth={1.5} />
                </View>
                <Text style={styles.header}>Booking Confirmed!</Text>
                <Text style={styles.subHeader}>
                    You will receive a confirmation and reminder via email. Your appointment details are saved in your account.
                </Text>

                <View style={styles.buttonContainer}>
                    <Button onPress={handleViewAppointments}>
                        View My Appointments
                    </Button>
                    <Button onPress={handleBookAnother} variant="outline" style={{ marginTop: theme.spacing.md }}>
                        Book Another Service
                    </Button>
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
    },
    iconContainer: {
        marginBottom: theme.spacing.lg,
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
        marginBottom: theme.spacing.xl * 2,
        paddingHorizontal: theme.spacing.lg,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: theme.spacing.lg,
    },
    tertiaryButton: {
        marginTop: theme.spacing.xl,
        alignSelf: 'center',
    },
    tertiaryButtonText: {
        color: theme.colors.mutedForeground,
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        textDecorationLine: 'underline',
    },
}); 
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { BookingStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type BookingConfirmationRouteProp = RouteProp<BookingStackParamList, 'BookingConfirmation'>;
type BookingConfirmationNavigationProp = NavigationProp<BookingStackParamList, 'BookingConfirmation'>;

interface BookingDetails {
    clinicName: string;
    serviceName: string;
    providerName: string;
}

export const BookingConfirmationScreen = () => {
    const navigation = useNavigation<BookingConfirmationNavigationProp>();
    const route = useRoute<BookingConfirmationRouteProp>();
    const { session } = useAuth();
    const { clinicId, serviceId, providerId, schedule } = route.params;

    const [details, setDetails] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch clinic and service names for display
    const fetchDetails = useCallback(async () => {
        // In a real app, you might have a single endpoint to get all booking summary details
        // For now, we'll assume we can fetch them or we could have passed them
        // This is a simplified placeholder for fetching names
        try {
            // This is where you would fetch clinic, service, and provider names if not passed
            // For this example, let's pretend we fetched them:
            setDetails({
                clinicName: 'Placeholder Clinic Name', // Replace with fetched data
                serviceName: 'Placeholder Service Name', // Replace with fetched data
                providerName: 'Placeholder Provider Name', // Replace with fetched data
            });
        } catch (e: any) {
            setError('Could not load appointment details.');
        } finally {
            setIsLoading(false);
        }
    }, [clinicId, serviceId, providerId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);


    const handleConfirmBooking = async () => {
        setIsBooking(true);
        setError(null);

        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            Alert.alert('Error', 'Backend URL not configured.');
            setIsBooking(false);
            return;
        }

        try {
            // Reformat date and time for backend (e.g., ISO string)
            const [time, period] = schedule.time.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const appointmentDateTime = new Date(schedule.date);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            const response = await fetch(`${backendUrl}/api/v1/public/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    clinic_id: clinicId,
                    service_id: serviceId,
                    provider_id: providerId,
                    appointment_time: appointmentDateTime.toISOString(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create appointment.');
            }

            // Navigate to success screen with details
            navigation.reset({
                index: 0,
                routes: [{ 
                    name: 'BookingSuccess', 
                    params: { appointmentDetails: { ...details, ...schedule } } 
                }],
            });

        } catch (e: any) {
            Alert.alert('Booking Failed', e.message);
        } finally {
            setIsBooking(false);
        }
    };

    const DetailRow = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string | number }) => (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={24} color={theme.colors.secondary} style={styles.icon} />
            <View>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return <View style={styles.centeredContainer}><ActivityIndicator size="large" /></View>;
    }

    if (error) {
        return <View style={styles.centeredContainer}><Text style={styles.errorText}>{error}</Text></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Review Your Booking</Text>
                
                <View style={styles.detailsCard}>
                    <Text style={styles.cardHeader}>Appointment Details</Text>
                    <DetailRow icon="business-outline" label="Clinic" value={details?.clinicName ?? 'Loading...'} />
                    <DetailRow icon="medkit-outline" label="Service" value={details?.serviceName ?? 'Loading...'} />
                    <DetailRow icon="person-outline" label="Provider" value={details?.providerName ?? 'Any Available'} />
                    <DetailRow icon="calendar-outline" label="Date" value={format(new Date(schedule.date), 'EEEE, MMMM d, yyyy')} />
                    <DetailRow icon="time-outline" label="Time" value={schedule.time} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.confirmButton, isBooking && styles.disabledButton]} onPress={handleConfirmBooking} disabled={isBooking}>
                    {isBooking ? (
                        <ActivityIndicator color={theme.colors.primaryForeground} />
                    ) : (
                        <>
                            <Text style={styles.confirmButtonText}>Confirm & Book Now</Text>
                            <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.primaryForeground} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: theme.spacing.md, flexGrow: 1 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { ...theme.typography.h1, color: theme.colors.foreground, marginBottom: theme.spacing.lg },
    detailsCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
    cardHeader: { ...theme.typography.h3, color: theme.colors.secondary, marginBottom: theme.spacing.md, paddingBottom: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: theme.spacing.md },
    icon: { marginRight: theme.spacing.md, width: 24, marginTop: 2 },
    detailLabel: { ...theme.typography.small, color: theme.colors.mutedForeground, marginBottom: 2 },
    detailValue: { ...theme.typography.body, fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.foreground, flexShrink: 1 },
    footer: { padding: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background },
    confirmButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', minHeight: 50 },
    disabledButton: { backgroundColor: theme.colors.muted },
    confirmButtonText: { color: theme.colors.primaryForeground, ...theme.typography.h4, marginRight: theme.spacing.sm },
    errorText: { color: theme.colors.destructive, ...theme.typography.h4 },
}); 
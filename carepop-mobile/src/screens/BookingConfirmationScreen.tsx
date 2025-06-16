import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

type BookingConfirmationRouteProp = RouteProp<AppointmentStackParamList, 'BookingConfirmation'>;
type BookingConfirmationNavigationProp = NavigationProp<AppointmentStackParamList, 'BookingConfirmation'>;

// Mock data fetching functions for now
const fetchServiceDetails = async (serviceId: string, token: string) => {
    // In a real app, you would fetch this from your backend
    console.log(`Fetching details for service: ${serviceId}`);
    // This is mock data
    const services: {[key: string]: any} = {
        'e8a4a4b4-4c4a-4b0d-8b0d-4a4c4a4c4a4c': { name: 'Mental Health Consultation', price: '₱1,500' },
        'f9b5b5c5-5d5b-5c1e-9c1d-5b5c5b5c5b5c': { name: 'Annual Physical Exam', price: '₱2,000' }
    };
    return services[serviceId] || { name: 'Unknown Service', price: 'N/A' };
};

const fetchClinicDetails = async (clinicId: string, token: string) => {
    // In a real app, you would fetch this from your backend
    console.log(`Fetching details for clinic: ${clinicId}`);
    return { name: 'QueerCare Clinic - Manila', address: '123 Taft Avenue, Malate, Manila' };
};


export const BookingConfirmationScreen = () => {
    const navigation = useNavigation<BookingConfirmationNavigationProp>();
    const route = useRoute<BookingConfirmationRouteProp>();
    const { session } = useAuth();
    const { clinicId, serviceId, slot } = route.params;

    const [details, setDetails] = useState({
        clinicName: '',
        clinicAddress: '',
        serviceName: '',
        price: '',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDetails = async () => {
            if (!session) return;
            try {
                const clinicDetails = await fetchClinicDetails(clinicId, session.access_token);
                const serviceDetails = await fetchServiceDetails(serviceId, session.access_token);
                setDetails({
                    clinicName: clinicDetails.name,
                    clinicAddress: clinicDetails.address,
                    serviceName: serviceDetails.name,
                    price: serviceDetails.price,
                });
            } catch (error) {
                console.error("Failed to load booking details:", error);
                Alert.alert("Error", "Could not load appointment details.");
            } finally {
                setIsLoading(false);
            }
        };
        loadDetails();
    }, [clinicId, serviceId, session]);

    const handleConfirmBooking = () => {
        // Placeholder for booking logic
        console.log("Booking confirmed for:", { clinicId, serviceId, slot });

        // On success, navigate to the success screen
        navigation.navigate('BookingSuccess');
    };

    const DetailRow = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string }) => (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={24} color={theme.colors.secondary} style={styles.icon} />
            <View>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Review Your Booking</Text>
                
                <View style={styles.detailsCard}>
                    <Text style={styles.cardHeader}>Appointment Details</Text>
                    <DetailRow icon="business-outline" label="Clinic" value={details.clinicName} />
                    <DetailRow icon="location-outline" label="Address" value={details.clinicAddress} />
                    <DetailRow icon="medkit-outline" label="Service" value={details.serviceName} />
                    <DetailRow icon="calendar-outline" label="Date & Time" value={slot} />
                    <DetailRow icon="pricetag-outline" label="Price" value={details.price} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
                    <Text style={styles.confirmButtonText}>Confirm & Book Now</Text>
                    <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.card} />
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
        padding: theme.spacing.md,
        flexGrow: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: theme.typography.heading,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    detailsCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        fontSize: theme.typography.subheading,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    },
    icon: {
        marginRight: theme.spacing.md,
        width: 24, // ensure alignment
    },
    detailLabel: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    footer: {
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    confirmButtonText: {
        color: theme.colors.card,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: theme.spacing.sm,
    }
}); 
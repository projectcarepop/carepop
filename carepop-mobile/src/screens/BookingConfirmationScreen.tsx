import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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

    const [clinicName, setClinicName] = useState('Loading...');
    const [serviceName, setServiceName] = useState('Loading...');
    const [price, setPrice] = useState('...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDetails = async () => {
            if (!session) return;
            try {
                const clinicDetails = await fetchClinicDetails(clinicId, session.access_token);
                const serviceDetails = await fetchServiceDetails(serviceId, session.access_token);

                setClinicName(clinicDetails.name);
                setServiceName(serviceDetails.name);
                setPrice(serviceDetails.price);

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

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading Details...</Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>Confirm Your Appointment</Text>
                
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Ionicons name="business-outline" size={24} color={theme.colors.primary} style={styles.icon} />
                        <View>
                            <Text style={styles.detailLabel}>Clinic</Text>
                            <Text style={styles.detailValue}>{clinicName}</Text>
                        </View>
                    </View>
                     <View style={styles.detailRow}>
                        <Ionicons name="medkit-outline" size={24} color={theme.colors.primary} style={styles.icon} />
                        <View>
                            <Text style={styles.detailLabel}>Service</Text>
                            <Text style={styles.detailValue}>{serviceName}</Text>
                        </View>
                    </View>
                     <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} style={styles.icon} />
                        <View>
                            <Text style={styles.detailLabel}>Date & Time</Text>
                            <Text style={styles.detailValue}>{slot}</Text>
                        </View>
                    </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="pricetag-outline" size={24} color={theme.colors.primary} style={styles.icon} />
                        <View>
                            <Text style={styles.detailLabel}>Price</Text>
                            <Text style={styles.detailValue}>{price}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
                    <Text style={styles.confirmButtonText}>Confirm & Book</Text>
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
        padding: theme.spacing.md,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.textMuted,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    detailsCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    icon: {
        marginRight: theme.spacing.md,
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
    confirmButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto', // Push to bottom
    },
    confirmButtonText: {
        color: theme.colors.card,
        fontSize: 18,
        fontWeight: 'bold',
    }
}); 
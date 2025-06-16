import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// Define the structure of a Clinic object
interface Clinic {
  id: string;
  name: string;
  address: string;
  // Add other relevant fields, e.g., city, operating_hours
}

type ClinicSelectionRouteProp = RouteProp<AppointmentStackParamList, 'ClinicSelection'>;
type ClinicSelectionNavigationProp = NavigationProp<AppointmentStackParamList, 'ClinicSelection'>;

export const ClinicSelectionScreen = () => {
  const navigation = useNavigation<ClinicSelectionNavigationProp>();
  const route = useRoute<ClinicSelectionRouteProp>();
  const { serviceId, serviceName } = route.params;
  
  const { session } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinics = useCallback(async () => {
    if (!session) {
      setError('You must be logged in to view clinics.');
      setIsLoading(false);
      return;
    }

    const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
    if (!backendUrl) {
      setError('Backend URL not configured.');
      setIsLoading(false);
      return;
    }

    try {
      // Note the `serviceIds[]` syntax for the query parameter
      const response = await fetch(`${backendUrl}/api/v1/public/clinics?serviceIds[]=${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch clinics.');
      }
      
      setClinics(data.data?.clinics || []);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [session, serviceId]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleSelectClinic = (clinic: Clinic) => {
    navigation.navigate('DateTimeSelection', {
      serviceId: serviceId,
      clinicId: clinic.id,
    });
  };

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity onPress={() => handleSelectClinic(item)} style={styles.clinicButton}>
        <View style={styles.clinicIconContainer}>
            <Ionicons name="business-outline" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.clinicTextContainer}>
            <Text style={styles.clinicName}>{item.name}</Text>
            <Text style={styles.clinicAddress} numberOfLines={2}>{item.address}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding Clinics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={clinics}
          renderItem={renderClinicItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View>
                <Text style={styles.title}>Select a Clinic</Text>
                <Text style={styles.subtitle}>Showing clinics that offer: <Text style={styles.serviceNameText}>{serviceName}</Text></Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centeredContainer}>
                <Text style={styles.placeholderText}>No clinics found for this service.</Text>
            </View>
          }
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  serviceNameText: {
    fontWeight: '600',
    color: theme.colors.primary
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 50, // Add some top margin to center it better
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.destructive,
    textAlign: 'center',
  },
  clinicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clinicIconContainer: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.borderRadius.lg,
  },
  clinicTextContainer: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clinicAddress: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
}); 
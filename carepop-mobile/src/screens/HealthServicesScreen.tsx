import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// Define the structure of a Service object based on backend response
interface Service {
  id: string;
  name: string;
  description: string;
  // Add other relevant fields if available, e.g., price, duration
}

type ServiceSelectionRouteProp = RouteProp<AppointmentStackParamList, 'ServiceSelection'>;
type ServiceSelectionNavigationProp = NavigationProp<AppointmentStackParamList, 'ServiceSelection'>;

export function HealthServicesScreen() {
  const navigation = useNavigation<ServiceSelectionNavigationProp>();
  const route = useRoute<ServiceSelectionRouteProp>();
  const { clinicId } = route.params;

  const { session } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicesForClinic = useCallback(async () => {
    if (!session) {
      setError('You must be logged in to view services.');
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
      const response = await fetch(`${backendUrl}/api/v1/public/clinics/${clinicId}/services`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch services for this clinic.');
      }
      
      // The backend returns { data: [...] }, so we access data.data
      setServices(data.data || []);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [session, clinicId]);

  useEffect(() => {
    fetchServicesForClinic();
  }, [fetchServicesForClinic]);

  const handleSelectService = (service: Service) => {
    navigation.navigate('DateTimeSelection', {
      clinicId: clinicId,
      serviceId: service.id,
    });
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity onPress={() => handleSelectService(item)} style={styles.serviceButton}>
        <View style={styles.serviceIconContainer}>
            <Ionicons name="medkit-outline" size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.serviceTextContainer}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading Services...</Text>
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
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          // The title is now set in the navigator, so we don't need a ListHeaderComponent here.
          ListEmptyComponent={
            <View style={styles.centeredContainer}>
                <Text style={styles.placeholderText}>No services available at this clinic.</Text>
            </View>
          }
        />
    </SafeAreaView>
  );
}

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
  title: { // This style is no longer used for a header, but can be kept for other text
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 50,
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
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceIconContainer: {
    marginRight: theme.spacing.md,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  serviceDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
}); 
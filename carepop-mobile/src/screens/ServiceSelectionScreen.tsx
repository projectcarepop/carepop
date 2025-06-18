import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { BookingStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// Define the structure of a Service object based on backend response
interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // Assuming price is available
}

type ServiceSelectionRouteProp = RouteProp<BookingStackParamList, 'ServiceSelection'>;
type ServiceSelectionNavigationProp = NavigationProp<BookingStackParamList, 'ServiceSelection'>;

export function ServiceSelectionScreen() {
  const navigation = useNavigation<ServiceSelectionNavigationProp>();
  const route = useRoute<ServiceSelectionRouteProp>();
  const { clinicId, clinicName } = route.params;

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
      serviceName: service.name,
    });
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity onPress={() => handleSelectService(item)} style={styles.serviceCard}>
      <View style={styles.cardIconContainer}>
          <Ionicons name="medkit-outline" size={28} color={theme.colors.primary} />
      </View>
      <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
      </View>
      <View style={styles.cardRightContainer}>
        <Text style={styles.cardPrice}>{`₱${item.price}`}</Text>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.destructive} />
        <Text style={styles.errorTextTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          // The title is now set in the navigator, but we can add a subtitle
          <Text style={styles.screenSubtitle}>Showing services for <Text style={{fontWeight: 'bold'}}>{clinicName}</Text></Text>
        }
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.mutedForeground} />
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: 50,
  },
  screenSubtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.mutedForeground,
  },
  errorTextTitle: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIconContainer: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  cardRightContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cardPrice: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  }
}); 
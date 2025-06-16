import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../components';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// Define the structure of a Clinic object
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string; // Assuming city and province are available
  province: string;
}

type ClinicSelectionNavigationProp = NavigationProp<AppointmentStackParamList, 'ClinicSelection'>;

export const ClinicSelectionScreen = () => {
  const navigation = useNavigation<ClinicSelectionNavigationProp>();
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
      const response = await fetch(`${backendUrl}/api/v1/public/clinics`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch clinics.');
      }
      
      setClinics(data.data || []);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleSelectClinic = (clinic: Clinic) => {
    navigation.navigate('ServiceSelection', {
      clinicId: clinic.id,
      clinicName: clinic.name,
    });
  };

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity onPress={() => handleSelectClinic(item)} style={styles.clinicCard}>
      <View style={styles.cardIconContainer}>
        <Ionicons name="business-outline" size={32} color={theme.colors.primary} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.address}</Text>
        <Text style={styles.cardLocation}>{`${item.city}, ${item.province}`}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Clinics...</Text>
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
        data={clinics}
        renderItem={renderClinicItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.screenTitle}>Find a Clinic</Text>
        }
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.placeholderText}>No clinics are available at this time.</Text>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm, // Less padding at top since title is here
    paddingBottom: theme.spacing.xl,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: 50, // To push it down a bit
  },
  screenTitle: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs, // Align with dashboard's welcome text
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  errorTextTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg, // Consistent with dashboard cards
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardIconContainer: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.primaryMuted,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full, // Circular background for icon
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  cardLocation: {
    fontSize: theme.typography.caption,
    fontWeight: '500',
    color: theme.colors.secondary, // Use an accent color for location
  },
}); 
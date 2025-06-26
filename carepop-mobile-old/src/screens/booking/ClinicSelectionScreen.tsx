import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Search } from 'lucide-react-native';

import { theme } from '../../components/theme';
import { getPublicClinics } from '../../services/api';
import { Clinic } from '../../lib/types';
import { BookingStackParamList } from '../../navigation/BookingNavigator';
import { Card } from '../../components/card.native';

type ClinicSelectionNavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  'ClinicSelection'
>;

export default function ClinicSelectionScreen() {
  const navigation = useNavigation<ClinicSelectionNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: clinics,
    isLoading,
    isError,
    error,
  } = useQuery<Clinic[], Error>({
    queryKey: ['publicClinics'],
    queryFn: getPublicClinics,
  });

  const filteredClinics = useMemo(() => {
    if (!clinics) return [];
    return clinics.filter(clinic =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clinics, searchQuery]);

  const handleSelectClinic = (clinicId: string) => {
    navigation.navigate('ServiceSelection', { clinicId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Error fetching clinics: {error?.message || 'An unknown error occurred'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Clinic</Text>
        <Text style={styles.subtitle}>Step 1 of 4</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={theme.colors.mutedForeground} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a clinic..."
          placeholderTextColor={theme.colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredClinics}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectClinic(item.id)}>
            <Card style={styles.clinicCard}>
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.addressContainer}>
                  <MapPin color={theme.colors.primary} size={14} />
                  <Text style={styles.cardAddress}>
                    {`${item.address?.street}, ${item.address?.city}`}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clinics found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.foreground,
    height: 48,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  clinicCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  cardAddress: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
}); 
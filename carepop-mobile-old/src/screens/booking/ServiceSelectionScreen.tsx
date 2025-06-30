import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, ChevronDown, Check } from 'lucide-react-native';
import Popover from 'react-native-popover-view';

import { theme } from '../../components/theme';
import { getPublicServices, getPublicServiceCategories } from '../../services/api';
import { ServiceWithCategory, ServiceCategory } from '../../lib/types';
import { BookingStackParamList } from '../../navigation/BookingNavigator';
import { Card } from '../../components/card.native';

type ServiceSelectionRouteProp = RouteProp<BookingStackParamList, 'ServiceSelection'>;
type ServiceSelectionNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'ServiceSelection'>;

export default function ServiceSelectionScreen() {
  const navigation = useNavigation<ServiceSelectionNavigationProp>();
  // REMOVED: No longer need route or clinicId at this step
  // const route = useRoute<ServiceSelectionRouteProp>();
  // const { clinicId } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Fetch ALL public services, not filtered by clinic
  const {
    data: services,
    isLoading: isLoadingServices,
    isError: isErrorServices,
    error: errorServices,
  } = useQuery<ServiceWithCategory[], Error>({
    queryKey: ['publicServices'], // Query key is no longer dependent on clinicId
    queryFn: () => getPublicServices(), // Fetch all services
  });

  // Fetch all service categories for the filter dropdown
  const { data: categories } = useQuery<ServiceCategory[], Error>({
    queryKey: ['serviceCategories'],
    queryFn: getPublicServiceCategories,
  });

  const filteredServices = useMemo(() => {
    if (!services) return [];
    let tempServices = services;

    if (selectedCategoryId !== 'all') {
      tempServices = tempServices.filter(
        service => service.serviceCategory?.id === selectedCategoryId
      );
    }

    return tempServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery, selectedCategoryId]);
  
  const handleSelectService = (serviceId: string) => {
    // CORRECTED: Navigate to ClinicSelection, passing the chosen serviceId
    navigation.navigate('ClinicSelection', { serviceId });
  };

  const renderLoading = () => (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </SafeAreaView>
  );

  const renderError = (message: string) => (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>{message}</Text>
    </SafeAreaView>
  );

  if (isLoadingServices) {
    return renderLoading();
  }

  if (isErrorServices) {
    return renderError(`Error fetching services: ${errorServices?.message || 'An unknown error occurred'}`);
  }

  const allCategories = [{ id: 'all', name: 'All Categories' }, ...(categories || [])];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Service</Text>
        <Text style={styles.subtitle}>Step 1 of 4</Text>
      </View>

      <View style={styles.filtersContainer}>
        {/* Search Input */}
        <View style={[styles.inputContainer, { flex: 2, marginRight: theme.spacing.md }]}>
          <Search color={theme.colors.mutedForeground} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={theme.colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Popover Select */}
        <Popover
          isVisible={showCategoryPicker}
          onRequestClose={() => setShowCategoryPicker(false)}
          from={(
            <TouchableOpacity onPress={() => setShowCategoryPicker(true)} style={[styles.inputContainer, { flex: 1.5 }]}>
              <Text style={styles.popoverTriggerText} numberOfLines={1}>
                {allCategories.find(c => c.id === selectedCategoryId)?.name}
              </Text>
              <ChevronDown color={theme.colors.mutedForeground} size={20} />
            </TouchableOpacity>
          )}
        >
          <View style={styles.popoverContent}>
            {allCategories.map(cat => (
              <TouchableOpacity key={cat.id} onPress={() => { setSelectedCategoryId(cat.id); setShowCategoryPicker(false); }}>
                <View style={styles.popoverItem}>
                  <Text style={styles.popoverItemText}>{cat.name}</Text>
                  {selectedCategoryId === cat.id && <Check color={theme.colors.primary} size={16} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Popover>
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectService(item.id)}>
            <Card style={styles.serviceCard}>
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>
                  {item.serviceCategory?.name || 'Uncategorized'}
                </Text>
                <Text style={styles.cardPrice}>
                  ₱{Number(item.price).toFixed(2)}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Reuse styles from ClinicSelectionScreen and add new ones
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg },
  title: { ...theme.typography.h2, color: theme.colors.foreground },
  subtitle: { ...theme.typography.body, color: theme.colors.mutedForeground, marginTop: theme.spacing.xs },
  filtersContainer: { flexDirection: 'row', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 48,
  },
  inputIcon: { marginRight: theme.spacing.md },
  searchInput: { flex: 1, ...theme.typography.body, color: theme.colors.foreground },
  popoverTriggerText: { flex: 1, ...theme.typography.body, color: theme.colors.foreground },
  popoverContent: { padding: theme.spacing.sm, backgroundColor: theme.colors.card, borderRadius: theme.radius.md },
  popoverItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  popoverItemText: { ...theme.typography.body, color: theme.colors.foreground },
  listContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  serviceCard: { marginBottom: theme.spacing.md, padding: theme.spacing.lg },
  cardTitle: { ...theme.typography.h4, fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.foreground, marginBottom: theme.spacing.xs },
  cardCategory: { ...theme.typography.small, color: theme.colors.mutedForeground, fontFamily: theme.typography.fontFamilyMedium, marginBottom: theme.spacing.sm },
  cardPrice: { ...theme.typography.body, color: theme.colors.primary, fontFamily: theme.typography.fontFamilySemiBold },
  errorText: { ...theme.typography.body, color: theme.colors.destructive, textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { ...theme.typography.body, color: theme.colors.mutedForeground },
}); 
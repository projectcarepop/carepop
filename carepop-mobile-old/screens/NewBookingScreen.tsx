import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { getPublicClinics, getPublicServices, getPublicServiceCategories } from '../src/services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stethoscope, MapPin, CheckCircle, ChevronRight, Search } from 'lucide-react-native';
import { theme, Button } from '../src/components';
import { BookingStackParamList } from '../src/navigation/AppNavigator';
import type { Clinic, Service, ServiceCategory } from '../src/lib/types';

type NewBookingNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'BookAppointment'>;

export const NewBookingScreen: React.FC = () => {
  const navigation = useNavigation<NewBookingNavigationProp>();
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [serviceSearchText, setServiceSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: clinics, isLoading: loadingClinics } = useQuery({
    queryKey: ['publicClinics'],
    queryFn: getPublicClinics,
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['publicServices', selectedClinic?.id],
    queryFn: () => getPublicServices(selectedClinic!.id),
    enabled: !!selectedClinic,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
      queryKey: ['serviceCategories'],
      queryFn: getPublicServiceCategories
  });

  const handleSelectClinic = (clinic: Clinic) => {
    if (selectedClinic?.id === clinic.id) {
        setSelectedClinic(null);
        setSelectedService(null);
        setSelectedCategoryId(null);
    } else {
        setSelectedClinic(clinic);
        setSelectedService(null);
        setSelectedCategoryId(null);
    }
  };

  const filteredClinics = useMemo(() => {
    if (!clinics) return [];
    return clinics.filter((clinic) =>
      clinic.name.toLowerCase().includes(clinicSearchQuery.toLowerCase())
    );
  }, [clinics, clinicSearchQuery]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    // First, filter by the selected category
    const servicesByCategory = selectedCategoryId
      ? services.filter((service) => (service as any).categoryId === selectedCategoryId)
      : services;

    // Second, filter by the search text
    const servicesBySearch = serviceSearchText
      ? servicesByCategory.filter((service) =>
          service.name.toLowerCase().includes(serviceSearchText.toLowerCase())
        )
      : servicesByCategory;

      return servicesBySearch;
  }, [services, selectedCategoryId, serviceSearchText]);

  const handleNext = () => {
    if (selectedClinic && selectedService) {
      navigation.navigate('SelectDateTime', { clinicId: selectedClinic.id, serviceId: selectedService.id });
    }
  };

  const SelectionCard = ({
    item,
    Icon,
    isSelected,
    onPress,
    disabled = false,
  }: {
    item: any;
    Icon: React.ElementType;
    isSelected: boolean;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.card,
        styles.cardShadow,
        isSelected && styles.selectedCard,
        disabled && styles.disabledCard,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon
        color={isSelected ? theme.colors.primary : theme.colors.foreground}
        size={24}
        style={styles.cardIcon}
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {'address' in item && item.address && (
          <Text style={styles.cardSubtitle}>
            {(item.address as any)?.street}, {(item.address as any)?.city}
          </Text>
        )}
      </View>
      {isSelected ? (
        <CheckCircle color={theme.colors.primary} size={22} />
      ) : (
        <ChevronRight color={theme.colors.mutedForeground} size={22} />
      )}
    </TouchableOpacity>
  );

  if (loadingClinics) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Clinics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
            <Text style={styles.greetingText}>Hi, {user?.user_metadata?.first_name || 'User'}!</Text>
            <Text style={styles.headerTitle}>Let&apos;s book your visit</Text>
        </View>

        <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.activeStep]}>
                <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step, selectedClinic && styles.activeStep]}>
                <Text style={styles.stepText}>2</Text>
            </View>
             <View style={styles.stepLine} />
            <View style={[styles.step, selectedService && styles.activeStep]}>
                <Text style={styles.stepText}>3</Text>
            </View>
        </View>

        <Text style={styles.sectionTitle}>1. Choose a Clinic</Text>
        <View style={styles.searchContainer}>
          <Search color={theme.colors.mutedForeground} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a clinic..."
            placeholderTextColor={theme.colors.mutedForeground}
            value={clinicSearchQuery}
            onChangeText={setClinicSearchQuery}
          />
        </View>
        {filteredClinics?.map((clinic) => (
          <SelectionCard
            key={clinic.id}
            item={clinic}
            Icon={MapPin}
            isSelected={selectedClinic?.id === clinic.id}
            onPress={() => handleSelectClinic(clinic)}
          />
        ))}

        <View style={styles.serviceSection}>
          <Text style={[styles.sectionTitle, !selectedClinic && styles.disabledText]}>
            2. Choose a Service
          </Text>

          {selectedClinic && (
            <>
                {loadingCategories ? <ActivityIndicator color={theme.colors.primary} /> : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
                        <TouchableOpacity
                            style={[styles.categoryChip, !selectedCategoryId && styles.selectedCategoryChip]}
                            onPress={() => setSelectedCategoryId(null)}
                        >
                            <Text style={[styles.categoryText, !selectedCategoryId && styles.selectedCategoryText]}>All</Text>
                        </TouchableOpacity>
                        {categories?.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryChip, selectedCategoryId === cat.id && styles.selectedCategoryChip]}
                                onPress={() => setSelectedCategoryId(cat.id)}
                            >
                                <Text style={[styles.categoryText, selectedCategoryId === cat.id && styles.selectedCategoryText]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                <View style={styles.searchContainer}>
                    <Search color={theme.colors.mutedForeground} size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a service..."
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={serviceSearchText}
                        onChangeText={setServiceSearchText}
                    />
                </View>
            </>
          )}
          
          {loadingServices && selectedClinic ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }}/>
          ) : (filteredServices && filteredServices.length > 0) ? (
            filteredServices.map((service) => (
              <SelectionCard
                key={service.id}
                item={service}
                Icon={Stethoscope}
                isSelected={selectedService?.id === service.id}
                onPress={() => setSelectedService(service)}
                disabled={!selectedClinic}
              />
            ))
          ) : (
            selectedClinic && (
                <Text style={styles.placeholderText}>
                    No services found for this clinic.
                </Text>
            )
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          title="Next: Select Date & Time"
          disabled={!selectedClinic || !selectedService}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.md, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  header: {
      marginBottom: theme.spacing.lg,
  },
  greetingText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  headerTitle: { 
      ...theme.typography.h1,
      fontFamily: theme.typography.fontFamilyBold,
  },
  stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
  },
  step: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.muted,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
  },
  activeStep: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
  },
  stepText: {
      ...theme.typography.body,
      fontFamily: theme.typography.fontFamilySemiBold,
      color: theme.colors.primaryForeground,
  },
  stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamilySemiBold,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.card,
  },
   disabledCard: {
    backgroundColor: theme.colors.muted,
    opacity: 0.6,
  },
  disabledText: {
    color: theme.colors.mutedForeground,
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  serviceSection: {
    minHeight: 100, // To avoid layout shifts
  },
  cardIcon: {
      marginRight: theme.spacing.md
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
  },
  cardSubtitle: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.foreground,
  },
  categoryContainer: {
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.sm,
  },
  categoryChip: {
      backgroundColor: theme.colors.muted,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
  },
  selectedCategoryChip: {
      backgroundColor: theme.colors.primary,
  },
  categoryText: {
      ...theme.typography.small,
      color: theme.colors.foreground,
      fontFamily: theme.typography.fontFamilyMedium
  },
  selectedCategoryText: {
      color: theme.colors.primaryForeground,
  },
}); 
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getPublicClinicDetails } from '../../services/api';
import { theme } from '../../components/theme';
import { MapPin, Tag, ChevronLeft, Phone, Globe, Search, User, Stethoscope, Clock, Navigation, AlertTriangle } from 'lucide-react-native';
import { Clinic } from '../../lib/types';
import { Card } from '../../components/card.native';
import { Button } from '../../components/button.native';

// === HELPER FUNCTIONS ===
const formatClinicAddress = (clinic: Clinic): string => {
  // Cast to any to access all possible address field variations
  const c = clinic as any;
  
  // Option 1: Use full_address if available (Supabase format)
  if (c.full_address) {
    return c.full_address;
  }
  
  // Option 2: Build from individual Supabase fields
  if (c.street_address || c.locality || c.region) {
    const parts = [c.street_address, c.locality, c.region].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  // Option 3: Handle address as JSONB object (Drizzle format)
  if (c.address && typeof c.address === 'object') {
    const addr = c.address;
    const parts = [
      addr.street, 
      addr.city || addr.cityMunicipality, 
      addr.province,
      addr.barangay,
      addr.zip || addr.zipCode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  // Option 4: Handle individual address fields (legacy format)
  if (c.street || c.cityMunicipality) {
    const cityName = typeof c.cityMunicipality === 'string' 
      ? c.cityMunicipality 
      : c.cityMunicipality?.name;
    const provinceName = typeof c.province === 'string'
      ? c.province
      : c.province?.name;
    const parts = [c.street, cityName, provinceName, c.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  return 'Address not available';
};

// This defines the parameters that will be passed to this screen.
type RootStackParamList = {
  ClinicDetail: { clinicId: string };
};

type ClinicDetailScreenRouteProp = RouteProp<RootStackParamList, 'ClinicDetail'>;

export function ClinicDetailScreen() {
  const route = useRoute<ClinicDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { clinicId } = route.params;
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clinic, isLoading, isError, error } = useQuery({
    queryKey: ['clinicDetails', clinicId],
    queryFn: () => getPublicClinicDetails(clinicId),
    enabled: !!clinicId,
  });

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!clinic?.services) return [];
    if (!searchTerm.trim()) return clinic.services;
    
    return clinic.services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clinic?.services, searchTerm]);

  // Event handlers with useCallback for performance
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePhoneCall = useCallback((phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  }, []);

  const handleWebsiteOpen = useCallback((website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website');
      }
    });
  }, []);

  const handleGetDirections = useCallback(() => {
    if (!clinic) return;
    
    const c = clinic as any;
    let directionsUrl = '';
    
    if (c?.latitude && c?.longitude) {
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`;
    } else {
      const address = formatClinicAddress(clinic);
      directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ', ' + address)}`;
    }
    
    Linking.canOpenURL(directionsUrl).then(supported => {
      if (supported) {
        Linking.openURL(directionsUrl);
      } else {
        Alert.alert('Error', 'Unable to open directions');
      }
    });
  }, [clinic]);

  const handleBookAppointment = useCallback((doctorId: string) => {
    (navigation as any).navigate('BookAppointment', { clinicId, doctorId });
  }, [navigation, clinicId]);

  // Components with React.memo for performance

  const QuickInfoSection = React.memo(() => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Clock size={24} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>Quick Information</Text>
      </View>
      <View style={styles.quickInfoGrid}>
        <View style={styles.quickInfoItem}>
          <Text style={styles.quickInfoLabel}>Operating Hours</Text>
          <Text style={styles.quickInfoValue}>Mon-Fri: 8:00 AM - 6:00 PM</Text>
          <Text style={styles.quickInfoValue}>Sat: 8:00 AM - 4:00 PM</Text>
          <Text style={styles.quickInfoValue}>Sun: Closed</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Text style={styles.quickInfoLabel}>Services Available</Text>
          <Text style={styles.quickInfoValue}>
            {clinic?.services?.length || 0} services offered
          </Text>
        </View>
        {((clinic as any)?.phone || (clinic as any)?.website) && (
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Contact</Text>
            {(clinic as any)?.phone && (
              <TouchableOpacity onPress={() => handlePhoneCall((clinic as any).phone)}>
                <Text style={[styles.quickInfoValue, styles.linkText]}>{(clinic as any).phone}</Text>
              </TouchableOpacity>
            )}
            {(clinic as any)?.website && (
              <TouchableOpacity onPress={() => handleWebsiteOpen((clinic as any).website)}>
                <Text style={[styles.quickInfoValue, styles.linkText]}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  ));
  QuickInfoSection.displayName = 'QuickInfoSection';

  const ServicesSection = React.memo(() => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Stethoscope size={24} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>Services Offered</Text>
      </View>
      {clinic?.services && clinic.services.length > 0 && (
        <View style={styles.searchContainer}>
          <Search size={16} color={theme.colors.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={theme.colors.secondary}
          />
        </View>
      )}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <Tag size={20} color={theme.colors.primary} style={styles.serviceIcon} />
            <View style={styles.serviceInfo}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{item.name}</Text>
                {item.serviceCategory && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.serviceCategory.name}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.serviceDescription}>{item.description}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No services match your search.' : 'No services listed for this clinic.'}
            </Text>
          </View>
        }
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />
    </View>
  ));
  ServicesSection.displayName = 'ServicesSection';

  const DoctorsSection = React.memo(() => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <User size={24} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>Our Doctors</Text>
      </View>
      {(clinic as any)?.doctors && (clinic as any).doctors.length > 0 ? (
        <FlatList
          data={(clinic as any).doctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.doctorCard}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.fullName}</Text>
                <Text style={styles.doctorSpecialty}>
                  {item.specialtyText || 'General Medicine'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookAppointment(item.id)}
              >
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
          nestedScrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <User size={48} color={theme.colors.secondary} />
          <Text style={styles.emptyText}>No specific doctors are listed for this clinic.</Text>
          <Text style={styles.emptySubtext}>
            Please call the clinic directly for information about available doctors.
          </Text>
        </View>
      )}
    </View>
  ));
  DoctorsSection.displayName = 'DoctorsSection';

  const EmergencyNotice = React.memo(() => (
    <View style={styles.emergencyNotice}>
      <AlertTriangle size={16} color={theme.colors.destructive} />
      <View style={styles.emergencyContent}>
        <Text style={styles.emergencyTitle}>Emergency Notice</Text>
        <Text style={styles.emergencyText}>
          For medical emergencies, please call 911 or go to the nearest emergency room immediately.
        </Text>
      </View>
    </View>
  ));
  EmergencyNotice.displayName = 'EmergencyNotice';

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading clinic details:</Text>
        <Text style={styles.errorText}>{error?.message || "An unknown error occurred."}</Text>
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Clinic Not Found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <ChevronLeft size={24} color={theme.colors.primary} />
                <Text style={styles.backButtonText}>Back to Finder</Text>
            </TouchableOpacity>
        </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
            <MapPin size={48} color={theme.colors.primary} style={styles.icon} />
            <Text style={styles.title}>{clinic.name}</Text>
          <Text style={styles.address} numberOfLines={2}>
            {formatClinicAddress(clinic)}
            </Text>
        </View>

        <View style={styles.content}>
          <QuickInfoSection />
          <ServicesSection />
          <DoctorsSection />
          <EmergencyNotice />
                    </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  toolbar: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  address: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  servicesTitle: {
      ...theme.typography.h3,
      paddingHorizontal: theme.spacing.xl,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
  },
  listContentContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
  },
  serviceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
  },
  serviceIcon: {
      marginRight: theme.spacing.lg,
  },
  serviceInfo: {
      flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  serviceName: {
      ...theme.typography.h4,
      color: theme.colors.foreground
  },
  serviceDescription: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  categoryBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  categoryText: {
    ...theme.typography.small,
    color: theme.colors.secondaryForeground,
    fontWeight: 'bold',
  },
  servicePrice: {
      ...theme.typography.h4,
      color: theme.colors.primary,
  },
  emptyContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginLeft: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.primary,
  },
  quickInfoGrid: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  quickInfoItem: {
    marginBottom: theme.spacing.md,
  },
  quickInfoLabel: {
    ...theme.typography.small,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  quickInfoValue: {
    ...theme.typography.small,
    color: theme.colors.foreground,
  },
  directionsButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  directionsButtonText: {
    ...theme.typography.body,
    color: theme.colors.primaryForeground,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.foreground,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.xs,
  },
  doctorSpecialty: {
    ...theme.typography.small,
    color: theme.colors.primary,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  bookButtonText: {
    ...theme.typography.small,
    color: theme.colors.primaryForeground,
    fontWeight: 'bold',
  },
  emptySubtext: {
    ...theme.typography.small,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  emergencyNotice: {
    backgroundColor: '#fef2f2',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.md,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  emergencyTitle: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.destructive,
    marginBottom: theme.spacing.xs,
  },
  emergencyText: {
    ...theme.typography.small,
    color: theme.colors.destructive,
  },
}); 
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getPublicClinicDetails } from '../../services/api';
import { theme } from '../../components/theme';
import { MapPin, Tag, ChevronLeft } from 'lucide-react-native';

// This defines the parameters that will be passed to this screen.
type RootStackParamList = {
  ClinicDetail: { clinicId: string };
};

type ClinicDetailScreenRouteProp = RouteProp<RootStackParamList, 'ClinicDetail'>;

export function ClinicDetailScreen() {
  const route = useRoute<ClinicDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { clinicId } = route.params;

  const { data: clinic, isLoading, isError, error } = useQuery({
    queryKey: ['clinicDetails', clinicId],
    queryFn: () => getPublicClinicDetails(clinicId),
    enabled: !!clinicId,
  });

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ChevronLeft size={24} color={theme.colors.primary} />
                <Text style={styles.backButtonText}>Back to Finder</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
            <MapPin size={48} color={theme.colors.primary} style={styles.icon} />
            <Text style={styles.title}>{clinic.name}</Text>
            <Text style={styles.address}>
                {clinic.address?.street}, {clinic.address?.barangay}, {clinic.address?.city} {clinic.address?.zip}
            </Text>
        </View>

        <Text style={styles.servicesTitle}>Services Offered</Text>

        <FlatList
            data={clinic.services}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.serviceCard}>
                    <Tag size={20} color={theme.colors.primary} style={styles.serviceIcon} />
                    <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{item.name}</Text>
                        <Text style={styles.serviceDescription}>{item.description}</Text>
                    </View>
                    {item.serviceCategory && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{item.serviceCategory.name}</Text>
                        </View>
                    )}
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No services listed for this clinic.</Text>
                </View>
            }
            contentContainerStyle={styles.listContentContainer}
        />
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
    alignSelf: 'flex-start',
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
  }
}); 
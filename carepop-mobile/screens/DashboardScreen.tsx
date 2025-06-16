import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Button, Card, theme } from '../src/components';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import Constants from 'expo-constants';

interface HealthService {
  id: string;
  name: string;
  // This is a placeholder for an icon name. We'd need a mapping from service type/name to an icon.
  iconName: keyof typeof MaterialIcons.glyphMap; 
}

// Function to map service names to icons, placeholder logic for now
const getIconForService = (serviceName: string): keyof typeof MaterialIcons.glyphMap => {
  const name = serviceName.toLowerCase();
  if (name.includes('family planning')) return 'group';
  if (name.includes('contraceptive')) return 'medication';
  if (name.includes('iud')) return 'woman';
  if (name.includes('prenatal')) return 'pregnant-woman';
  if (name.includes('pap smear')) return 'healing';
  if (name.includes('hiv')) return 'bloodtype';
  if (name.includes('gender-affirming')) return 'transgender';
  return 'medical-services'; // Default icon
};

// Define props, including navigation
interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { profile, isLoading: isAuthLoading, session } = useAuth();
  const [services, setServices] = useState<HealthService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  const displayName = profile?.first_name || profile?.username || 'User';

  const fetchHealthServices = useCallback(async () => {
    if (!session) return;
    setIsLoadingServices(true);
    const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;

    try {
      const response = await fetch(`${backendUrl}/api/v1/public/services`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch services.');

      const mappedServices = data.data.map((service: any) => ({
        ...service,
        iconName: getIconForService(service.name),
      }));
      setServices(mappedServices);

    } catch (error: any) {
      Alert.alert('Error', `Could not load health services: ${error.message}`);
    } finally {
      setIsLoadingServices(false);
    }
  }, [session]);

  useEffect(() => {
    fetchHealthServices();
  }, [fetchHealthServices]);

  const renderServiceItem = ({ item }: { item: HealthService }) => (
    <TouchableOpacity 
      style={styles.serviceItemBox}
      onPress={() => navigation.navigate('Appointments', { 
          screen: 'ServiceSelection', // Navigate to the beginning of the booking flow
          params: { serviceId: item.id, serviceName: item.name } // Pass initial service info
      })}
    >
      <MaterialIcons name={item.iconName} size={32} color={theme.colors.primary} style={styles.serviceItemIcon} />
      <Text style={styles.serviceItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>
        {isAuthLoading ? 'Loading...' : `Welcome back, ${displayName}!`}
      </Text>

      {/* Upcoming Appointment Card - Still static for now */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Appointment</Text>
        <Text style={styles.cardContent}>No upcoming appointments scheduled.</Text>
        <Button 
          title="Book Now" 
          variant="secondary" 
          styleType="solid" 
          style={styles.cardButton}
          onPress={() => navigation.navigate('Appointments')}
        />
      </Card>

      {/* Health Services Card - Now dynamic */}
      <Card style={styles.card}> 
        <View style={styles.cardTitleContainer}>
          <MaterialIcons name="medical-services" size={24} color={theme.colors.secondary} style={styles.cardTitleIcon} />
          <Text style={styles.cardTitle}>Health Services</Text>
        </View>
        {isLoadingServices ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }}/>
        ) : (
          <FlatList
            data={services}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.healthServicesContainer}
          />
        )}
      </Card>

      {/* Health Stats Summary Card - Unchanged for now */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Health Snapshot</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Heart Rate (BPM)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Steps Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Mood Level</Text>
          </View>
        </View>
        <Text style={styles.cardContentMuted}>Connect health apps to see your stats.</Text>
        <Button 
          title="Manage Trackers" 
          variant="secondary"
          styleType="outline" 
          style={styles.cardButton}
          onPress={() => navigation.navigate('HealthBuddy')}
        />
      </Card>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl, 
    paddingTop: theme.spacing.md,
  },
  logoutButton: {
    padding: theme.spacing.xs,
  },
  card: {
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md, 
      borderRadius: theme.borderRadius.lg, // Added default border radius here
  },
  cardTitleContainer: { // Container for icon + title
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitleIcon: { // Style for the icon next to title
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    // marginBottom removed as it's handled by container
    color: theme.colors.secondary, 
  },
  cardContent: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  cardContentMuted: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardButton: {
    marginTop: theme.spacing.sm, 
    alignSelf: 'flex-start', 
  },
  healthServicesContainer: {
    paddingVertical: theme.spacing.sm, // Add some vertical padding
    paddingLeft: theme.spacing.xs, // Optional: small padding at the start
    paddingRight: theme.spacing.md, // Ensure last item isn't cut off
  },
  serviceItemBox: {
    backgroundColor: theme.colors.background, // Match card background or use a subtle color
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md, // Space between items
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    width: 120, // Fixed width for items
    height: 110, // Fixed height for items
  },
  serviceItemIcon: {
    marginBottom: theme.spacing.sm,
  },
  serviceItemText: {
    fontSize: theme.typography.caption, // Smaller font size
    color: theme.colors.text,
    textAlign: 'center',
    // Allow for maybe 2 lines max
    height: theme.typography.caption * 2.5, // Adjust multiplier as needed
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs, 
  },
  statValue: {
    fontSize: theme.typography.heading - 2, 
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  welcomeText: { // Re-added style
    fontSize: theme.typography.subheading + 2, 
    fontWeight: '600', 
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
  },
}); 
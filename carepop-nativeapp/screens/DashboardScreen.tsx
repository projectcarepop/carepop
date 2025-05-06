import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { Button, Card, theme } from '@repo/ui';
import { getUserProfile } from '@repo/ui/src/utils/supabase';
import type { Profile } from '@repo/ui/src/utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';

// Define service data with icons
const healthServicesData = [
  { name: 'Family Planning Counseling', iconName: 'group' },
  { name: 'Contraceptive Pills/Injectables', iconName: 'medication' },
  { name: 'IUD Insertion/Removal', iconName: 'woman' }, // Example icon, choose appropriate
  { name: 'Prenatal Checkups', iconName: 'pregnant-woman' },
  { name: 'Pap Smear / Cervical Cancer Screening', iconName: 'healing' }, // Example icon
  { name: 'HIV Testing & Counseling', iconName: 'bloodtype' }, // Example icon
  { name: 'Gender-Affirming Care Counseling', iconName: 'transgender' }, // Example icon
];

// Define props, including navigation
interface DashboardScreenProps {
  navigation: any; // Add navigation prop type (consider using a more specific type from @react-navigation)
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const { profile: fetchedProfile, error } = await getUserProfile();
        if (error) {
          console.error("Error fetching profile:", error.message);
          // Optionally show error to user
        } else {
          setProfile(fetchedProfile);
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Use first_name if available, fallback to 'User'
  const displayName = profile?.first_name || 'User';

  // Render function for each service item in the carousel
  const renderServiceItem = ({ item }: { item: typeof healthServicesData[0] }) => (
    <TouchableOpacity 
      style={styles.serviceItemBox}
      onPress={() => navigation.navigate('Make Appointment', { 
          screen: 'ServiceBooking', 
          params: { serviceName: item.name } 
      })}
    >
      <MaterialIcons name={item.iconName as any} size={32} color={theme.colors.primary} style={styles.serviceItemIcon} />
      <Text style={styles.serviceItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome Message */}
      <Text style={styles.welcomeText}>
        {isLoadingProfile ? 'Loading...' : `Welcome back, ${displayName}!`}
      </Text>

      {/* Upcoming Appointment Card */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Appointment</Text>
        <Text style={styles.cardContent}>No upcoming appointments scheduled.</Text>
        <Button 
          title="Book Now" 
          variant="secondary" 
          styleType="solid" 
          style={styles.cardButton}
          onPress={() => navigation.navigate('Make Appointment')}
        />
      </Card>

      {/* Health Services Card - Carousel */}
      <Card style={styles.card}> 
        <View style={styles.cardTitleContainer}>
          <MaterialIcons name="medical-services" size={24} color={theme.colors.secondary} style={styles.cardTitleIcon} />
          <Text style={styles.cardTitle}>Health Services</Text>
        </View>
        <FlatList
          data={healthServicesData}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.name}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.healthServicesContainer} // Use for padding
        />
      </Card>

      {/* Health Stats Summary Card */}
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
          onPress={() => navigation.navigate('Health Buddy')}
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
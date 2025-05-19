import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Import Card and Button if needed
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Added Ionicons for more icon choices

// Define param list for navigation type safety (if possible)
// Consider creating a dedicated HealthBuddyStackParamList if not already done
type HealthBuddyNavigationProp = NavigationProp<{
  PillTrackerScreen: undefined; // Assuming this is the screen name
  MensTrackerScreen: undefined; // Assuming this is the screen name
  LogBloodPressureScreen: undefined; // Assuming this is the screen name
  // Add routes for Comorbidities and Allergies if screens exist
}>;

export function HealthBuddyScreen() { // Remove navigation prop if using hook
  const navigation = useNavigation<HealthBuddyNavigationProp>(); // Use the hook

  // TODO: Add state and logic for tracking data

  // Helper function to create a section with icon and title
  const renderSectionHeader = (title: string, iconName: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap, iconSet: 'MaterialIcons' | 'Ionicons' = 'MaterialIcons') => (
    <View style={styles.cardTitleContainer}>
      {iconSet === 'MaterialIcons' ? (
        <MaterialIcons name={iconName as any} size={22} color={theme.colors.secondary} style={styles.cardTitleIcon} />
      ) : (
        <Ionicons name={iconName as any} size={22} color={theme.colors.secondary} style={styles.cardTitleIcon} />
      )}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Your Health Buddy</Text>
        <Text style={styles.screenSubtitle}>Trackers and insights to support your well-being.</Text>

        {/* Pill Tracker Section - Updated onPress */}
        <Card style={styles.card}>
          {renderSectionHeader("Pill Tracker", "medical-services")}
          <Text style={styles.cardContent}>Stay on top of your medication schedule. Log doses and set reminders.</Text>
          <Button 
            title="Manage Pill Tracker"
            variant="secondary"
            styleType="solid"
            onPress={() => navigation.navigate('PillTrackerScreen')} // Navigate to PillTrackerScreen
            style={styles.cardButton}
            icon={<MaterialIcons name="arrow-forward" size={16} color={theme.colors.background} />}
          />
        </Card>

        {/* Menstrual Tracker Section - Updated onPress */}
        <Card style={styles.card}>
          {renderSectionHeader("Menstrual Cycle", "female", "Ionicons")}
          <Text style={styles.cardContent}>Track your cycle, log symptoms, and view predictions.</Text> 
          {/* Removed hardcoded date */}
          <Button 
            title="Manage Menstrual Tracker"
            variant="secondary"
            styleType="solid"
            onPress={() => navigation.navigate('MensTrackerScreen')} // Navigate to MensTrackerScreen
            style={styles.cardButton}
            icon={<MaterialIcons name="arrow-forward" size={16} color={theme.colors.background} />}
          />
        </Card>

        {/* ADDED Comorbidities Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Comorbidities", "list-alt", "MaterialIcons")}
          <Text style={styles.cardContent}>Log and manage any existing health conditions.</Text>
          {/* TODO: Add onPress navigation when screen exists */}
          <Button 
            title="Log Comorbidities"
            variant="secondary"
            styleType="outline"
            onPress={() => { Alert.alert('Coming Soon', 'Ability to log comorbidities is under development.'); }}
            style={styles.cardButton}
            icon={<Ionicons name="add-circle-outline" size={16} color={theme.colors.secondary} />}
          />
        </Card>

        {/* ADDED Allergies Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Allergies", "warning-amber", "MaterialIcons")}
          <Text style={styles.cardContent}>Keep track of your known allergies.</Text>
          {/* TODO: Add onPress navigation when screen exists */}
          <Button 
            title="Log Allergies"
            variant="secondary"
            styleType="outline"
            onPress={() => { Alert.alert('Coming Soon', 'Ability to log allergies is under development.'); }}
            style={styles.cardButton}
            icon={<Ionicons name="add-circle-outline" size={16} color={theme.colors.secondary} />}
          />
        </Card>

        {/* Blood Pressure Tracker Section - Updated onPress */}
        <Card style={styles.card}>
          {renderSectionHeader("Blood Pressure", "favorite-border")}
          <Text style={styles.cardContent}>Monitor your blood pressure regularly.</Text>
          {/* Removed last reading text */}
          <Button 
            title="Log New Reading" 
            variant="secondary"
            styleType="outline"
            onPress={() => navigation.navigate('LogBloodPressureScreen')} // Navigate to LogBloodPressureScreen
            style={styles.cardButton}
            icon={<MaterialIcons name="add-circle-outline" size={16} color={theme.colors.secondary} />}
          />
        </Card>

        {/* Health Insights Section - Kept as is */}
        <Card style={styles.card}>
          {renderSectionHeader("Health Insights", "lightbulb-outline")}
          {/* Placeholder insights */}
          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.success} style={styles.insightIcon} />
            <Text style={styles.insightText}>Placeholder health insight 1.</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} style={styles.insightIcon} />
            <Text style={styles.insightText}>Placeholder health insight 2.</Text>
          </View>
           <View style={styles.insightItem}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} style={styles.insightIcon} />
            <Text style={styles.insightText}>Placeholder health insight 3.</Text>
          </View>
        </Card>

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
    flexGrow: 1, // Use flexGrow for ScrollView content
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl, 
  },
  screenTitle: { // Similar to welcomeText in Dashboard
    fontSize: theme.typography.subheading + 2, 
    fontWeight: '600', 
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm, // Consistent with Dashboard's welcomeText
  },
  screenSubtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md, 
    borderRadius: theme.borderRadius.lg, 
  },
  cardTitleContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitleIcon: { 
    marginRight: theme.spacing.sm,
  },
  cardTitle: { // Consistent with Dashboard
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.secondary, 
  },
  cardContent: { // Consistent with Dashboard
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.body * 1.4, // Improved readability
  },
  cardContentMuted: { // Consistent with Dashboard
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardButton: { // Consistent with Dashboard
    marginTop: theme.spacing.sm, 
    alignSelf: 'flex-start', 
  },
  statsContainer: { // From Dashboard
    flexDirection: 'row',
    justifyContent: 'space-around', // Or 'flex-start' if preferred with spacing
    marginBottom: theme.spacing.md, // Space before contentMuted or next element
  },
  statItem: { // From Dashboard
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm, // Add some padding between items
  },
  statValue: { // From Dashboard
    fontSize: theme.typography.heading - 2, 
    fontWeight: 'bold',
    color: theme.colors.primary, // Or theme.colors.secondary for variation
  },
  statLabel: { // From Dashboard
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  insightIcon: {
    marginRight: theme.spacing.sm,
  },
  insightText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    flexShrink: 1, // Allow text to wrap
  },
}); 
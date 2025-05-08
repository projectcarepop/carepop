import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Import Card and Button if needed
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Added Ionicons for more icon choices

export function HealthBuddyScreen({ navigation }: any) {
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

        {/* Pill Tracker Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Pill Tracker", "medical-services")}
          <Text style={styles.cardContent}>Stay on top of your medication schedule. Log doses and set reminders.</Text>
          <Button 
            title="Manage Pill Tracker"
            variant="secondary"
            styleType="solid"
            onPress={() => navigation.navigate('PillTrackerHome')}
            style={styles.cardButton}
            icon={<MaterialIcons name="arrow-forward" size={16} color={theme.colors.background} />}
          />
        </Card>

        {/* Menstrual Tracker Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Menstrual Cycle", "female", "Ionicons")}
          <Text style={styles.cardContent}>Track your cycle, log symptoms, and view predictions. Current prediction: Oct 5, 2024</Text>
          <Button 
            title="Manage Menstrual Tracker"
            variant="secondary"
            styleType="solid"
            onPress={() => navigation.navigate('MensTrackerHome')}
            style={styles.cardButton}
            icon={<MaterialIcons name="arrow-forward" size={16} color={theme.colors.background} />}
          />
        </Card>

        {/* Activity Tracker Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Activity Goals", "directions-run")}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4,567</Text>
              <Text style={styles.statLabel}>Steps Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8,000</Text>
              <Text style={styles.statLabel}>Goal</Text>
            </View>
          </View>
          <Text style={styles.cardContentMuted}>Connect your fitness app for more details.</Text>
        </Card>

        {/* Blood Pressure Tracker Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Blood Pressure", "favorite-border")}
          <Text style={styles.cardContent}>Last reading: 125/82 mmHg (Sep 30). Monitor your blood pressure regularly.</Text>
          <Button 
            title="Log New Reading" 
            variant="secondary"
            styleType="outline"
            onPress={() => navigation.navigate('LogBloodPressure')}
            style={styles.cardButton}
            icon={<MaterialIcons name="add-circle-outline" size={16} color={theme.colors.secondary} />}
          />
        </Card>

        {/* Health Insights Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Health Insights", "lightbulb-outline")}
          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.success} style={styles.insightIcon} />
            <Text style={styles.insightText}>You have met your step goal 3 times this week!</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} style={styles.insightIcon} />
            <Text style={styles.insightText}>Consider scheduling a follow-up based on recent logs.</Text>
          </View>
           <View style={styles.insightItem}>
            <Ionicons name="alarm-outline" size={18} color={theme.colors.primary} style={styles.insightIcon} />
            <Text style={styles.insightText}>Remember to take your medication around 8:00 AM.</Text>
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
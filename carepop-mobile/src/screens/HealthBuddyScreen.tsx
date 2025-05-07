import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Import Card and Button if needed
import { MaterialIcons } from '@expo/vector-icons';

export function HealthBuddyScreen({ navigation }: any) {
  // TODO: Add state and logic for tracking data

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Pill Tracker Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Pill Tracker</Text>
          <Text style={styles.placeholderText}>Track your medication schedule.</Text>
          <Button 
            title="Go to Pill Tracker"
            onPress={() => navigation.navigate('PillTrackerHome')}
            style={styles.actionButton} 
          />
          {/* <Text style={styles.linkText}>View History</Text> */}
        </Card>

        {/* Menstrual Tracker Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Menstrual Cycle</Text>
          <Text style={styles.placeholderText}>Predicted period start: Oct 5, 2024</Text>
          <Button 
            title="Go to Menstrual Tracker"
            onPress={() => navigation.navigate('MensTrackerHome')}
            style={styles.actionButton} 
          />
          {/* <Text style={styles.linkText}>View Calendar</Text> */}
        </Card>

        {/* Activity Tracker Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Activity Tracker</Text>
          <Text style={styles.placeholderText}>Steps today: 4,567 / 8,000</Text>
          {/* Placeholder UI - Data might come from HealthKit/Google Fit */}
          <Text style={styles.linkText}>View Weekly Progress</Text>
        </Card>

        {/* Blood Pressure Tracker Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Blood Pressure</Text>
          <Text style={styles.placeholderText}>Last reading: 125/82 mmHg (Sep 30)</Text>
          {/* Placeholder UI */}
          <Button 
            title="Log New Reading" 
            onPress={() => navigation.navigate('LogBloodPressure')}
            style={styles.logButton}
            size='sm'
          />
          <Text style={styles.linkText}>View Chart</Text>
        </Card>

        {/* Health Insights Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          {/* Placeholder UI */}
          <Text style={styles.insightText}>- You've met your step goal 3 times this week!</Text>
          <Text style={styles.insightText}>- Consider scheduling a follow-up based on your recent logs.</Text>
          <Text style={styles.insightText}>- Remember to take your medication around 8:00 AM.</Text>
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
    flex: 1,
    paddingTop: theme.spacing.md, // Add padding top if needed
    // padding: theme.spacing.md, // Remove this if adding paddingTop
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
    // Add specific styling if needed, otherwise uses default Button style
  },
  linkText: {
    fontSize: theme.typography.caption,
    color: theme.colors.primary, // Use primary color for links
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginTop: theme.spacing.sm,
  },
  insightText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  logButton: {
    marginTop: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.subheading,
  },
}); 
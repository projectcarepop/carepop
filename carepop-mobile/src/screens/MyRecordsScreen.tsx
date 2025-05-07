import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Import Card and Button
import { MaterialIcons } from '@expo/vector-icons'; // For icons

export function MyRecordsScreen() {
  // TODO: Fetch actual record data from backend

  // Placeholder data (replace with real data structure)
  const dummyCheckups = [
    { id: 'c1', date: '2024-08-20', doctor: 'Dr. Anya Sharma', type: 'Follow-up Visit' },
    { id: 'c2', date: '2024-07-10', doctor: 'Dr. Ben Carter', type: 'SRH Check-up' },
  ];

  const dummyReceipts = [
    { id: 'r1', date: '2024-08-20', amount: 'PHP 500.00', service: 'Consultation' },
  ];

  const dummyResults = [
    { id: 't1', date: '2024-07-11', type: 'Lab Results - Blood Test', status: 'View' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>My Records</Text>

        {/* Checkup Records Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Checkup History</Text>
          {dummyCheckups.length > 0 ? (
            dummyCheckups.map(item => (
              <TouchableOpacity key={item.id} style={styles.recordItem} onPress={() => { /* Navigate to details */ }}>
                <View style={styles.recordTextContainer}>
                  <Text style={styles.recordPrimaryText}>{item.type} with {item.doctor}</Text>
                  <Text style={styles.recordSecondaryText}>{item.date}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholderText}>No checkup history found.</Text>
          )}
          {/* Add View All button? */}
        </Card>

        {/* Receipts Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Receipts</Text>
           {dummyReceipts.length > 0 ? (
            dummyReceipts.map(item => (
              <TouchableOpacity key={item.id} style={styles.recordItem} onPress={() => { /* Navigate to details/view */ }}>
                 <View style={styles.recordTextContainer}>
                  <Text style={styles.recordPrimaryText}>{item.service} - {item.amount}</Text>
                  <Text style={styles.recordSecondaryText}>{item.date}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholderText}>No receipts found.</Text>
          )}
        </Card>

        {/* Medical Results/Transcripts Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Results & Transcripts</Text>
           {dummyResults.length > 0 ? (
            dummyResults.map(item => (
              <TouchableOpacity key={item.id} style={styles.recordItem} onPress={() => { /* Navigate to details/view */ }}>
                 <View style={styles.recordTextContainer}>
                  <Text style={styles.recordPrimaryText}>{item.type}</Text>
                  <Text style={styles.recordSecondaryText}>{item.date} - Status: {item.status}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.placeholderText}>No results found.</Text>
          )}
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
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
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
    marginBottom: theme.spacing.md,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recordTextContainer: {
    flex: 1, // Allow text to wrap and take space
    marginRight: theme.spacing.sm,
  },
  recordPrimaryText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  recordSecondaryText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
}); 
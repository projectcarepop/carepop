import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../components'; // Assuming theme is exported from ../components/index.ts
import type { NavigationProp } from '@react-navigation/native';

/**
 * Props for the ClinicFinderScreen component.
 */
interface ClinicFinderScreenProps {
  /** React Navigation prop for navigating to other screens. */
  navigation: NavigationProp<any>; 
}

/**
 * ClinicFinderScreen will display a map and list of nearby clinics.
 * (Placeholder for now)
 */
export function ClinicFinderScreen({ navigation }: ClinicFinderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Clinic Finder</Text>
        <Text style={styles.placeholderText}>
          Map and clinic listings will be implemented here.
        </Text>
      </View>
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
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
}); 
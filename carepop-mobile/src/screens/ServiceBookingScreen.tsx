import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../components';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface ServiceBookingScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>; // Can be refined if params are known
}

export function ServiceBookingScreen({ navigation, route }: ServiceBookingScreenProps) {
  // const { serviceName } = route.params as { serviceName?: string } || { serviceName: 'Unknown Service' };
  const serviceName = (route.params as any)?.serviceName || 'Selected Service';


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Book: {serviceName}</Text>
        <Text style={styles.placeholderText}>
          This is the placeholder for the Service Booking Screen.
          Provider selection, date/time picking, and confirmation steps will be here.
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
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
}); 
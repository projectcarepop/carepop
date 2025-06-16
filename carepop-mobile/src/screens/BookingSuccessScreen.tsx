import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme, Button } from '../components';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppointmentStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppointmentStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons name="checkmark-circle-outline" size={120} color={theme.colors.primary} />
        <Text style={styles.title}>Appointment Booked!</Text>
        <Text style={styles.subtitle}>You will receive a confirmation shortly.</Text>
        <Button 
          title="Back to Dashboard" 
          onPress={() => navigation.popToTop()} // Go back to the start of the stack
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    width: '100%',
  },
}); 
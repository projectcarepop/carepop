import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from './theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// This is the CORRECT React Native Card component
export const Card = ({ children, style }: CardProps) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,        // Use white background
    borderRadius: theme.borderRadius.lg, // Use borderRadius instead of radii
    padding: theme.spacing.lg, 
    // Enhanced shadow for better depth perception (Rule #35: Content Over UI Styling)
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    // Improve alignment and spacing (Rule #5: Embrace Negative Space)
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: theme.spacing.md,
    // Add subtle border for definition (Rule #6: Golden Ratio - subtle border)
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    // Ensure consistent patterns (Rule #47: Design System Consistency)
    overflow: 'hidden',
  },
});

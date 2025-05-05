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
    borderRadius: theme.borderRadius.xl, // Use borderRadius instead of radii
    padding: theme.spacing.lg, 
    // Removed border styles
    // Added shadow styles for elevation
    shadowColor: '#000', // Standard shadow color
    shadowOffset: { width: 0, height: 1 }, // Less vertical offset
    shadowOpacity: 0.05, // Very subtle opacity
    shadowRadius: 2, // Less blur
    elevation: 1, // Minimal elevation for Android
    alignItems: 'center', // Center content vertically by default for stat cards
  },
});

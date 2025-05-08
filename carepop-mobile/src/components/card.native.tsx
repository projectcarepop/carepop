import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle, Platform } from 'react-native';
import { theme } from './theme';

/**
 * Props for the Card component.
 * Extends standard React Native ViewProps.
 */
interface CardProps extends ViewProps {
  /** The content to be rendered inside the card. */
  children: React.ReactNode;
  /** Optional custom styles to be merged with the default card styles. */
  style?: ViewStyle;
}

/**
 * A basic card component with themed styling for background, padding, border radius, and subtle shadow/elevation.
 * Use this to wrap content sections for visual grouping and separation.
 */
export const Card: React.FC<CardProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    // Add a subtle border on Android as elevation shadow might be less distinct
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: theme.borderRadius.sm,
    elevation: 1,
  },
}); 
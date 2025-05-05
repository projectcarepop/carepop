import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from './theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    // Add shadows based on platform or theme if needed later
    shadowColor: '#000', // Basic shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, // Basic shadow for Android
  },
}); 
import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle, Platform } from 'react-native';
import { theme } from './theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

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
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: theme.borderRadius.sm,
    elevation: 1,
  },
}); 
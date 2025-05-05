import React, { useState, Children, cloneElement, isValidElement } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';

interface RadioGroupProps {
  label?: string;
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  errorMessage?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  selectedValue,
  onValueChange,
  children,
  style,
  labelStyle,
  errorMessage
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          // Inject selectedValue and onSelect props into each RadioButton child
          return cloneElement(child as React.ReactElement<any>, {
            selectedValue: selectedValue,
            onSelect: onValueChange, // Reuse onValueChange as onSelect for RadioButton
          });
        }
        return child;
      })}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold', // Make group label bold
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
  },
}); 
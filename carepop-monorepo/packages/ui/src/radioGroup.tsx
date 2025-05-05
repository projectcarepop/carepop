import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { RadioButton } from './radioButton';
import { Text } from 'react-native'; // Import Text for potential label/error
import { theme } from './theme'; // For potential styling

interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  selectedValue: string | null; // The currently selected value
  onValueChange: (value: string) => void; // Callback when selection changes
  label?: string; // Optional label for the group
  error?: string; // Optional error for the group
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<ViewStyle>;
  errorStyle?: StyleProp<ViewStyle>;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedValue,
  onValueChange,
  label,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
}) => {
  return (
    <View style={[styles.groupContainer, containerStyle]}>
      {label && <Text style={[styles.groupLabel, labelStyle]}>{label}</Text>}
      {options.map((option) => (
        <RadioButton
          key={option.value}
          label={option.label}
          value={option.value}
          checked={selectedValue === option.value}
          onPress={onValueChange} // Pass the callback directly
          disabled={option.disabled}
        />
      ))}
      {error && <Text style={[styles.groupError, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = {
  groupContainer: {
    marginBottom: theme.spacing.md,
  },
  groupLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  groupError: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.destructive,
  },
}; 
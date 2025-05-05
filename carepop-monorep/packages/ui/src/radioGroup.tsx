import React from 'react';
import { View, StyleProp, ViewStyle, TextStyle, StyleSheet } from 'react-native';
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
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
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
    <View style={[styles.groupContainer, containerStyle]} accessibilityRole="radiogroup">
      {/* Rule #23: Typography Hierarchy - clear label styling */}
      {label && (
        <Text 
          style={[styles.groupLabel, labelStyle]}
          accessibilityRole="header"
        >
          {label}
        </Text>
      )}
      {/* Rule #12: Organization Helps the System of Many Look Fewer */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <RadioButton
            key={option.value}
            label={option.label}
            value={option.value}
            checked={selectedValue === option.value}
            onPress={onValueChange}
            disabled={option.disabled}
            containerStyle={[
              styles.radioOption,
              index === options.length - 1 && styles.lastRadioOption
            ]}
          />
        ))}
      </View>
      {/* Rule #33: Communicate Status with Semantic Colors */}
      {error && (
        <Text 
          style={[styles.groupError, errorStyle]}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: theme.spacing.lg, // Rule #7: Establish clear hierarchy with spacing
    width: '100%',
    // Rule #11: Achieve Simplicity Through Thoughtful Reduction
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.01)', // Subtle background to visually group
    borderRadius: theme.borderRadius.md,
  },
  groupLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold, // Rule #23: Typography Hierarchy
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    // Rule #24: Prioritize Readability
    letterSpacing: 0.3,
  },
  optionsContainer: {
    width: '100%',
    paddingVertical: theme.spacing.xs,
    // Rule #48: Limit Design Patterns
    gap: theme.spacing.xs, // Add consistent spacing between options
  },
  radioOption: {
    marginBottom: theme.spacing.sm,
    // Rule #7: Establish clear hierarchy with spacing
    marginLeft: theme.spacing.xs, // Slight indent for visual hierarchy
  },
  lastRadioOption: {
    marginBottom: 0, // Remove margin for last option
  },
  groupError: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.destructive,
    fontWeight: theme.typography.fontWeights.medium,
    // Rule #24: Prioritize Readability
    lineHeight: theme.typography.fontSizes.sm * 1.4,
  },
}); 
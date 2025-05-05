import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';
// Assuming react-native-vector-icons is setup
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RadioButtonProps {
  label?: string;
  value: string; // Value associated with this radio button
  selectedValue?: string | null; // Current selected value in the group (injected by RadioGroup)
  onSelect?: (value: string) => void; // Callback when selected (injected by RadioGroup)
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  selectedValue,
  onSelect,
  disabled = false,
  style,
  labelStyle,
}) => {

  const IconComponent = require('react-native-vector-icons/MaterialCommunityIcons').default;

  const isSelected = selectedValue === value;

  const handlePress = () => {
    if (!disabled && onSelect) {
      onSelect(value);
    }
  };

  const iconName = isSelected ? 'radiobox-marked' : 'radiobox-blank';
  const iconColor = disabled
    ? theme.colors.disabled
    : isSelected
      ? theme.colors.primary
      : theme.colors.text;

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      accessibilityLabel={label}
    >
      <IconComponent name={iconName} size={24} color={iconColor} />
      {label && (
        <Text style={[styles.label, disabled && styles.disabledLabel, labelStyle]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs, // Add some padding for touch area
    marginRight: theme.spacing.md, // Add spacing between radio buttons if horizontal
  },
  label: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  disabledLabel: {
    color: theme.colors.textMuted,
  },
}); 
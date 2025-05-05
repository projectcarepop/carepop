import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';
// Assuming react-native-vector-icons is setup
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  style,
  labelStyle,
}) => {

  const IconComponent = require('react-native-vector-icons/MaterialCommunityIcons').default;

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const iconName = checked ? 'checkbox-marked' : 'checkbox-blank-outline';
  const iconColor = disabled
    ? theme.colors.disabled
    : checked
      ? theme.colors.primary
      : theme.colors.text;

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
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
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Using MaterialIcons as an example
import { theme } from './theme';

interface CheckboxProps extends ViewProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  // containerStyle?: ViewStyle; // Prefer controlling layout via parent
  labelStyle?: TextStyle;
  // Add testID for testing
  testID?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  // containerStyle,
  labelStyle,
  testID,
  style, // Get container style from props
  ...rest
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const checkboxBaseStyle: ViewStyle = {
    width: 22, // Slightly larger touch target
    height: 22,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5, // Slightly thicker border
    borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: label ? theme.spacing.sm : 0,
    opacity: disabled ? 0.65 : 1,
  };

  const checkboxCheckedStyle: ViewStyle = checked
    ? {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
        borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
      }
    : { backgroundColor: theme.colors.background };

  return (
    <Pressable
      style={[styles.container, style]} // Apply external style here
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
      {...rest}
    >
      <View style={[checkboxBaseStyle, checkboxCheckedStyle]}>
        {checked && (
          <MaterialIcons name="check" size={18} color={theme.colors.background} />
        )}
      </View>
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
    // Remove marginBottom, let parent handle layout
  },
  label: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    // fontFamily: theme.typography.fontFamily, // Uncomment when font is set up
  },
  disabledLabel: {
    color: theme.colors.disabled,
  },
}); 
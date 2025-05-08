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
import { MaterialIcons } from '@expo/vector-icons'; // Using MaterialIcons for the checkmark
import { theme } from './theme';

/**
 * Props for the Checkbox component.
 * Extends standard React Native ViewProps (applied to the root Pressable).
 */
interface CheckboxProps extends ViewProps {
  /** Optional text label displayed next to the checkbox. */
  label?: string;
  /** The current checked state of the checkbox. */
  checked: boolean;
  /** Callback function triggered when the checkbox state changes. Passes the new checked state. */
  onChange: (checked: boolean) => void;
  /** If true, the checkbox is visually disabled and cannot be interacted with. Defaults to false. */
  disabled?: boolean;
  // containerStyle?: ViewStyle; // Layout typically controlled by parent via the standard 'style' prop
  /** Optional custom styles for the text label. */
  labelStyle?: TextStyle;
  /** Optional testID for testing purposes. */
  testID?: string;
}

/**
 * A themed checkbox component with support for labels, checked/unchecked states, and disabled state.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  labelStyle,
  testID,
  style, // External style for the root Pressable container
  ...rest // Other ViewProps for the Pressable
}) => {
  /**
   * Handles the press event on the checkbox container.
   * Toggles the checked state via the onChange prop if not disabled.
   */
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  // Style for the square checkbox indicator itself
  const checkboxBaseStyle: ViewStyle = {
    width: 22, // Consistent size
    height: 22,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5, // Defined border width
    borderColor: disabled ? theme.colors.disabled : theme.colors.primary, // Border color based on state
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: label ? theme.spacing.sm : 0, // Add margin only if label exists
    opacity: disabled ? 0.65 : 1, // Dim if disabled
  };

  // Style overrides when the checkbox is checked
  const checkboxCheckedStyle: ViewStyle = checked
    ? {
        // Use primary color for background and border when checked (or disabled color if disabled)
        backgroundColor: disabled ? theme.colors.disabledBackground : theme.colors.primary,
        borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
      }
    : { 
        // Use default background when unchecked
        backgroundColor: disabled ? theme.colors.disabledBackground : theme.colors.background 
      };

  // TODO: Consider making the check icon configurable via props if needed later.
  const checkIcon = (
    <MaterialIcons name="check" size={18} color={theme.colors.background} />
  );

  return (
    <Pressable
      style={[styles.container, style]} // Apply external container style here
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
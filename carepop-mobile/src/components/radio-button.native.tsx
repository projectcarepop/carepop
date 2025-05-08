import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
// No specific icon needed as we draw the radio button visuals with Views
import { theme } from './theme';

/**
 * Props for the RadioButton component.
 * Extends standard React Native ViewProps (applied to the root Pressable).
 */
interface RadioButtonProps extends ViewProps {
  /** Optional text label displayed next to the radio button. */
  label?: string;
  /** The unique value associated with this radio button option. */
  value: string;
  /** The currently selected value in the radio group this button belongs to. */
  selectedValue: string | null;
  /** Callback function triggered when this radio button is selected. Passes its `value`. */
  onSelect: (value: string) => void;
  /** If true, the radio button is visually disabled and cannot be interacted with. Defaults to false. */
  disabled?: boolean;
  /** Optional custom styles for the text label. */
  labelStyle?: TextStyle;
  /** Optional testID for testing purposes. */
  testID?: string;
}

/**
 * A themed radio button component, designed to be used within a RadioGroup.
 * Displays a selectable circular indicator and an optional label.
 */
export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  selectedValue,
  onSelect,
  disabled = false,
  labelStyle,
  style, // External style for the root Pressable container
  testID,
  ...rest // Other ViewProps for the Pressable
}) => {
  // Determine if this radio button is the currently selected one in the group
  const isSelected = value === selectedValue;

  /**
   * Handles the press event on the radio button.
   * Calls the onSelect prop with this button's value if not disabled.
   */
  const handlePress = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  // Style for the outer circle of the radio button
  const radioBaseStyle: ViewStyle = {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.full, // Make it perfectly circular
    borderWidth: 1.5,
    borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: label ? theme.spacing.sm : 0,
    opacity: disabled ? 0.65 : 1,
    // Ensure a background color when not selected, matching the app background
    backgroundColor: disabled ? theme.colors.disabledBackground : theme.colors.background,
  };

  // Style for the inner dot shown when selected
  // TODO: Consider deriving inner dot size proportionally from the outer size (e.g., width / 2)
  const innerDotStyle: ViewStyle = {
    width: 11,
    height: 11,
    borderRadius: theme.borderRadius.full,
    backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
  };

  return (
    <Pressable
      style={[styles.container, style]} // Apply external container style
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      testID={testID}
      {...rest}
    >
      <View style={radioBaseStyle}>
        {isSelected && <View style={innerDotStyle} />}
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
  },
  label: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    // fontFamily: theme.typography.fontFamily,
  },
  disabledLabel: {
    color: theme.colors.disabled,
  },
}); 
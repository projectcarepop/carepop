// 'use client'; // Removed - Not applicable in React Native

import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
  Pressable,
} from 'react-native';
import { theme } from './theme';
// import { MaterialIcons } from '@expo/vector-icons'; // Icons are passed as ReactNode

/**
 * Props for the TextInput component.
 * Extends standard React Native TextInputProps.
 */
interface TextInputProps extends RNTextInputProps {
  /** Optional label displayed above the input field. */
  label?: string;
  /** Optional error message displayed below the input field. Takes precedence over helperText. */
  error?: string;
  /** Optional helper text displayed below the input field when there is no error. */
  helperText?: string;
  /** Optional React node to display as an icon at the beginning of the input field. 
   * Note: The node should be appropriately sized and styled by the parent. */
  leadingIcon?: React.ReactNode;
  /** Optional React node to display as an icon at the end of the input field.
   * Note: The node should be appropriately sized and styled by the parent. */
  trailingIcon?: React.ReactNode;
  /** Optional style for the outermost container View. */
  containerStyle?: ViewStyle;
  /** Optional callback function triggered when the trailing icon is pressed. */
  onPressTrailingIcon?: () => void;
}

/**
 * A themed text input component with support for labels, errors, helper text, icons, and focus/disabled states.
 * Wraps the standard React Native TextInput.
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  style, // Style for the actual RNTextInput element
  containerStyle, // Style for the outer container View
  onFocus,
  onBlur,
  editable = true,
  onPressTrailingIcon,
  ...rest // Other RNTextInput props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDisabled = !editable;

  /**
   * Handles the focus event for the TextInput.
   * Sets the focused state and calls the original onFocus prop.
   */
  const handleFocus: RNTextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  /**
   * Handles the blur event for the TextInput.
   * Clears the focused state and calls the original onBlur prop.
   */
  const handleBlur: RNTextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  /**
   * Determines the border color based on the input's state (error, focused).
   * @returns {string} The calculated border color.
   */
  const getBorderColor = (): string => {
    if (isDisabled) return theme.colors.border; // Use default border color when disabled
    if (error) return theme.colors.destructive;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  /**
   * Determines the border width based on the input's state (focused, error).
   * @returns {number} The calculated border width.
   */
  const getBorderWidth = (): number => {
    // TODO: Consider defining theme.borderWidth.sm and theme.borderWidth.md instead of hardcoding 1/1.5
    return isFocused || error ? 1.5 : 1; // Slightly thicker border on focus/error
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDisabled && styles.disabledLabel]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor(), borderWidth: getBorderWidth() },
          isDisabled && styles.disabledInputContainer,
        ]}
      >
        {leadingIcon && (
          <View style={[styles.iconContainer, styles.leadingIconContainer]}>
            {leadingIcon}
          </View>
        )}
        <RNTextInput
          style={[
            styles.input,
            isDisabled && styles.disabledInput,
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted} // Use textMuted for placeholder
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          underlineColorAndroid="transparent" // Remove Android underline
          {...rest}
        />
        {trailingIcon && (
          <Pressable onPress={onPressTrailingIcon} disabled={!onPressTrailingIcon}>
            <View style={[styles.iconContainer, styles.trailingIconContainer]}>
                {trailingIcon}
            </View>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && (
        <Text style={[styles.helperText, isDisabled && styles.disabledLabel]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.body, // Use body size for label
    color: theme.colors.secondary,
    fontWeight: '500', // Slightly bolder label
    // fontFamily: theme.typography.fontFamily, // Needs font setup
  },
  disabledLabel: {
      color: theme.colors.disabled,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.inputBackground,
    // paddingHorizontal: theme.spacing.sm, // Padding handled by input/icons
    height: 44, // Explicit height for consistency
  },
  disabledInputContainer: {
    backgroundColor: theme.colors.disabledBackground,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    height: '100%', // Fill container height
    paddingHorizontal: theme.spacing.sm + 2, // Input specific padding
    fontSize: theme.typography.body,
    color: theme.colors.text,
    // fontFamily: theme.typography.fontFamily,
  },
  disabledInput: {
    color: theme.colors.disabled,
  },
  iconContainer: {
    height: '100%',
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingIconContainer: {
    // Optional: Add specific margin if needed
  },
  trailingIconContainer: {
     // Optional: Add specific margin if needed
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.caption,
    color: theme.colors.destructive,
    // fontFamily: theme.typography.fontFamily,
  },
  helperText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted, // Use textMuted color
    // fontFamily: theme.typography.fontFamily,
  },
}); 
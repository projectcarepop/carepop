import React, { useState } from 'react'; // Import useState
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps,
  TextStyle,
  ViewStyle,
  NativeSyntheticEvent, // Import types for focus events
  TextInputFocusEventData,
  ColorValue,
} from 'react-native';
import { theme } from './theme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string; // Add helperText prop
  disabled?: boolean; // Add disabled prop
  leadingIcon?: React.ReactNode; // Add leading icon prop
  trailingIcon?: React.ReactNode; // Add trailing icon prop
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle; // Style for the TextInput element itself
  inputContainerStyle?: ViewStyle; // Style for the View wrapping icons+input
  errorStyle?: TextStyle;
  helperTextStyle?: TextStyle; // Add style prop for helper text
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  helperText,
  disabled = false, // Default to false
  leadingIcon,
  trailingIcon,
  style, // Keep style prop, but it will apply to the wrapper View now if needed?
         // Let's apply it to the inner RNTextInput for consistency for now.
  containerStyle,
  labelStyle,
  inputStyle,
  inputContainerStyle,
  errorStyle,
  helperTextStyle,
  onFocus, // Capture onFocus prop
  onBlur, // Capture onBlur prop
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (disabled) return; // Prevent focus if disabled
    setIsFocused(true);
    onFocus?.(e); // Call original onFocus if provided
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (disabled) return; // Prevent blur if disabled?
    setIsFocused(false);
    onBlur?.(e); // Call original onBlur if provided
  };

  // Determine colors based on state
  const borderColor = disabled
    ? theme.colors.disabledBorder
    : error
    ? theme.colors.destructive
    : isFocused
    ? theme.colors.primary
    : theme.colors.border;
  
  const labelColor = disabled ? theme.colors.disabledText : theme.colors.textSecondary;
  const inputTextColor = disabled ? theme.colors.disabledText : theme.colors.text;
  // Use disabledBackground for the *container* when disabled
  const inputContainerBackgroundColor = disabled ? theme.colors.disabledBackground : theme.colors.inputBackground;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: labelColor }, labelStyle]}>{label}</Text>}
      {/* New container View for icons and input */}
      <View
        style={[
          styles.inputContainer, // Use base container styles
          { 
            borderColor: borderColor, // Apply border to this container
            backgroundColor: inputContainerBackgroundColor, // Apply background to this container
          },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          inputContainerStyle, // Allow overriding container style
        ]}
      >
        {leadingIcon && <View style={styles.iconContainer}>{leadingIcon}</View>}
        <RNTextInput
          style={[
            styles.input, // Base input styles (mostly flex, text color)
            { color: inputTextColor },
            inputStyle,
            style, 
          ]}
          placeholderTextColor={theme.colors.disabledBorder}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {trailingIcon && <View style={styles.iconContainer}>{trailingIcon}</View>}
      </View>
      {/* Display error first, then helper text if no error (and not disabled) */}
      {!disabled && (
        error ? (
          <Text style={[styles.error, errorStyle]}>{error}</Text>
        ) : helperText ? (
          <Text style={[styles.helper, helperTextStyle]}>{helperText}</Text>
        ) : null
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  // Styles for the View containing icons and RNTextInput
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
  },
  inputContainerFocused: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainerError: {
    borderWidth: 2,
    borderColor: theme.colors.destructive,
    shadowColor: theme.colors.destructive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainerDisabled: {
    opacity: 0.7,
    backgroundColor: theme.colors.disabledBackground,
  },
  // Styles for the actual RNTextInput element
  input: {
    flex: 1,
    height: '100%',
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
  },
  // Styles for the icon wrapper Views
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xs,
    opacity: 0.7,
  },
  error: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.destructive,
    fontWeight: theme.typography.fontWeights.medium,
  },
  helper: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSizes.sm * 1.4,
  },
}); 
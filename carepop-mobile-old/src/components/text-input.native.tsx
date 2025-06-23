import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { theme } from './theme';

interface InputProps extends RNTextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      icon,
      error,
      style,
      onFocus,
      onBlur,
      editable = true,
      required,
      helperText,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // This fixes the error by filtering out any 'false' values from the array
    const containerStyles = [
      styles.inputContainer,
      isFocused && styles.focused,
      error && styles.error,
      !editable && styles.disabled,
      style,
    ].filter(Boolean) as ViewStyle[];

    return (
      <View style={styles.outerContainer}>
        {label && <Text style={styles.label}>{label}{required && <Text style={styles.requiredAsterisk}> *</Text>}</Text>}
        <View style={containerStyles}>
          <RNTextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={theme.colors.mutedForeground}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            editable={editable}
            {...rest}
          />
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
        {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg, // Add consistent spacing below each input group
  },
  label: {
    ...theme.typography.small,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm, // Using named key
    fontWeight: '500',
  },
  requiredAsterisk: {
    color: theme.colors.destructive,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md, // Using correct theme key
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    
  },
  focused: {
    borderColor: theme.colors.ring,
    borderWidth: 2,
  },
  error: {
    borderColor: theme.colors.destructive,
  },
  disabled: {
    backgroundColor: theme.colors.muted, // Using existing theme color
    opacity: 0.7,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.foreground,
    paddingVertical: 0, // Remove default padding for consistent height
  },
  iconContainer: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.destructive,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: theme.spacing.xs,
    paddingHorizontal: 4,
  },
});
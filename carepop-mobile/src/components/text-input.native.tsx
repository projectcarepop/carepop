'use client';

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
// import { MaterialIcons } from '@expo/vector-icons'; // Assuming icons will be passed as ReactNode

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  onPressTrailingIcon?: () => void; // Add callback for trailing icon press
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  style,
  containerStyle,
  onFocus,
  onBlur,
  editable = true,
  onPressTrailingIcon,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDisabled = !editable;

  const handleFocus: RNTextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: RNTextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return theme.colors.destructive;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  const getBorderWidth = () => {
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
    color: theme.colors.text,
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
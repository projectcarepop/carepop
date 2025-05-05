import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  Pressable,
} from 'react-native';
import { theme } from './theme';
// Assuming react-native-vector-icons is setup
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIconName?: string;
  trailingIconName?: string;
  onTrailingIconPress?: () => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  helperText,
  errorText,
  leadingIconName,
  trailingIconName,
  onTrailingIconPress,
  style,
  onFocus,
  onBlur,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const hasError = !!errorText;
  const borderColor = hasError
    ? theme.colors.destructive
    : isFocused
      ? theme.colors.primary
      : theme.colors.border;

  const IconComponent = require('react-native-vector-icons/MaterialCommunityIcons').default;


  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, disabled && styles.disabledText]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          disabled && styles.disabledInputContainer,
        ]}
      >
        {leadingIconName && (
          <IconComponent name={leadingIconName} size={20} color={theme.colors.icon} style={styles.icon} />
        )}
        <RNTextInput
          style={[styles.input, disabled && styles.disabledText]}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          {...props}
        />
        {trailingIconName && (
          <Pressable onPress={onTrailingIconPress} disabled={!onTrailingIconPress}>
            <IconComponent name={trailingIconName} size={20} color={theme.colors.icon} style={styles.icon} />
          </Pressable>
        )}
      </View>
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
      {helperText && !errorText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 40, // Adjust height as needed
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  icon: {
    marginHorizontal: theme.spacing.xs,
  },
  helperText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontFamily,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.destructive,
    fontFamily: theme.typography.fontFamily,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  disabledInputContainer: {
    backgroundColor: theme.colors.disabledBackground,
    borderColor: theme.colors.border,
  },
}); 
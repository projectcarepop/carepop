import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { theme } from './theme';

interface RadioButtonProps {
  label?: string;
  value: string; // Value associated with this radio button
  checked: boolean;
  onPress: (value: string) => void; // Pass value back on press
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  radioStyle?: StyleProp<ViewStyle>; // Style for the radio icon container
  labelStyle?: StyleProp<TextStyle>;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  checked,
  onPress,
  disabled = false,
  containerStyle,
  radioStyle,
  labelStyle,
}) => {
  const borderColor = disabled
    ? theme.colors.disabledBorder
    : checked
    ? theme.colors.primary
    : theme.colors.textSecondary;

  const labelColor = disabled
    ? theme.colors.disabledText
    : checked
    ? theme.colors.primary
    : theme.colors.text;

  const handlePress = () => {
    if (!disabled) {
      onPress(value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.containerPressed,
        containerStyle
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      accessibilityHint={checked ? "Deselect this option" : "Select this option"}
    >
      <View 
        style={[
          styles.radio,
          { borderColor },
          checked && styles.radioChecked,
          disabled && styles.radioDisabled,
          radioStyle
        ]}
      >
        {checked && (
          <View style={[
            styles.radioInner,
            disabled && styles.radioInnerDisabled
          ]} />
        )}
      </View>
      {label && (
        <Text 
          style={[styles.label, { color: labelColor }, labelStyle]}
          numberOfLines={2}
        >
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
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minHeight: 44,
  },
  containerPressed: {
    backgroundColor: 'rgba(20, 36, 116, 0.08)',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  radioChecked: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  radioDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  radioInnerDisabled: {
    backgroundColor: theme.colors.disabledText,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    flexShrink: 1,
    lineHeight: theme.typography.fontSizes.md * 1.4,
  },
}); 
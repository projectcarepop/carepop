import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';

interface CheckboxProps extends PressableProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  labelStyle?: TextStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  labelStyle,
  style,
  ...rest
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const rootContainerStyle: ViewStyle[] = [
    styles.container,
    disabled ? styles.containerDisabled : {},
  ];
  if (style) {
    rootContainerStyle.push(style as ViewStyle);
  }

  const indicatorStyle: ViewStyle[] = [
    styles.indicator,
    checked ? styles.indicatorChecked : {},
  ];

  return (
    <Pressable
      style={rootContainerStyle}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      hitSlop={10}
      {...rest}
    >
      <View style={indicatorStyle}>
        {checked && (
          <Ionicons
            name="checkmark"
            size={14}
            color={theme.colors.primaryForeground}
          />
        )}
      </View>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: {
    marginLeft: theme.spacing.md,
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
});
"use client";

import React from "react";
import {
  StyleSheet,
  ViewStyle,
  Text,
  TextStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { theme } from './theme';

// Define possible button variants
export type ButtonVariant = 'primary' | 'secondary-solid' | 'secondary-outline' | 'destructive';

// Define props for the Button component
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  titleStyle?: StyleProp<TextStyle>;
}

// Style mappings for different variants (no pressed state needed here)
const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    text: {
      color: theme.colors.primaryText,
    },
  },
  'secondary-solid': {
    container: {
      backgroundColor: theme.colors.secondarySolidBase,
      borderColor: theme.colors.secondarySolidBase,
    },
    text: {
      color: theme.colors.secondarySolidText,
    },
  },
  'secondary-outline': {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.secondaryOutlineBorder,
    },
    text: {
      color: theme.colors.secondaryOutlineText,
    },
  },
  destructive: {
    container: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
    },
    text: {
      color: theme.colors.destructiveText,
    },
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  style,
  titleStyle,
  disabled,
  onPress,
  activeOpacity = 0.8,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles[variant].container,
        disabled && styles.disabledContainer,
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={disabled ? 1 : activeOpacity}
      {...props}
    >
      <Text style={[
        styles.text,
        variantStyles[variant].text,
        disabled && styles.disabledText,
        titleStyle,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 100,
  },
  text: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily,
  },
  disabledContainer: {
    backgroundColor: theme.colors.disabledBackground,
    borderColor: theme.colors.disabledBorder,
    opacity: 0.6,
  },
  disabledText: {
    color: theme.colors.disabledText,
  },
});

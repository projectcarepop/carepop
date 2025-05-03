"use client";

import React from "react";
import { Pressable, StyleSheet, ViewStyle, Text, TextStyle, StyleProp } from "react-native"; 
import { colors, spacing, radii, fontSizes } from "./theme"; // Adjusted path if exported directly from theme.ts

// Minimal props for debugging
interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>; 
  titleStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  titleStyle,
  variant = 'primary',
  disabled = false,
  ...rest // Capture other PressableProps
}) => {

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed, 
        style,
      ]}
      {...rest} // Spread remaining props
    >
      <Text 
        style={[
          styles.textBase,
          variant === 'primary' ? styles.primaryText : styles.secondaryText,
          disabled && styles.disabledText,
          titleStyle,
        ]}
      >
        {/* Render title primarily, maybe children as fallback? Or combine? For now, just title. */}
        {title} 
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2, 
    paddingHorizontal: spacing.md, 
    borderRadius: radii.md, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 100, // Example width
  },
  textBase: {
    fontSize: fontSizes.md, 
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryText: {
    color: colors.background,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
  },
  disabledButton: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.6,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  pressed: {
    transform: [{ scale: 0.98 }], 
  },
});

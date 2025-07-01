import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { theme } from './theme';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'xl';

interface ButtonProps extends PressableProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle: customTextStyle,
  onPress,
  children,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const containerStyle: ViewStyle[] = [
    styles.baseContainer,
    variantStyles[variant].container,
    sizeStyles[size].container,
  ];

  if (fullWidth) {
    containerStyle.push({ width: '100%' });
  }

  if (isDisabled) {
    containerStyle.push(styles.disabled);
  }
  if (style) {
    containerStyle.push(style as ViewStyle);
  }

  const textStyle: TextStyle[] = [
    styles.baseText,
    variantStyles[variant].text,
    sizeStyles[size].text,
  ];

  if (customTextStyle) {
    textStyle.push(customTextStyle);
  }

  const iconColor = variantStyles[variant].text.color;

  return (
    <Pressable style={containerStyle} disabled={isDisabled} onPress={onPress} {...rest}>
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon}
          {children ? (
            typeof children === 'string' ? (
              <Text style={textStyle}>{children}</Text>
            ) : (
              children
            )
          ) : title ? (
            <Text style={textStyle}>{title}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

// --- StyleSheet Definition ---

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  baseText: {
    fontSize: theme.typography.small.fontSize,
    fontFamily: theme.typography.fontFamilyMedium,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = {
  default: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.primary,
    },
    text: {
      color: theme.colors.primaryForeground,
    },
  }),
  destructive: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.destructive,
    },
    text: {
      color: theme.colors.destructiveForeground,
    },
  }),
  outline: StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    text: {
      color: theme.colors.accent,
    },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.secondary,
    },
    text: {
      color: theme.colors.secondaryForeground,
    },
  }),
  ghost: StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    text: {
      color: theme.colors.primary,
    },
  }),
  link: StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    text: {
      color: theme.colors.foreground,
      textDecorationLine: 'underline',
    },
  }),
};

// --- CORRECTED SIZE STYLES ---
const sizeStyles = {
  default: StyleSheet.create({
    container: {
      height: 40,
      paddingHorizontal: theme.spacing.lg,
    },
    text: {},
  }),
  sm: StyleSheet.create({
    container: {
      height: 36,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
    },
    text: {},
  }),
  lg: StyleSheet.create({
    container: {
      height: 48,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radius.md,
    },
    text: {
      fontSize: theme.typography.body.fontSize,
    },
  }),
  xl: StyleSheet.create({
    container: {
      height: 52,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radius.md,
    },
    text: {
      fontSize: 18,
    },
  }),
  icon: StyleSheet.create({
    container: {
      height: 40,
      width: 40,
      borderRadius: theme.radius.full,
    },
    text: {},
  }),
};
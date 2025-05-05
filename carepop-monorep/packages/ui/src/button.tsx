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
  ActivityIndicator,
  View,
  Platform,
} from "react-native";
import { theme } from './theme';

// Define possible button variants
export type ButtonVariant = 'primary' | 'secondary-solid' | 'secondary-outline' | 'destructive';

// Define props for the Button component
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  titleStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large'; // Rule #7: Establish Clear Hierarchy with Size
}

// Style mappings for different variants (no pressed state needed here)
const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle, shadow: ViewStyle }> = {
  primary: {
    container: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    text: {
      color: theme.colors.primaryText,
    },
    shadow: {
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    }
  },
  'secondary-solid': {
    container: {
      backgroundColor: theme.colors.secondarySolidBase,
      borderColor: theme.colors.secondarySolidBase,
    },
    text: {
      color: theme.colors.secondarySolidText,
    },
    shadow: {
      shadowColor: theme.colors.secondarySolidBase,
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2,
    }
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
    shadow: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    }
  },
  destructive: {
    container: {
      backgroundColor: theme.colors.destructive,
      borderColor: theme.colors.destructive,
    },
    text: {
      color: theme.colors.destructiveText,
    },
    shadow: {
      shadowColor: theme.colors.destructive,
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    }
  },
};

// Rule #7: Establish a Clear Hierarchy with Size options
const sizeStyles = {
  small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSizes.sm,
    minHeight: 32,
  },
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.fontSizes.md,
    minHeight: 44,
  },
  large: {
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg + 4,
    fontSize: theme.typography.fontSizes.lg,
    minHeight: 52,
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  style,
  titleStyle,
  disabled,
  onPress,
  activeOpacity = 0.6,
  loading = false,
  leftIcon,
  rightIcon,
  size = 'medium',
  ...props
}) => {
  // Rule #30: Create Consistent Color Palette - use from theme
  const currentSizeStyle = sizeStyles[size];
  
  // Rule #51: Standardize Content Guidelines - ensure button text is properly capitalized
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          paddingVertical: currentSizeStyle.paddingVertical,
          paddingHorizontal: currentSizeStyle.paddingHorizontal,
          minHeight: currentSizeStyle.minHeight,
        },
        variantStyles[variant].container,
        variantStyles[variant].shadow,
        disabled && styles.disabledContainer,
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={disabled ? 1 : activeOpacity}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      <View style={styles.contentContainer}>
        {/* Rule #9: Create a Clear Focal Point */}
        {leftIcon && !loading && 
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        }
        {loading ? (
          // Rule #38: Micro-Interactions & Delightful Animations
          <ActivityIndicator 
            size={size === 'small' ? 'small' : 'small'}
            color={variantStyles[variant].text.color}
            style={styles.loader} 
          />
        ) : (
          // Rule #24: Prioritize Readability - clear text styling
          <Text style={[
            styles.text,
            { fontSize: currentSizeStyle.fontSize },
            variantStyles[variant].text,
            disabled && styles.disabledText,
            titleStyle,
          ]}>
            {formattedTitle}
          </Text>
        )}
        {rightIcon && !loading && 
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        }
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 120,
    shadowOffset: { width: 0, height: 2 },
    marginVertical: theme.spacing.sm, // Rule #5: Embrace Negative Space
    // Rule #22: Provide Feedback for User Actions
    position: 'relative',
    overflow: 'hidden', // Ensure the ripple effect stays within borders
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Rule #31: Create Visual Rhythm
    gap: theme.spacing.xs,
  },
  text: {
    fontWeight: theme.typography.fontWeights.semibold, // Rule #23: Typography Hierarchy
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily,
    // Rule #24: Prioritize Readability
    letterSpacing: 0.4,
    // Rule #51: Maintain Cross-Device Consistency
    ...Platform.select({
      web: {
        userSelect: 'none',
      },
    }),
  },
  disabledContainer: {
    backgroundColor: theme.colors.disabledBackground,
    borderColor: theme.colors.disabledBorder,
    opacity: 0.7, // Rule #34: Guide actions - more visible but clearly disabled
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: theme.colors.disabledText,
  },
  leftIconContainer: {
    marginRight: theme.spacing.xs / 2, // Tighter spacing for better alignment
  },
  rightIconContainer: {
    marginLeft: theme.spacing.xs / 2, // Tighter spacing for better alignment
  },
  loader: {
    marginHorizontal: theme.spacing.xs,
    // Rule #38: Micro-Interactions - subtle animation
    transform: [{ scale: 0.85 }],
  },
});

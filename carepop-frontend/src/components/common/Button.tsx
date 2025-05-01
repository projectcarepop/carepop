import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

// Copied from TextInput.tsx for consistency
const themeColors = {
  text: {
    light: '#111827',
    dark: '#E5E7EB',
  },
  neutral: {
    light: '#FFFFFF',
    dark: '#212121',
  },
  brand: {
    'dark-blue': {
      light: '#142474',
      dark: '#788BFF',
    },
    pink: {
      light: '#F421DF',
      dark: '#F421DF',
    },
  },
  error: '#F44336'
};

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  className?: string;
  textClassName?: string;
  // accessibilityLabel is already part of TouchableOpacityProps
}

const Button = ({
  title,
  loading = false,
  variant = 'contained',
  className = '',
  textClassName = '',
  disabled,
  children, // Keep children prop
  ...props
}: Props) => {
  const baseButtonClasses = 'px-4 py-4 rounded-md flex-row justify-center items-center';
  const baseTextClasses = 'font-sans font-semibold text-base text-center';

  let variantButtonClasses = '';
  let variantTextClasses = '';

  const disabledButtonClasses = 'opacity-50';
  const disabledTextClasses = ''; // Handled by parent opacity mostly

  // Determine styles based on variant
  let indicatorColorLight = themeColors.brand['dark-blue'].light;
  let indicatorColorDark = themeColors.brand['dark-blue'].dark;

  switch (variant) {
    case 'outlined':
      variantButtonClasses = 'border border-brand-dark-blue-light dark:border-brand-dark-blue-dark bg-transparent';
      variantTextClasses = 'text-brand-dark-blue-light dark:text-brand-dark-blue-dark';
      break;
    case 'text':
      variantButtonClasses = 'bg-transparent';
      variantTextClasses = 'text-brand-dark-blue-light dark:text-brand-dark-blue-dark';
      break;
    case 'contained':
    default:
      variantButtonClasses = 'bg-brand-dark-blue-light dark:bg-brand-dark-blue-dark';
      variantTextClasses = 'text-neutral-light dark:text-neutral-dark'; // Use dark text for dark mode contrast
      indicatorColorLight = themeColors.neutral.light;
      indicatorColorDark = themeColors.neutral.light; // Keep indicator white on dark blue bg
      break;
  }

  return (
    <TouchableOpacity
      className={`${baseButtonClasses} ${variantButtonClasses} ${disabled || loading ? disabledButtonClasses : ''} ${className}`}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      {...props}
    >
      {loading ? (
        <View className="mr-2">
          <ActivityIndicator color={indicatorColorLight} className="dark:hidden" />
          <ActivityIndicator color={indicatorColorDark} className="hidden dark:flex" />
        </View>
      ) : (
        <Text className={`${baseTextClasses} ${variantTextClasses} ${disabled ? disabledTextClasses : ''} ${textClassName}`}>
          {/* Use title prop primarily, allow children as fallback/override */}
          {title || children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button; 
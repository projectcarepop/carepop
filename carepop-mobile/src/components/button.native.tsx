import React from 'react';
import {
  Text,
  Pressable,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { theme } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';
type ButtonStyle = 'solid' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  styleType?: ButtonStyle;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  styleType = 'solid',
  size = 'md',
  isLoading = false,
  disabled = false,
  onPress,
  style,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const getButtonStyle = (pressed: boolean): ViewStyle[] => {
    // Size-based padding - INCREASED for all sizes
    const sizeStyles = {
      sm: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.spacing.sm,
        minWidth: 120,
      },
      md: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.spacing.md,
        minWidth: 160,
      },
      lg: {
        paddingVertical: theme.spacing.lg - 4,
        paddingHorizontal: theme.spacing.xl + 8,
        borderRadius: theme.spacing.lg - 4,
        minWidth: 200,
      },
    };
    
    const baseStyle: ViewStyle = {
      ...sizeStyles[size],
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: isDisabled ? 0.65 : 1,
      shadowColor: 'transparent',
      elevation: 0,
    };

    let variantStyle: ViewStyle = {};
    let pressedStyle: ViewStyle = {};
    let shadowStyle: ViewStyle = {};

    // Define pressed colors based on theme
    const pressedOutlineColors = {
      primary: theme.colors.primaryMuted,
      secondary: theme.colors.secondaryMuted,
      destructive: theme.colors.destructiveMuted,
    };
    const pressedSolidColors = {
      primary: theme.colors.primaryDark,
      secondary: theme.colors.secondaryDark,
      destructive: theme.colors.destructiveDark,
    };

    if (styleType === 'solid') {
      variantStyle = { backgroundColor: theme.colors[variant] };
      pressedStyle = pressed && !isDisabled ? { backgroundColor: pressedSolidColors[variant] } : {};

      // Enhanced shadow for solid buttons unless pressed or disabled
      if (!pressed && !isDisabled) {
        shadowStyle = Platform.select({
          ios: {
            shadowColor: variant === 'primary' ? '#ff2d4d' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
          },
          android: {
            elevation: 6,
          },
        }) ?? {};
      }
      // When pressed, reduce but don't eliminate elevation/shadow to maintain some depth
      else if (pressed && !isDisabled) {
        shadowStyle = Platform.select({ 
          ios: { 
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
          }, 
          android: { 
            elevation: 3 
          } 
        }) ?? {};
      }
    } else { // outline
      baseStyle.borderWidth = 2.5; // Even thicker border for better visibility at larger sizes
      variantStyle = {
        borderColor: theme.colors[variant],
        backgroundColor: 'transparent',
      };
      // Better pressed state for outline buttons
      pressedStyle = pressed && !isDisabled ? { backgroundColor: pressedOutlineColors[variant].replace("0.1","0.2") } : {};
    }

    // Combine base, variant, shadow, pressed, and external styles
    return [baseStyle, variantStyle, shadowStyle, pressedStyle, style as ViewStyle];
  };

  const getTextStyle = (): TextStyle => {
    // Size-based font sizing - INCREASED for all sizes
    const sizeFontStyles = {
      sm: theme.typography.button,
      md: theme.typography.subheading - 2,
      lg: theme.typography.subheading,
    };
    
    const baseStyle: TextStyle = {
      fontSize: sizeFontStyles[size],
      fontWeight: 'bold',
      // fontFamily: theme.typography.fontFamilyBold, // Uncomment when font is set up
    };

    if (styleType === 'solid') {
      baseStyle.color = theme.colors.background; // White text on solid backgrounds
    } else { // outline
      baseStyle.color = theme.colors[variant];
    }

    if (isLoading) {
      baseStyle.marginLeft = theme.spacing.sm;
    }

    return baseStyle;
  };

  return (
    <Pressable
      style={({ pressed }) => getButtonStyle(pressed)}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      {...rest}
    >
      {isLoading && (
        <ActivityIndicator 
          size={size === 'lg' ? 'large' : 'small'}
          color={styleType === 'solid' ? theme.colors.background : theme.colors[variant]} 
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
};

// Basic StyleSheet export if needed, though styles are dynamic here
// const styles = StyleSheet.create({}); 
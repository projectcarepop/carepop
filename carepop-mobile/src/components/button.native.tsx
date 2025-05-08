import React from 'react';
import {
  Text,
  Pressable,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';
import { theme } from './theme';

/** Defines the visual style variants for the button. */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
/** Defines whether the button is filled (solid) or has only a border (outline). */
export type ButtonStyle = 'solid' | 'outline';
/** Defines the size presets for the button. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component.
 */
interface ButtonProps extends PressableProps {
  /** The text displayed on the button. */
  title: string;
  /** The color scheme variant of the button. Defaults to 'primary'. */
  variant?: ButtonVariant;
  /** The style type of the button (filled or outline). Defaults to 'solid'. */
  styleType?: ButtonStyle;
  /** The size of the button. Defaults to 'md'. */
  size?: ButtonSize;
  /** If true, displays a loading indicator instead of the title. Defaults to false. */
  isLoading?: boolean;
  /** If true, the button is visually disabled and onPress is ignored. Defaults to false. */
  disabled?: boolean;
  /** An optional icon to be rendered before the title. */
  icon?: React.ReactNode;
}

/**
 * A customizable pressable button component with variants, styles, sizes, and loading/disabled states.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  styleType = 'solid',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  onPress,
  style, // External style prop
  ...rest // Other Pressable props
}) => {
  const isDisabled = disabled || isLoading;

  /**
   * Calculates the dynamic button container styles based on props and pressed state.
   * @param {boolean} pressed - Whether the button is currently being pressed.
   * @returns {ViewStyle[]} An array of style objects for the Pressable container.
   */
  const getButtonStyle = (pressed: boolean): ViewStyle[] => {
    // --- Size Styles --- 
    // TODO: Review if minWidth and specific padding calculations (lg-4, xl+8) are ideal
    // or if they can be derived more directly from theme/typography.
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: {
        paddingVertical: theme.spacing.sm, 
        paddingHorizontal: theme.spacing.lg, 
        borderRadius: theme.borderRadius.md, // Use md radius for consistency? sm looks small.
        minWidth: 120, // Consider removing minWidth if layout allows
      },
      md: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
        minWidth: 160, // Consider removing minWidth
      },
      lg: {
        paddingVertical: theme.spacing.lg - 4, // Specific adjustment
        paddingHorizontal: theme.spacing.xl + 8, // Specific adjustment
        borderRadius: theme.borderRadius.lg, // Larger radius for larger button
        minWidth: 200, // Consider removing minWidth
      },
    };
    
    // --- Base Styles --- (Applied to all buttons)
    const baseStyle: ViewStyle = {
      ...sizeStyles[size],
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: isDisabled ? 0.65 : 1, // Dim disabled/loading state
      // Reset default web shadows/elevation if needed (though target is native)
      shadowColor: 'transparent',
      elevation: 0,
    };

    let variantStyle: ViewStyle = {};
    let pressedStyle: ViewStyle = {};
    let shadowStyle: ViewStyle = {}; // Platform-specific shadow/elevation

    // Define base colors for different states
    const solidBackgroundColor = theme.colors[variant];
    const solidPressedBackgroundColor = theme.colors[`${variant}Dark`]; // e.g., theme.colors.primaryDark
    const outlineBorderColor = theme.colors[variant];
    const outlinePressedBackgroundColor = theme.colors[`${variant}Muted`]; // e.g., theme.colors.primaryMuted (rgba with 0.1 opacity)

    // --- Style Type Logic --- (Solid vs Outline)
    if (styleType === 'solid') {
      variantStyle = { backgroundColor: solidBackgroundColor };
      pressedStyle = pressed && !isDisabled ? { backgroundColor: solidPressedBackgroundColor } : {};

      // Apply platform shadows for solid buttons when active and not pressed
      if (!pressed && !isDisabled) {
        shadowStyle = Platform.select({
          ios: {
            shadowColor: variant === 'primary' ? '#ff2d4d' : '#000', // Consider theme color?
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
          },
          android: {
            elevation: 6,
          },
        }) ?? {};
      }
      // Reduce shadow slightly when pressed but still active
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
    } else { // Outline style
      // TODO: Review borderWidth. 2.5 seems specific. Maybe theme.borderWidth.md?
      baseStyle.borderWidth = 2.5; 
      variantStyle = {
        borderColor: outlineBorderColor,
        backgroundColor: 'transparent',
      };
      // Use the Muted color (which has low opacity) directly for outline pressed background
      pressedStyle = pressed && !isDisabled ? { backgroundColor: outlinePressedBackgroundColor } : {};
    }

    // Combine all styles. Order matters: base -> variant -> shadow -> pressed -> external
    // Ensure external style comes last to allow overrides.
    return [baseStyle, variantStyle, shadowStyle, pressedStyle, style as ViewStyle];
  };

  /**
   * Calculates the dynamic button text styles based on props.
   * @returns {TextStyle} A style object for the Text component.
   */
  const getTextStyle = (): TextStyle => {
    // Size-based font sizing
    // TODO: Review lg size calculation. Maybe define theme.typography.lgButton?
    const sizeFontStyles: Record<ButtonSize, number> = {
      sm: theme.typography.button, // 14
      md: theme.typography.body,    // 16
      lg: theme.typography.subheading - 2, // 18 (was subheading which is 20)
    };
    
    const baseTextStyle: TextStyle = {
      fontSize: sizeFontStyles[size],
      fontWeight: 'bold', // Consider using fontFamilyBold when available
      // fontFamily: theme.typography.fontFamilyBold, // Uncomment when font is loaded
      textAlign: 'center',
    };

    if (styleType === 'solid') {
      baseTextStyle.color = theme.colors.background; // Usually white text
    } else { // Outline style
      baseTextStyle.color = theme.colors[variant]; // Text color matches border color
    }

    // Add margin ONLY if icon OR loading indicator is present
    if (icon || isLoading) {
      baseTextStyle.marginLeft = theme.spacing.sm;
    }

    return baseTextStyle;
  };

  return (
    <Pressable
      style={({ pressed }) => getButtonStyle(pressed)}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      {...rest}
    >
      {/* Render icon if provided and not loading */}
      {!isLoading && icon && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
      {/* Render only text if no icon or if loading */}
      {(!icon || isLoading) && (
        <Text style={getTextStyle()}>{title}</Text>
      )}
      {/* Display ActivityIndicator when loading */}
      {isLoading && (
        <ActivityIndicator size="small" color={styleType === 'solid' ? theme.colors.background : theme.colors[variant]} />
      )}
    </Pressable>
  );
};

// Basic StyleSheet export if needed, though styles are dynamic here
// const styles = StyleSheet.create({}); 
// carepop-frontend/packages/ui/src/theme.ts

/**
 * Defines the color palette for the application.
 */
const colors = {
  primary: '#ff4d6d', // Pink/Red - Main interactive color
  primaryMuted: 'rgba(255, 77, 109, 0.1)', // Light overlay/background for primary pressed/hover states
  primaryDark: '#E64460', // Slightly darker pink/red for solid press effect
  secondary: '#142474', // Dark Blue - Secondary interactive color or accents
  secondaryMuted: 'rgba(20, 36, 116, 0.1)', // Light overlay/background for secondary pressed/hover states
  secondaryDark: '#101D5C', // Slightly darker blue for solid press effect
  destructive: '#DC143C', // Crimson - For error states or destructive actions
  destructiveMuted: 'rgba(220, 20, 60, 0.1)', // Light overlay/background for destructive pressed/hover states
  destructiveDark: '#C51235', // Slightly darker crimson for solid press effect
  accent: '#87CEEB', // Sky Blue - Used for specific highlights or accents if needed
  background: '#FFFFFF', // Default screen/app background
  card: '#F8F9FA', // Background for card components
  text: '#212529', // Default text color
  textMuted: '#6C757D', // Grey for secondary/helper text
  border: '#DEE2E6', // Default border color for inputs, cards, dividers
  inputBackground: '#FFFFFF', // Background for TextInput components
  disabled: '#ADB5BD', // Color for disabled text or icons
  disabledBackground: '#E9ECEF', // Background for disabled interactive elements
  success: '#198754', // Color for success states/messages
  warning: '#FFC107', // Color for warning states/messages
  notification: '#ff4d6d', // Added to conform to NavigationTheme
};

/**
 * Defines the spacing scale for margins, paddings, etc.
 */
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // Consider adding specific semantic values if needed (e.g., inputPaddingVertical: 12)
};

/**
 * Defines the border radius scale.
 */
const borderRadius = {
  sm: 4,  // Small elements, checkboxes
  md: 8,  // Buttons, inputs, standard cards
  lg: 12, // Larger cards, modals
  xl: 16,
  full: 9999, // For creating circular elements
};

/**
 * Defines typographic styles like font sizes and families.
 * NOTE: Font files must be loaded separately in the app's entry point (e.g., App.tsx)
 * using expo-font or @expo-google-fonts/* for these families to work.
 */
const typography = {
  body: 16,
  heading: 24,
  subheading: 20,
  caption: 12,
  button: 14,
  // Target font: Space Grotesk
  fontFamily: 'SpaceGrotesk_400Regular', // UPDATED
  fontFamilyBold: 'SpaceGrotesk_700Bold',    // UPDATED
};

// Type for fontWeight to satisfy React Navigation Theme
type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

/**
 * The combined theme object containing colors, spacing, border radius, and typography constants.
 * Used throughout the application for consistent styling.
 */
export const theme = {
  dark: false, // Added to conform to NavigationTheme
  colors,
  fonts: { // ADDED to conform to NavigationTheme
    regular: {
      fontFamily: typography.fontFamily, // SpaceGrotesk_400Regular
      fontWeight: '400' as FontWeight, 
    },
    medium: {
      fontFamily: typography.fontFamily, // Fallback to regular or use bold if medium isn't loaded
      fontWeight: '500' as FontWeight, 
    },
    bold: {
      fontFamily: typography.fontFamilyBold, // SpaceGrotesk_700Bold
      fontWeight: '700' as FontWeight, 
    },
    heavy: {
      fontFamily: typography.fontFamilyBold, // Fallback to bold if heavy isn't loaded
      fontWeight: '800' as FontWeight, 
    },
  },
  spacing,
  borderRadius,
  typography,
};

export type Theme = typeof theme; 
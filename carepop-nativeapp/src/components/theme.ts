// carepop-frontend/packages/ui/src/theme.ts

const colors = {
  primary: '#ff4d6d', // Pink/Red
  primaryMuted: 'rgba(255, 77, 109, 0.1)', // Light overlay/background for primary pressed/hover states
  primaryDark: '#E64460', // Slightly darker pink/red for solid press
  secondary: '#142474', // Dark Blue
  secondaryMuted: 'rgba(20, 36, 116, 0.1)', // Light overlay/background for secondary pressed/hover states
  secondaryDark: '#101D5C', // Slightly darker blue for solid press
  destructive: '#DC143C', // Example: Crimson
  destructiveMuted: 'rgba(220, 20, 60, 0.1)', // Light overlay/background for destructive pressed/hover states
  destructiveDark: '#C51235', // Slightly darker crimson for solid press
  accent: '#87CEEB', // Sky Blue (from image)
  background: '#FFFFFF',
  card: '#F8F9FA', // Slightly off-white for cards (cleaner than F5F5F5)
  text: '#212529', // Darker text for better contrast
  textMuted: '#6C757D', // Grey for muted/helper text
  border: '#DEE2E6', // Slightly darker border for subtle definition
  inputBackground: '#FFFFFF', // Explicit input background
  disabled: '#ADB5BD', // Adjusted disabled grey
  disabledBackground: '#E9ECEF', // Background for disabled inputs
  success: '#198754', // Bootstrap green
  warning: '#FFC107', // Bootstrap yellow
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // Consider adding specific values like inputPaddingHorizontal: 12, etc.
};

const borderRadius = {
  sm: 4,
  md: 8,  // Standard interactive elements
  lg: 12, // Cards, larger elements
  xl: 16,
  full: 9999,
};

const typography = {
  body: 16,
  heading: 24,
  subheading: 20,
  caption: 12,
  button: 14, // Specific button text size
  // Font families - Confirmed: Inter is the target font family.
  // Actual font loading (e.g., using @expo-google-fonts/inter) is required elsewhere.
  fontFamily: 'Inter_400Regular', // Expo Google Fonts suffix example
  fontFamilyBold: 'Inter_700Bold', // Expo Google Fonts suffix example
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
};

export type Theme = typeof theme; 
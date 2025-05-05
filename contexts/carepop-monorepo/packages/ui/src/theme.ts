// packages/ui/src/theme.ts

import { TextStyle } from 'react-native';

// Color Palette
export const colors = {
  // Base Colors
  white: '#FFFFFF',
  black: '#000000',
  grey: '#CCCCCC', // Neutral grey for borders, dividers, disabled states
  lightGrey: '#E0E0E0', // Lighter grey, perhaps for backgrounds

  // Primary Colors (User Requested: #142474)
  primary: '#142474',
  primaryPressed: '#0F1A58', // Darkened version
  primaryText: '#FFFFFF',

  // Secondary (Solid Background Style - User Requested Image Color ~ #87CEFA)
  secondarySolidBase: '#87CEFA', // Light Sky Blue
  secondarySolidPressed: '#65A9D7', // Darkened version
  secondarySolidText: '#000000', // Black text for contrast

  // Secondary (Outlined Style - Aligned with new primary)
  secondaryOutlineBase: 'transparent', // Keep transparent for outline
  secondaryOutlinePressed: '#E7E9F5', // Very light primary shade for pressed bg
  secondaryOutlineText: '#142474', // New primary color
  secondaryOutlineBorder: '#142474', // New primary color
  secondaryOutlinePressedText: '#142474', // New primary color
  secondaryOutlinePressedBorder: '#142474', // New primary color

  // Destructive (User Requested: #FF4769)
  destructive: '#FF4769',
  destructivePressed: '#E03150', // Darkened version
  destructiveText: '#FFFFFF',

  // --- Existing Colors Below (Ensure consistency) ---
  // Accent Color (for new Switch style)
  accent: '#FDBA74', // Peach/Orange (Tailwind orange-300)

  // Functional Colors
  border: '#E0E0E0', // Default border color (adjust if needed)
  inputBackground: '#F5F5F5', // Background for text inputs
  // Text Colors
  text: '#333333',
  textSecondary: '#757575',
  textLink: '#142474', // Updated link color to new primary
  // Disabled Colors
  disabledBackground: '#EEEEEE',
  disabledText: '#BDBDBD',
  disabledBorder: '#E0E0E0',
  // Status & Feedback
  success: '#4CAF50',
  // Backgrounds & Surfaces
  background: '#FFFFFF',
  surface: '#FFFFFF',
};

// Spacing Scale
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Typography
const typography = {
  fontFamily: 'sans-serif',
  fontSizes: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  fontWeights: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
};

// Border Radius - Ensure this object exists and has the key
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 25,
  full: 9999,
};

// Shadows (example - adjust as needed)
// const shadows = { ... };

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius, // Ensure borderRadius is exported
  // shadows,
}; 
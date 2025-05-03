// packages/ui/src/theme.ts

// Define basic color palette
export const colors = {
  primary: '#142474', // Updated Primary
  secondary: '#F421DF', // Updated Secondary
  background: '#FFFFFF',
  text: '#142474', // Using primary as main text color for now
  textSecondary: '#616161', // Darkened gray for better disabled contrast (was #666666)
  border: '#CCCCCC',
  success: '#10B981', // Example: Emerald
  error: '#EF4444', // Example: Red
};

// Define basic spacing units (can be used for padding, margin, etc.)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define basic font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16, // Used as base button text size
  lg: 18,
  xl: 20,
  xxl: 24,
};

// Define basic border radii
export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

// It's often useful to define font weights too
export const fontWeights = {
  regular: '400',
  medium: '600', // Used for button text
  bold: '700',
}; 
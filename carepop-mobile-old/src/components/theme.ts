const colors = {
  primary: '#ff4d6d',
  primaryForeground: '#FFFFFF',
  secondary: '#142474',
  secondaryForeground: '#FFFFFF',
  background: '#F9FAFB',
  foreground: '#1F2937',
  card: '#FFFFFF',
  cardForeground: '#1F2937',
  popover: '#FFFFFF',
  popoverForeground: '#1F2937',
  muted: '#F3F4F6',
  mutedForeground: '#6B7280',
  accent: '#ff4d6d',
  accentForeground: '#FFFFFF',
  destructive: '#EF4444',
  destructiveMuted: '#FEE2E2',
  destructiveForeground: '#FFFFFF',
  success: '#22C55E',
  border: '#E5E7EB',
  input: '#E5E7EB',
  ring: '#ff4d6d',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

const radius = {
  sm: 6,
  md: 12,
  lg: 24,
  full: 9999,
};

const interFontFamily = 'Inter_400Regular';
const interFontFamilyMedium = 'Inter_500Medium';
const interFontFamilySemiBold = 'Inter_600SemiBold';
const interFontFamilyBold = 'Inter_700Bold';

const poppinsFontFamily = 'Poppins_400Regular';
const poppinsFontFamilyMedium = 'Poppins_500Medium';
const poppinsFontFamilySemiBold = 'Poppins_600SemiBold';
const poppinsFontFamilyBold = 'Poppins_700Bold';

const typography = {
  h1: {
    fontFamily: interFontFamilyBold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: interFontFamilyBold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: interFontFamilySemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: interFontFamilySemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: interFontFamily,
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontFamily: interFontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  xsmall: {
    fontFamily: interFontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  fontFamily: interFontFamily,
  fontFamilyMedium: interFontFamilyMedium,
  fontFamilySemiBold: interFontFamilySemiBold,
  fontFamilyBold: interFontFamilyBold,
  interFontFamily,
  interFontFamilyMedium,
  interFontFamilySemiBold,
  interFontFamilyBold,
  poppinsFontFamily,
  poppinsFontFamilyMedium,
  poppinsFontFamilySemiBold,
  poppinsFontFamilyBold,
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
};
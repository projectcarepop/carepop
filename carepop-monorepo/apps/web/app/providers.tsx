'use client';

import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components'; // Use non-native import
import { theme } from '@repo/ui/styles/theme'; // Import the shared theme

export function Providers({ children }: { children: React.ReactNode }) {
  // Add other providers here if needed in the future (e.g., Redux)
  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
} 
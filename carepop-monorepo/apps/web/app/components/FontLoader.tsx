'use client';

import { useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export function FontLoader() {
  // Explicitly load the font on the client
  useEffect(() => {
    MaterialIcons.loadFont().catch(function (error) {
      // Consider more robust error handling or logging
      console.warn('Error loading MaterialIcons font:', error);
    });
  }, []);

  // This component doesn't render anything itself
  return null;
} 
'use client';

import React from 'react';
import { View, type ViewProps } from 'react-native';
import tw from 'twrnc';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string; // Allow custom classes
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  // Translate StyleSheet to Tailwind classes
  // theme.colors.card -> bg-gray-50 (assuming F8F9FA is close to gray-50)
  // theme.borderRadius.lg -> rounded-lg (Tailwind lg is 12px, theme lg is 12)
  // theme.spacing.md -> p-4 (Tailwind p-4 is 16px, theme md is 16)
  // Border for subtle definition -> border border-gray-200 (DEE2E6 is close to gray-200)
  // Shadow -> shadow-sm (approximates the subtle shadow)
  const cardClasses = `bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm`;

  const combinedClasses = `${cardClasses} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <View style={tw`${combinedClasses}`} {...rest}>
      {children}
    </View>
  );
}; 
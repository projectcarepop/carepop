'use client';

import React from 'react';
import {
  Text,
  Pressable,
  type PressableProps,
  ActivityIndicator,
} from 'react-native'; // Use RN primitives
import tw from 'twrnc'; // Import twrnc
// Note: theme import is not used directly for styles, but could be for logic if needed

// Type definitions (can be shared or duplicated from .native.tsx)
type ButtonVariant = 'primary' | 'secondary-solid' | 'secondary-outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string; // Allow passing extra Tailwind classes
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>((
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    onPress,
    className = '',
    ...props
  },
  ref
) => {
  const isDisabled = disabled || isLoading;

  // Base classes - common to all variants
  const baseClasses = `
    flex-row items-center justify-center border-2.5 font-medium 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-150 ease-in-out
    transform active:scale-[0.98]
  `; // Added transform scale effect

  // Size classes - BIGGER padding and sizing
  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm rounded-md shadow-sm min-w-[120px]', 
    md: 'px-6 py-3.5 text-base rounded-lg shadow-md min-w-[160px]', 
    lg: 'px-8 py-4.5 text-lg rounded-xl shadow-lg min-w-[200px]',
  };

  // Variant classes - Mapped from theme.ts colors where possible with improved shadows
  const variantClasses = {
    primary: `
      bg-[#ff4d6d] border-[#ff4d6d] text-white 
      hover:bg-[#E64460] hover:border-[#E64460] 
      focus:ring-[#ff4d6d] 
      active:bg-[#D13A54] 
      shadow-[#ff4d6d]/30
    `,
    'secondary-solid': `
      bg-[#142474] border-[#142474] text-white 
      hover:bg-[#101D5C] hover:border-[#101D5C] 
      focus:ring-[#142474]
      active:bg-[#0D1545] 
      shadow-gray-500/30
    `,
    'secondary-outline': `
      bg-transparent border-[#142474] text-[#142474] 
      hover:bg-[rgba(20,36,116,0.1)] 
      focus:ring-[#142474]
      active:bg-[rgba(20,36,116,0.2)]
      shadow-none
    `,
    destructive: `
      bg-[#DC143C] border-[#DC143C] text-white 
      hover:bg-[#C51235] hover:border-[#C51235] 
      focus:ring-[#DC143C]
      active:bg-[#B00F2E]
      shadow-[#DC143C]/30
    `,
  };

  const textBaseClasses = `font-sans font-bold`; // Bold text for larger buttons

  const textVariantClasses = {
    primary: 'text-white', // Corresponds to primary variant bg
    'secondary-solid': 'text-white', // Corresponds to secondary-solid variant bg
    'secondary-outline': 'text-[#142474]', // Corresponds to secondary-outline variant border/text
    destructive: 'text-white', // Corresponds to destructive variant bg
  };

  const combinedClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} 
    ${className}
  `.trim().replace(/\s+/g, ' '); // Clean up whitespace

  const combinedTextClasses = `
    ${textBaseClasses}
    ${textVariantClasses[variant]}
    ${isDisabled ? 'opacity-50' : ''}
  `.trim().replace(/\s+/g, ' ');

  // Use twrnc directly on the combined class strings
  const pressableStyle = tw`${combinedClasses}`;
  const textStyle = tw`${combinedTextClasses}`;
  const activityIndicatorStyle = tw`mr-3`; // Larger spacing for bigger buttons
  const activityIndicatorColor = tw.color(textVariantClasses[variant]);

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={pressableStyle} // Apply tw style object
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          size={size === 'lg' ? 'large' : 'small'} 
          style={activityIndicatorStyle} 
          color={activityIndicatorColor} 
        />
      ) : null}
      {typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text> // Apply tw style object
      ) : (
        children // Render non-string children directly
      )}
    </Pressable>
  );
});

Button.displayName = 'Button';

export { Button, type ButtonProps }; 
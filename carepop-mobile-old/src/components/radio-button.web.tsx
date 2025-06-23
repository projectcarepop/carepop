'use client';

import React from 'react';
import {
  View,
  Text,
  Pressable,
  type ViewProps,
} from 'react-native';
import tw from 'twrnc';

interface RadioButtonProps extends ViewProps {
  label?: string;
  value: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
  labelClassName?: string;
  radioClassName?: string;
  className?: string; // For container
  testID?: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  selectedValue,
  onSelect,
  disabled = false,
  labelClassName = '',
  radioClassName = '',
  className = '',
  testID,
  ...rest
}) => {
  const isSelected = value === selectedValue;

  const handlePress = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  // Base container classes
  const containerBaseClasses = `flex-row items-center`;
  const disabledContainerClasses = `opacity-65 cursor-not-allowed`;

  // Radio button outer circle classes
  const radioOuterBaseClasses = `w-5 h-5 border rounded-full justify-center items-center bg-white transition-colors duration-150 ease-in-out`;
  const radioOuterBorder = disabled ? `border-gray-400` : `border-pink-600`;
  const radioOuterHover = !disabled ? `hover:bg-pink-50` : '';
  const radioOuterFocus = `focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-500`;
  const radioOuterMargin = label ? `mr-2` : '';

  // Radio button inner dot classes
  const radioInnerDotClasses = `w-2.5 h-2.5 rounded-full`;
  const radioInnerDotColor = disabled ? `bg-gray-400` : `bg-pink-600`;

  // Label classes
  const labelBaseClasses = `text-base text-gray-900`;
  const labelDisabledClasses = `text-gray-400 /* WCAG AA Contrast Warning: text-gray-400 fails */`;

  const combinedContainerClasses = `
    ${containerBaseClasses} 
    ${disabled ? disabledContainerClasses : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const combinedRadioOuterClasses = `
    ${radioOuterBaseClasses} 
    ${radioOuterBorder} 
    ${radioOuterHover} 
    ${radioOuterFocus} 
    ${radioOuterMargin} 
    ${radioClassName}
  `.trim().replace(/\s+/g, ' ');

  const combinedLabelClasses = `
    ${labelBaseClasses} 
    ${disabled ? labelDisabledClasses : ''} 
    ${labelClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Pressable
      style={tw`${combinedContainerClasses}`}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      testID={testID}
      {...rest}
    >
      <View style={tw`${combinedRadioOuterClasses}`}>
        {isSelected && <View style={tw`${radioInnerDotClasses} ${radioInnerDotColor}`} />}
      </View>
      {label && (
        <Text style={tw`${combinedLabelClasses}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}; 
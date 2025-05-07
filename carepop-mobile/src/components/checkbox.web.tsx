'use client';

import React from 'react';
import {
  View,
  Text,
  Pressable,
  type ViewProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';

interface CheckboxProps extends ViewProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  labelClassName?: string;
  checkboxClassName?: string;
  className?: string; // For container
  testID?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  labelClassName = '',
  checkboxClassName = '',
  className = '',
  testID,
  ...rest
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  // Base container classes
  const containerBaseClasses = `flex-row items-center`;
  const disabledContainerClasses = `opacity-65 cursor-not-allowed`;

  // Checkbox box classes
  const checkboxBoxBaseClasses = `w-5 h-5 border rounded-sm justify-center items-center transition-colors duration-150 ease-in-out`;
  const checkboxBoxBorder = disabled ? `border-gray-400` : `border-pink-600`;
  const checkboxBoxChecked = checked ? (disabled ? `bg-gray-400 border-gray-400` : `bg-pink-600 border-pink-600`) : `bg-white`;
  const checkboxBoxHover = (!checked && !disabled) ? `hover:bg-pink-50` : '';
  const checkboxBoxFocus = `focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-500`;
  const checkboxBoxMargin = label ? `mr-2` : '';

  // Label classes
  const labelBaseClasses = `text-base text-gray-900`;
  const labelDisabledClasses = `text-gray-400 /* WCAG AA Contrast Warning: text-gray-400 fails */`;

  const combinedContainerClasses = `
    ${containerBaseClasses} 
    ${disabled ? disabledContainerClasses : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const combinedCheckboxClasses = `
    ${checkboxBoxBaseClasses} 
    ${checkboxBoxBorder} 
    ${checkboxBoxChecked} 
    ${checkboxBoxHover} 
    ${checkboxBoxFocus} 
    ${checkboxBoxMargin} 
    ${checkboxClassName}
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
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...rest}
    >
      <View style={tw`${combinedCheckboxClasses}`}>
        {checked && (
          <MaterialIcons name="check" size={18} color={tw.color('text-white')} />
        )}
      </View>
      {label && (
        <Text style={tw`${combinedLabelClasses}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}; 
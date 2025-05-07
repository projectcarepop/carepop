'use client';

import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  type TextInputProps as RNTextInputProps,
  Pressable,
} from 'react-native';
import tw from 'twrnc';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerClassName?: string; // Allow custom container classes
  className?: string; // Allow custom input classes
  onPressTrailingIcon?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  containerClassName = '',
  className = '',
  onFocus,
  onBlur,
  editable = true,
  onPressTrailingIcon,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDisabled = !editable;

  const handleFocus: RNTextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: RNTextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Tailwind classes based on state
  const baseContainerClasses = 'mb-4'; // theme.spacing.md
  const labelClasses = `block mb-1 text-sm font-medium text-gray-900 ${isDisabled ? 'text-gray-400' : ''}`;
  const inputContainerBaseClasses = `flex flex-row items-center bg-white border rounded-md h-11 transition-colors duration-150 ease-in-out`; // Added transition
  const inputContainerFocusClasses = `border-pink-500 ring-1 ring-pink-500 focus:ring-offset-2`; // Added focus offset
  const inputContainerErrorClasses = `border-red-600 ring-1 ring-red-600 focus:ring-offset-2`; // Added focus offset
  const inputContainerDisabledClasses = `bg-gray-100 border-gray-300 cursor-not-allowed`;
  const inputContainerNormalClasses = `border-gray-300 hover:border-gray-400`; // Added hover state

  const inputBaseClasses = `flex-1 h-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none bg-transparent`; // theme.spacing.sm+2, theme.typography.body
  const inputDisabledClasses = `text-gray-400 cursor-not-allowed /* WCAG AA Contrast Warning: text-gray-400 on bg-gray-100 fails (3.18:1) */`; // Added contrast warning

  const iconContainerClasses = `h-full px-2 flex items-center justify-center`; // theme.spacing.sm
  const errorTextClasses = `mt-1 text-xs text-red-600`; // theme.spacing.xs, theme.typography.caption, theme.colors.destructive
  const helperTextClasses = `mt-1 text-xs text-gray-500 ${isDisabled ? 'text-gray-400' : ''}`; // theme.spacing.xs, theme.typography.caption, theme.colors.textMuted

  const getInputContainerClasses = () => {
    let classes = `${inputContainerBaseClasses}`;
    if (isDisabled) {
      classes += ` ${inputContainerDisabledClasses}`;
    } else if (error) {
      classes += ` ${inputContainerErrorClasses}`;
    } else if (isFocused) {
      classes += ` ${inputContainerFocusClasses}`;
    } else {
      classes += ` ${inputContainerNormalClasses}`;
    }
    return classes;
  };

  const inputContainerClasses = getInputContainerClasses();

  return (
    <View style={tw`${baseContainerClasses} ${containerClassName}`}>
      {label && <Text style={tw`${labelClasses}`}>{label}</Text>}
      <View style={tw`${inputContainerClasses}`}>
        {leadingIcon && <View style={tw`${iconContainerClasses}`}>{leadingIcon}</View>}
        <RNTextInput
          style={tw`${inputBaseClasses} ${isDisabled ? inputDisabledClasses : ''} ${className}`}
          placeholderTextColor={tw.color('text-gray-500')} // Use tw helper for consistency
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!isDisabled} // Use !isDisabled for clarity
          underlineColorAndroid="transparent"
          {...rest}
        />
        {trailingIcon && (
          <Pressable onPress={onPressTrailingIcon} disabled={!onPressTrailingIcon || isDisabled}>
            <View style={tw`${iconContainerClasses}`}>{trailingIcon}</View>
          </Pressable>
        )}
      </View>
      {error && <Text style={tw`${errorTextClasses}`}>{error}</Text>}
      {helperText && !error && <Text style={tw`${helperTextClasses}`}>{helperText}</Text>}
    </View>
  );
}; 
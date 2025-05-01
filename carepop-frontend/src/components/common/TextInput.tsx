import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// Assuming themeColors are accessible or imported (like in Button.tsx)
const themeColors = {
  text: {
    light: '#111827',
    dark: '#E5E7EB',
  },
  neutral: {
    light: '#FFFFFF',
    dark: '#212121',
  },
  brand: {
    'dark-blue': {
      light: '#142474',
      dark: '#788BFF',
    },
    pink: {
      light: '#F421DF',
      dark: '#F421DF',
    },
  },
  error: '#F44336'
};

// Remove Paper-specific props, use standard RNTextInput props
interface Props extends RNTextInputProps {
  label?: string;
  errorText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  editable?: boolean;
}

const TextInput = ({
  label,
  value,
  onChangeText,
  errorText,
  secureTextEntry,
  editable = true,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  style,
  ...props
}: Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const isDisabled = !editable;
  const hasError = !!errorText;

  // Base classes using NativeWind
  const baseContainerClasses = 'mb-4';
  const baseLabelClasses = 'text-xs font-medium mb-1 text-text-light dark:text-text-dark';
  const baseInputContainerClasses = 'border rounded-md flex-row items-center bg-neutral-light dark:bg-neutral-dark';
  const baseInputClasses = 'flex-1 px-3 py-3 text-base font-sans text-text-light dark:text-text-dark';

  // State-based classes
  const focusClasses = 'border-brand-dark-blue-light dark:border-brand-dark-blue-dark';
  const errorClasses = 'border-error dark:border-error';
  const defaultBorder = 'border-gray-300 dark:border-gray-600';
  const disabledInputContainerClasses = 'opacity-50 bg-gray-100 dark:bg-gray-700';
  const disabledInputClasses = 'text-gray-500 dark:text-gray-400';

  const currentBorder = hasError ? errorClasses : isFocused ? focusClasses : defaultBorder;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  return (
    <View className={`${baseContainerClasses} ${containerClassName}`}> 
      {label && (
        <Text className={`${baseLabelClasses} ${labelClassName}`}>{label}</Text>
      )}
      <View className={`${baseInputContainerClasses} ${currentBorder} ${isDisabled ? disabledInputContainerClasses : ''}`}>
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isPasswordVisible && secureTextEntry}
          editable={editable}
          placeholderTextColor={themeColors.text.light + '80'}
          className={`${baseInputClasses} ${isDisabled ? disabledInputClasses : ''} ${inputClassName}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={style}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} disabled={isDisabled} className={`p-3 ${isDisabled ? 'opacity-50' : ''}`}>
            <Text className={`text-text-light dark:text-text-dark ${isDisabled ? disabledInputClasses : ''}`}>
                {isPasswordVisible ? 'Hide' : 'Show'} 
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {hasError && errorText && (
        <Text className="text-xs text-error mt-1">
          {errorText}
        </Text>
      )}
    </View>
  );
};

export default TextInput; 
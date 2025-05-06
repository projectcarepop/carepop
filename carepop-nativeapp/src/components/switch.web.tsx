'use client';

import React from 'react';
import {
  Switch as RNSwitch,
  type SwitchProps as RNSwitchProps,
} from 'react-native';
import tw from 'twrnc';
import { theme } from './theme'; // Import theme for colors

interface SwitchProps extends RNSwitchProps {
  testID?: string;
  className?: string; // Allow custom classes
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  className = '',
  testID,
  ...rest
}) => {
  // Base classes
  // const baseClasses = ``; // Remove unused variable
  const disabledClasses = `opacity-65`;
  const cursorClasses = disabled ? `cursor-not-allowed` : `cursor-pointer`;

  // Use theme colors for track and thumb
  const trackColor = {
    false: theme.colors.disabledBackground, // '#E9ECEF'
    true: theme.colors.primary, // '#ff4d6d'
  };
  // Thumb color for web might need explicit setting, Platform check might not be reliable
  const thumbColor = theme.colors.background; // '#FFFFFF'

  // Note: RNSwitch with react-native-web might not perfectly replicate native look.
  // Consider a custom Tailwind implementation if precise styling is needed.

  // For react-native-web, style prop might be needed for opacity
  const switchStyle = tw.style(
    disabled ? disabledClasses : '',
    cursorClasses, // Add cursor style
    className // Allow external class overrides for things like margin
  );

  return (
    <RNSwitch
      trackColor={trackColor}
      thumbColor={value ? thumbColor : thumbColor} // Ensure thumb color is set for both states
      ios_backgroundColor={trackColor.false} // Helps consistency on web sometimes
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
      style={switchStyle} // Apply disabled opacity via style
      testID={testID}
      {...rest}
    />
  );
}; 
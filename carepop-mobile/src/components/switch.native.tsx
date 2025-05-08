import React from 'react';
import {
  Switch as RNSwitch,
  StyleSheet,
  type SwitchProps as RNSwitchProps,
  Platform,
} from 'react-native';
import { theme } from './theme';

/**
 * Props for the Switch component.
 * Extends standard React Native SwitchProps.
 */
interface SwitchProps extends RNSwitchProps {
  /** Optional testID for testing purposes. */
  testID?: string;
}

/**
 * A themed switch component that wraps the standard React Native Switch.
 * Applies consistent theme colors for track and handles disabled state opacity.
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style, // External style prop
  testID,
  ...rest // Other RNSwitchProps
}) => {
  return (
    <RNSwitch
      // Set track colors based on theme
      trackColor={{
        false: theme.colors.disabledBackground, // Color when switch is off
        true: theme.colors.primary, // Color when switch is on
      }}
      // Set thumb color (the sliding circle)
      thumbColor={Platform.OS === 'android' ? theme.colors.background : ''} // White thumb on Android, default (white) on iOS
      // Set the background color of the track area specifically for iOS
      ios_backgroundColor={theme.colors.disabledBackground} 
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
      style={[style, disabled && styles.disabled]} // Apply external style and disabled opacity
      testID={testID}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.65, // Use standard disabled opacity
  },
}); 
import React from 'react';
import {
  Switch as RNSwitch,
  StyleSheet,
  type SwitchProps as RNSwitchProps,
  Platform,
} from 'react-native';
import { theme } from './theme';

interface SwitchProps extends RNSwitchProps {
  // Add any custom props if needed
  testID?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style, // Get style from props
  testID,
  ...rest
}) => {
  return (
    <RNSwitch
      trackColor={{
        false: theme.colors.disabledBackground, // Use disabled background for off track
        true: theme.colors.primary, // Use primary color for the 'on' track
      }}
      thumbColor={Platform.OS === 'android' ? theme.colors.background : ''} // Standard thumb colors
      ios_backgroundColor={theme.colors.disabledBackground} // Background of the track on iOS
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
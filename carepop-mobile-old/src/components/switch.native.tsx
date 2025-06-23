import React from 'react';
import {
  Switch as RNSwitch,
  type SwitchProps as RNSwitchProps,
  Platform,
} from 'react-native';
import { theme } from './theme';

/**
 * A themed switch component that wraps the standard React Native Switch.
 * It applies consistent theme colors and handles disabled state opacity automatically.
 */
export const Switch: React.FC<RNSwitchProps> = ({
  style,
  disabled,
  ...props
}) => {
  return (
    <RNSwitch
      trackColor={{
        false: theme.colors.muted, // A light grey for the off-track
        true: theme.colors.primary,             // The brand's primary color for the on-track
      }}
      // On Android, thumb color is consistent. On iOS, it's white by default and this prop is not needed.
      thumbColor={Platform.OS === 'android' ? theme.colors.background : undefined}
      ios_backgroundColor={theme.colors.muted}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]} // Apply disabled opacity directly
      disabled={disabled}
      {...props}
    />
  );
};
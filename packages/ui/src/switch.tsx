import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps, StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';

interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor'> {
  label?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

// Note: Basic implementation using standard RNSwitch.
// Advanced styling (like specific thumb icons or colors) might require platform-specific files (.web.tsx, .native.tsx)
// or a custom implementation if strict visual consistency is needed across platforms.
export const Switch: React.FC<SwitchProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  style,
  labelStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, disabled && styles.disabledLabel, labelStyle]}>
          {label}
        </Text>
      )}
      <RNSwitch
        trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.background : theme.colors.background} // Often white/off-white
        ios_backgroundColor={theme.colors.disabled} // Background of the track on iOS when off
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Push label and switch apart
    paddingVertical: theme.spacing.xs,
  },
  label: {
    marginRight: theme.spacing.sm, // Add space between label and switch
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  disabledLabel: {
    color: theme.colors.textMuted,
  },
}); 
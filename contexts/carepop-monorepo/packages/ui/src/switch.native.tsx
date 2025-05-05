import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch as RNSwitch,
  SwitchProps as RNSwitchProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { theme } from './theme';

interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  label?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  containerStyle,
  labelStyle,
  style,
  ...props
}) => {
  const labelColor = disabled ? theme.colors.disabledText : theme.colors.text;

  // Define track colors based on theme and state
  const trackColor = {
    false: theme.colors.grey, // Use standard grey for off track
    true: theme.colors.destructive,  // Use destructive (#FF4769) for on track
  };
  
  // Define thumb color (white, unless disabled)
  const thumbColor = disabled ? theme.colors.lightGrey : theme.colors.white;
  
  // iOS specific background color for the area around the thumb
  const iosBackgroundColor = theme.colors.grey; // Keep this grey for consistency

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}
        </Text>
      )}
      <RNSwitch
        trackColor={trackColor}
        thumbColor={thumbColor}
        ios_backgroundColor={iosBackgroundColor}
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
        style={style}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    marginRight: theme.spacing.md,
    flexShrink: 1,
  },
}); 
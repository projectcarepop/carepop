import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch as RNSwitch, // Rename default import
  SwitchProps as RNSwitchProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { theme } from './theme';

// Extend RNSwitchProps but omit styling props we control internally
interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  label?: string;
  // value and onValueChange are inherited from RNSwitchProps
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
  style, // Keep style prop to pass to the RNSwitch itself
  ...props // Pass remaining RNSwitchProps
}) => {
  const labelColor = disabled ? theme.colors.disabledText : theme.colors.text;

  // Define track colors based on theme and state
  const trackColor = {
    false: theme.colors.grey, // Grey track when off
    true: theme.colors.destructive,  // Use destructive color (#FF4769) when on
  };
  
  // Define thumb color (white, unless disabled)
  const thumbColor = disabled ? theme.colors.lightGrey : theme.colors.white;
  
  // iOS specific background color for the area around the thumb
  const iosBackgroundColor = theme.colors.grey; 

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
        ios_backgroundColor={iosBackgroundColor} // Only affects iOS
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
        style={style} // Apply passed styles to the Switch
        {...props}
        // Accessibility props are inherited and managed by RNSwitch
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Push label and switch apart
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    marginRight: theme.spacing.md, // Add space between label and switch
    flexShrink: 1, // Allow label to shrink if needed
  },
}); 
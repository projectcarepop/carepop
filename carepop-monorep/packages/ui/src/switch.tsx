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
  Pressable,
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

  // Rule #33: Communicate Status with Semantic Colors - use semantic colors for state
  const trackColor = {
    false: Platform.OS === 'ios' ? 'rgba(120, 120, 128, 0.16)' : 'rgba(0, 0, 0, 0.25)',
    true: theme.colors.primary,
  };
  
  // Rule #29: Contrast is Key - ensure good contrast for thumb
  const thumbColor = disabled 
    ? theme.colors.disabledBackground
    : value 
      ? Platform.OS === 'ios' ? theme.colors.white : theme.colors.white
      : Platform.OS === 'ios' ? theme.colors.white : '#f4f4f4';
  
  // iOS specific background color for the area around the thumb
  const iosBackgroundColor = 'rgba(120, 120, 128, 0.16)';
  
  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.containerPressed,
        containerStyle
      ]}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: !!value, disabled }}
      accessibilityLabel={label ? `${label}, ${value ? 'enabled' : 'disabled'}` : `Switch, ${value ? 'enabled' : 'disabled'}`}
    >
      {/* Rule #7: Establish Clear Hierarchy with Size - improved label styling */}
      {label && (
        <Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}
        </Text>
      )}
      {/* Rule #9: Create a Clear Focal Point */}
      <View style={[
        styles.switchWrapper, 
        value && styles.switchWrapperActive,
        disabled && styles.switchWrapperDisabled
      ]}>
        <RNSwitch
          trackColor={trackColor}
          thumbColor={thumbColor}
          ios_backgroundColor={iosBackgroundColor}
          onValueChange={onValueChange}
          value={value}
          disabled={disabled}
          style={[styles.switch, style]}
          {...props}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Rule #6: Golden Ratio - balance elements
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md, // Rule #5: Embrace Negative Space - better padding
    borderRadius: theme.borderRadius.md,
    width: '100%',
    // Rule #48: Consistent Design Patterns
    minHeight: 44, // Consistent with other form components
  },
  containerPressed: {
    backgroundColor: 'rgba(20, 36, 116, 0.05)', // Rule #22: Provide Feedback - subtle press effect
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    marginRight: theme.spacing.md,
    flex: 1,
    // Rule #24: Prioritize Readability
    lineHeight: theme.typography.fontSizes.md * 1.4,
  },
  switchWrapper: {
    // Rule #38: Micro-Interactions & Delightful Animations
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderRadius: 16,
    // Rule #51: Maintain Cross-Device Consistency
    padding: 2, // Consistent padding across platforms
  },
  switchWrapperActive: {
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  switchWrapperDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  switch: {
    // Rule #14: Good Design is as Little Design as Possible - clean base style
    transform: Platform.OS === 'ios' ? [{ scale: 0.8 }] : [{ scale: 1 }],
  }
}); 
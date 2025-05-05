import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from './theme';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  checkboxStyle?: StyleProp<ViewStyle>; 
  labelStyle?: StyleProp<TextStyle>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  disabled = false,
  containerStyle,
  checkboxStyle,
  labelStyle,
}) => {
  // Determine colors based on state (Rule #33: Semantic Colors)
  const boxBorderColor = disabled
    ? theme.colors.disabledBorder
    : checked
    ? theme.colors.primary 
    : theme.colors.textSecondary;

  const boxBackgroundColor = disabled
    ? theme.colors.disabledBackground 
    : checked
    ? theme.colors.primary 
    : 'transparent';

  const checkmarkColor = disabled
    ? theme.colors.disabledText 
    : theme.colors.white;
    
  const labelColor = disabled 
    ? theme.colors.disabledText 
    : checked 
    ? theme.colors.text 
    : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.containerPressed,
        containerStyle
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      accessibilityHint={checked ? "Uncheck this option" : "Check this option"}
    >
      {/* Rule #22: Provide Feedback for User Actions */}
      <View 
        style={[
          styles.checkbox,
          {
            borderColor: boxBorderColor,
            backgroundColor: boxBackgroundColor,
          },
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
          checkboxStyle,
        ]}
      >
        {checked && (
          <MaterialIcons 
            name="check" 
            size={16} 
            color={checkmarkColor} 
            style={styles.checkIcon}
          />
        )}
      </View>
      {label && (
        <Text 
          style={[styles.label, { color: labelColor }, labelStyle]}
          numberOfLines={2}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm, // Rule #19: Contextual Hints - improved touch area
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    // Rule #48: Limit Design Patterns
    minHeight: 44, // Minimum height for better touch targets
  },
  containerPressed: {
    backgroundColor: 'rgba(20, 36, 116, 0.08)', // Rule #10: Create Rhythm - stronger feedback
  },
  checkbox: {
    width: 22, 
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, 
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md, // Rule #5: Embrace Negative Space - better spacing
    // Rule #9: Clear Focal Point
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxChecked: {
    // Rule #38: Micro-Interactions & Delightful Animations
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxDisabled: {
    opacity: 0.6, // Rule #34: Use Color to Guide Actions - less opacity for disabled
    shadowOpacity: 0,
    elevation: 0,
  },
  checkIcon: {
    // Rule #38: Micro-Interactions - make check icon pop
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.normal,
    // Rule #23: Typography Hierarchy - improved readability
    flexShrink: 1,
    lineHeight: theme.typography.fontSizes.md * 1.4,
  },
}); 
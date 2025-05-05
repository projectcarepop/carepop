import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
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
  // Determine colors based on state
  const boxBorderColor = disabled
    ? theme.colors.disabledBorder
    : checked
    ? theme.colors.primary // Checked border matches background
    : theme.colors.textSecondary; // Use secondary text color for unchecked border

  const boxBackgroundColor = disabled
    ? theme.colors.disabledBackground // Use disabled background when disabled
    : checked
    ? theme.colors.primary // Solid blue background when checked
    : 'transparent'; // Transparent background when unchecked

  const checkmarkColor = disabled
    ? theme.colors.disabledText // Use disabled text color for checkmark if disabled & checked
    : theme.colors.white; // White checkmark when checked & enabled
    
  const labelColor = disabled ? theme.colors.disabledText : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, containerStyle]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
    >
      {/* Style the View as the checkbox box */}
      <View 
        style={[
          styles.checkbox,
          {
            borderColor: boxBorderColor,
            backgroundColor: boxBackgroundColor,
          },
          checkboxStyle, // Allow overriding box style
        ]}
      >
        {/* Only render checkmark icon when checked */}
        {checked && (
          <MaterialIcons name="check" size={16} color={checkmarkColor} />
        )}
      </View>
      {label && (
        <Text style={[styles.label, { color: labelColor }, labelStyle]}>
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
    paddingVertical: theme.spacing.xs, // Add some padding for better touch area
  },
  checkbox: {
    width: 20, // Slightly smaller box
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Slightly thicker border
    borderRadius: theme.borderRadius.sm, // Revert back to sm
    marginRight: theme.spacing.sm,
    // backgroundColor is now dynamic
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    // color is now dynamic
  },
}); 
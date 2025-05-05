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

interface RadioButtonProps {
  label?: string;
  value: string; // Value associated with this radio button
  checked: boolean;
  onPress: (value: string) => void; // Pass value back on press
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  radioStyle?: StyleProp<ViewStyle>; // Style for the radio icon container
  labelStyle?: StyleProp<TextStyle>;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  checked,
  onPress,
  disabled = false,
  containerStyle,
  radioStyle,
  labelStyle,
}) => {
  const iconName = checked ? 'radio-button-checked' : 'radio-button-unchecked';
  const iconColor = disabled
    ? theme.colors.disabledText
    : checked
    ? theme.colors.primary
    : theme.colors.textSecondary;
  const labelColor = disabled
    ? theme.colors.disabledText
    : checked
    ? theme.colors.primary
    : theme.colors.text;

  const handlePress = () => {
    if (!disabled) {
      onPress(value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
    >
      {/* Use View for potential custom styling if needed, though icon is main visual */}
      <View style={[styles.radio, radioStyle]}>
        <MaterialIcons name={iconName} size={24} color={iconColor} />
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
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  radio: { // Container for the icon
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    flexShrink: 1,
    paddingLeft: theme.spacing.xs,
  },
}); 
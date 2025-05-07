import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
// We can use MaterialIcons again, or choose another set
// import { MaterialIcons } from '@expo/vector-icons';
import { theme } from './theme';

interface RadioButtonProps extends ViewProps {
  label?: string;
  value: string; // Each radio button needs a unique value within its group
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
  labelStyle?: TextStyle;
  testID?: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  selectedValue,
  onSelect,
  disabled = false,
  labelStyle,
  style,
  testID,
  ...rest
}) => {
  const isSelected = value === selectedValue;

  const handlePress = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  const radioBaseStyle: ViewStyle = {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: label ? theme.spacing.sm : 0,
    opacity: disabled ? 0.65 : 1,
  };

  const radioSelectedStyle: ViewStyle = isSelected ? {}
    : { backgroundColor: theme.colors.background };

  const innerDotStyle: ViewStyle = {
    width: 11,
    height: 11,
    borderRadius: theme.borderRadius.full,
    backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
  };

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      testID={testID}
      {...rest}
    >
      <View style={[radioBaseStyle, radioSelectedStyle]}>
        {isSelected && <View style={innerDotStyle} />}
      </View>
      {label && (
        <Text style={[styles.label, disabled && styles.disabledLabel, labelStyle]}>
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
  },
  label: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    // fontFamily: theme.typography.fontFamily,
  },
  disabledLabel: {
    color: theme.colors.disabled,
  },
}); 
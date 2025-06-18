import React, { createContext, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { theme } from './theme';

// --- Context Definition ---

interface RadioGroupContextValue {
  selectedValue: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// --- RadioGroup Component ---

interface RadioGroupProps extends ViewProps {
  children: React.ReactNode;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  defaultValue = null,
  onValueChange,
  disabled = false,
  style,
  ...rest
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string | null>(
    defaultValue
  );

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
  };

  const contextValue: RadioGroupContextValue = {
    selectedValue,
    onSelect: handleSelect,
    disabled,
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View style={[styles.groupContainer, style]} {...rest} accessibilityRole="radiogroup">
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
};

// --- RadioButton (Item) Component ---

interface RadioButtonProps extends ViewProps {
  label?: string;
  value: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  style,
  ...rest
}) => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioButton must be used within a RadioGroup');
  }

  const { selectedValue, onSelect, disabled: groupDisabled } = context;
  const isSelected = value === selectedValue;
  const isDisabled = groupDisabled;

  return (
    <Pressable
      style={[styles.itemContainer, isDisabled ? styles.disabled : {}, style]}
      onPress={() => onSelect(value)}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      hitSlop={10}
      {...rest}
    >
      <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
        {isSelected && <View style={styles.indicatorInnerDot} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
};

// --- StyleSheet ---

const styles = StyleSheet.create({
  groupContainer: {
    // Layout is now controlled by how you arrange RadioButton components
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorSelected: {
    borderColor: theme.colors.primary,
  },
  indicatorInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: theme.colors.primary,
  },
  label: {
    marginLeft: theme.spacing.md,
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.foreground,
  },
});
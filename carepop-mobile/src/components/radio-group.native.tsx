import React, { useState, Children, cloneElement, isValidElement } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { RadioButton } from './radio-button'; // Import the component itself

interface RadioGroupProps extends ViewProps {
  children: React.ReactNode;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  // Add layout direction if needed (e.g., 'row' or 'column')
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  defaultValue = null,
  onValueChange,
  style,
  ...rest
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    defaultValue
  );

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
  };

  // Clone children to pass down props
  const radioButtons = Children.map(children, (child) => {
    // Check if it's a valid element and likely our RadioButton
    if (isValidElement(child) && child.type === RadioButton) {
      // Type assertion might be needed if TS still struggles
      // const props = child.props as React.ComponentProps<typeof RadioButton>;
      return cloneElement(child as React.ReactElement<React.ComponentProps<typeof RadioButton>>, {
        selectedValue: selectedValue,
        onSelect: handleSelect,
      });
    }
    return child; // Return non-RadioButton children as is
  });

  return (
    <View style={[styles.container, style]} {...rest} accessibilityRole="radiogroup">
      {radioButtons}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Default layout is column
  },
}); 
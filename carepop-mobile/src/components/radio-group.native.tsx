import React, { useState, Children, cloneElement, isValidElement } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { RadioButton } from './radio-button.native'; // Ensure path is correct

/**
 * Props for the RadioGroup component.
 * Extends standard React Native ViewProps.
 */
interface RadioGroupProps extends ViewProps {
  /** Child elements, expected to be RadioButton components. */
  children: React.ReactNode;
  /** The initial value that should be selected. */
  defaultValue?: string | null;
  /** Callback function triggered when the selected value changes. Passes the new value. */
  onValueChange?: (value: string) => void;
  // TODO: Add optional layoutDirection prop ('column' | 'row') if horizontal layout is needed.
}

/**
 * A component that groups multiple RadioButton components, managing their selection state.
 * It provides the selected value and selection handler to its RadioButton children.
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  defaultValue = null,
  onValueChange,
  style,
  ...rest // Other ViewProps for the container View
}) => {
  // State to hold the currently selected radio button value within the group
  const [selectedValue, setSelectedValue] = useState<string | null>(
    defaultValue
  );

  /**
   * Handles selection changes from child RadioButton components.
   * Updates the internal state and calls the onValueChange prop.
   * @param {string} value - The value of the selected RadioButton.
   */
  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value); // Notify parent component of the change
  };

  // Iterate over children, find RadioButton components, and inject necessary props
  const radioButtons = Children.map(children, (child) => {
    // Check if the child is a valid React element and if its type is RadioButton.
    // Note: This check might fail if RadioButton is wrapped (e.g., React.memo) or heavily styled.
    // Using Context might be more robust for complex scenarios, but this is common for direct children.
    if (isValidElement(child) && child.type === RadioButton) {
      // Clone the RadioButton element, adding/overriding props for group management.
      // Type assertion is used here, assuming direct RadioButton children.
      return cloneElement(child as React.ReactElement<React.ComponentProps<typeof RadioButton>>, {
        selectedValue: selectedValue, // Pass the currently selected value down
        onSelect: handleSelect,       // Pass the group's handler down
      });
    }
    return child; // Return other children (like Views, Text) unmodified
  });

  return (
    <View 
      style={[styles.container, style]} 
      {...rest} 
      accessibilityRole="radiogroup" // Accessibility role for the group
    >
      {radioButtons}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Default layout arranges radio buttons vertically
    flexDirection: 'column', 
  },
}); 
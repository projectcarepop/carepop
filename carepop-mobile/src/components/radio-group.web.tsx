'use client';

import React, { useState, Children, cloneElement, isValidElement } from 'react';
import { View, type ViewProps } from 'react-native';
import { RadioButton } from './radio-button.web'; // Ensure import works for web
import tw from 'twrnc';

interface RadioGroupProps extends ViewProps {
  children: React.ReactNode;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  className?: string; // Allow custom container classes
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  defaultValue = null,
  onValueChange,
  className = '',
  ...rest
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    defaultValue
  );

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
  };

  const radioButtons = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === RadioButton) {
      return cloneElement(child as React.ReactElement<React.ComponentProps<typeof RadioButton>>, {
        selectedValue: selectedValue,
        onSelect: handleSelect,
      });
    }
    return child;
  });

  // Default Tailwind classes (flex-col)
  const containerClasses = `flex flex-col`;
  const combinedClasses = `${containerClasses} ${className}`.trim().replace(/\s+/g, ' ');

  return (
    <View style={tw`${combinedClasses}`} {...rest} accessibilityRole="radiogroup">
      {radioButtons}
    </View>
  );
}; 
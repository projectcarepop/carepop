"use client"; // Needed for onClick handler

import React from 'react';
import { theme } from './theme'; // Import theme for colors/spacing
// Remove icon import if no longer needed
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import icons

// Define props similar to the native Switch, but web-specific
interface SwitchProps {
  label?: string;
  value: boolean; // Current state (on/off)
  onValueChange: (newValue: boolean) => void; // Callback when toggled
  disabled?: boolean;
  style?: React.CSSProperties; // Allow passing standard CSS styles
  labelStyle?: React.CSSProperties;
  // We don't need trackColor/thumbColor props directly if we hardcode the desired web look
}

// Reset sizes to standard defaults if desired, or keep previous
const trackHeight = 'h-6'; // e.g., 24px
const trackWidth = 'w-11'; // e.g., 44px
const thumbSize = 'h-5 w-5'; // e.g., 20px
// Remove iconSize

export const Switch: React.FC<SwitchProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  style,
  labelStyle,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  // Determine colors based on state and theme
  const trackBgColor = value ? theme.colors.destructive : theme.colors.grey; // Destructive when on, grey when off
  const thumbBgColor = theme.colors.white; // Always white for the thumb
  // Remove iconColor

  // Tailwind classes for track
  const trackClasses = `
    ${trackWidth} ${trackHeight} rounded-full relative inline-flex items-center transition-colors duration-200 ease-in-out
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  // Tailwind classes for thumb (remove flex centering)
  const thumbClasses = `
    ${thumbSize} rounded-full shadow transform transition-transform duration-200 ease-in-out inline-block 
    ${value ? 'translate-x-6' : 'translate-x-0.5'} 
  `; // Adjust translate-x-6 based on w-11 track and w-5 thumb

  const labelColor = disabled ? theme.colors.disabledText : theme.colors.text;


  return (
    <div className="flex items-center justify-between mb-4" style={style}>
      {label && (
        <span 
          className="mr-3 text-base" // Use theme font size/weight if Tailwind extended
          style={{ color: labelColor, ...labelStyle }}
          onClick={handleToggle} // Allow clicking label to toggle
        >
          {label}
        </span>
      )}
      {/* Track Container */}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={handleToggle}
        disabled={disabled}
        className={trackClasses}
        style={{ backgroundColor: disabled ? theme.colors.disabledBackground : trackBgColor }}
        // Add other styles from props if needed, carefully merging
      >
        {/* Thumb - No icon inside */}
        <span
          className={thumbClasses}
          style={{ backgroundColor: disabled ? theme.colors.lightGrey : thumbBgColor }}
        />
      </button>
    </div>
  );
};

// No separate StyleSheet needed for web using Tailwind/inline styles 
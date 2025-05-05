"use client"; // Required for useState

import React, { useState } from 'react';
import {
  Button,
  Card,
  TextInput,
  Checkbox,
  RadioButton,
  RadioGroup,
  Switch
} from '@repo/ui';
import { theme } from '@repo/ui/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Define sample radio options
const radioOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3 (Disabled)', value: '3', disabled: true },
  { label: 'Option 4', value: '4' },
];

export default function Page() {
  const [textValue, setTextValue] = useState('');
  // Add state for the interactive checkbox
  const [isChecked, setIsChecked] = useState(false);
  // Add state for the selected radio value
  const [selectedRadioValue, setSelectedRadioValue] = useState<string | null>('2'); // Default to option 2
  
  // Define icon color (use default web textSecondary for simplicity here)
  const iconColor = theme.colors.textSecondary;

  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLabeledSwitchOn, setIsLabeledSwitchOn] = useState(true);
  const [isDisabledSwitchOn, setIsDisabledSwitchOn] = useState(false);
  
  const handleSwitchChange = (value: boolean) => setIsSwitchOn(value);
  const handleLabeledSwitchChange = (value: boolean) => setIsLabeledSwitchOn(value);
  const handleDisabledSwitchChange = (value: boolean) => setIsDisabledSwitchOn(value);

  const [selectedRadio, setSelectedRadio] = useState('option1');
  const [isIndeterminateChecked, setIsIndeterminateChecked] = useState(false);
  const [isDisabledChecked, setIsDisabledChecked] = useState(true);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">UI Component Showcase</h1>

        {/* Button Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <Button onPress={() => alert('Primary Pressed!')} title="Primary Button" variant="primary" />
            <Button onPress={() => alert('Secondary Solid Pressed!')} title="Secondary Solid" variant="secondary-solid" />
            <Button onPress={() => alert('Secondary Outline Pressed!')} title="Secondary Outline" variant="secondary-outline" />
            <Button onPress={() => alert('Destructive Pressed!')} title="Destructive" variant="destructive" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Button onPress={() => {}} title="Primary Disabled" variant="primary" disabled />
            <Button onPress={() => {}} title="Secondary Solid Disabled" variant="secondary-solid" disabled />
            <Button onPress={() => {}} title="Secondary Outline Disabled" variant="secondary-outline" disabled />
            <Button onPress={() => {}} title="Destructive Disabled" variant="destructive" disabled />
          </div>
        </div>

        {/* TextInput Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Text Inputs</h2>
          <TextInput
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            helperText="Please enter a valid email."
            leadingIcon={<MaterialIcons name="mail-outline" size={20} color={iconColor} />}
          />
          <TextInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            helperText="Must be at least 8 characters."
            trailingIcon={<MaterialIcons name="visibility-off" size={20} color={iconColor} />}
          />
          <TextInput
            label="Search"
            placeholder="Search terms..."
            leadingIcon={<MaterialIcons name="search" size={20} color={iconColor} />}
            trailingIcon={<MaterialIcons name="mic" size={20} color={iconColor} />}
          />
           <TextInput
            label="Error State Input"
            placeholder="Something wrong here"
            error="This field has an error."
            labelStyle={{ color: theme.colors.destructive }}
            trailingIcon={<MaterialIcons name="error-outline" size={20} color={theme.colors.destructive} />}
          />
           <TextInput
            label="Disabled Input"
            placeholder="Cannot edit"
            value="Some pre-filled value"
            disabled={true}
            leadingIcon={<MaterialIcons name="lock-outline" size={20} color={theme.colors.disabledText} />}
        />
      </div>

        {/* Checkbox Section */}
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-600">Checkboxes</h2>
        <div className="space-y-4 w-full items-start"> {/* Use items-start */} 
          <Checkbox
            label="Interactive Checkbox"
            checked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
          />
          <Checkbox
            label="Already Checked"
            checked={true}
            onPress={() => { /* Usually you'd have state here */ }}
          />
          <Checkbox
            label="Disabled Checkbox"
            checked={false}
            disabled={true}
            onPress={() => {}}
          />
          <Checkbox
            label="Disabled Checked"
            checked={true}
          disabled={true}
            onPress={() => {}}
        />
      </div>

        {/* Radio Button Section */}
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-600">Radio Buttons</h2>
        <div className="w-full items-start">
          <RadioGroup
            label="Choose one option:"
            options={radioOptions}
            selectedValue={selectedRadioValue}
            onValueChange={setSelectedRadioValue}
        />
      </div>

        {/* Switch Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Switches</h2>
          <Switch
            label="Basic Switch"
            value={isSwitchOn}
            onValueChange={handleSwitchChange}
          />
          <Switch
            label="Initially On Switch"
            value={isLabeledSwitchOn}
            onValueChange={handleLabeledSwitchChange}
          />
          <Switch
            label="Disabled Switch"
            value={isDisabledSwitchOn}
            onValueChange={handleDisabledSwitchChange}
          disabled={true}
        />
      </div>

        {/* Card Example - Ensure this has some content */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Card</h2>
          <div className={`bg-${theme.colors.surface} rounded-${theme.borderRadius.lg} shadow-md p-${theme.spacing.md}`}>
            <Card>
              <p style={{ color: theme.colors.text }}>This is content inside a card.</p>
            </Card>
          </div>
        </div>
      </div>
      </div>
  );
}

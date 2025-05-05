"use client";

import React, { useState } from 'react';
// import Image, { type ImageProps } from "next/image"; // Remove unused import
import {
  Button,
  Card,
  TextInput,
  Checkbox,
  RadioGroup,
  // RadioButton, // Keep removed
  Switch,
  // theme // Keep removed
} from "@repo/ui";
// import styles from "./page.module.css"; // Keep removed
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Remove unused ThemeImage component definition
/*
type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};
const ThemeImage = (props: Props) => {
  // ...
};
*/

export default function Home() {
  const [textValue, setTextValue] = useState('');
  const [textValueError, setTextValueError] = useState<string | undefined>(undefined);
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState<string | null>('option1');
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);

  const handleTextChange = (text: string) => {
      setTextValue(text);
      if (text.length > 0 && text.length < 3) {
          setTextValueError('Must be at least 3 characters');
      } else {
          setTextValueError(undefined);
      }
  }

  // Define options for RadioGroup
  const radioOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3 (Disabled)", value: "option3", disabled: true },
  ];

  // Create Icon components
  const MagnifyIcon = <MaterialIcons name="search" size={20} color="#888" />;
  const CloseIcon = <MaterialIcons name="close" size={20} color="#888" />;

  return (
    <div /* className={styles.page} */ >
      <main /* className={styles.main} */ style={{ padding: 20 }}>
        <h1 /* style={pageStyles.heading} */ >@repo/ui Web Component Tests</h1>

        <Card /* style={pageStyles.card} */>
            <h2 /* style={pageStyles.componentTitle} */>Button</h2>
            <Button title="Primary Button" variant="primary" onPress={() => alert('Primary Pressed')} />
            <div style={{ marginBottom: '12px' }} />
            <Button title="Secondary Solid" variant="secondary-solid" onPress={() => alert('Secondary Solid Pressed')} />
            <div style={{ marginBottom: '12px' }} />
            <Button title="Secondary Outline" variant="secondary-outline" onPress={() => alert('Secondary Outline Pressed')} />
            <div style={{ marginBottom: '12px' }} />
            <Button title="Destructive" variant="destructive" onPress={() => alert('Destructive Pressed')} />
            <div style={{ marginBottom: '12px' }} />
            <Button title="Disabled Primary" variant="primary" onPress={() => {}} disabled />
        </Card>

        <div style={{ marginBottom: '24px' }} />

         <Card /* style={pageStyles.card} */>
            <h2 /* style={pageStyles.componentTitle} */>Card</h2>
            <p>This content is inside a Card component.</p>
        </Card>

         <div style={{ marginBottom: '24px' }} />

         <Card /* style={pageStyles.card} */>
             <h2 /* style={pageStyles.componentTitle} */>TextInput</h2>
             <TextInput
                label="Standard Input"
                placeholder="Enter text here"
                value={textValue}
                onChangeText={handleTextChange}
                helperText="This is some helper text."
             />
              <div style={{ marginBottom: '12px' }} />
             <TextInput
                label="Input with Error"
                placeholder="Enter text (min 3 chars)"
                value={textValue}
                onChangeText={handleTextChange}
                error={textValueError}
             />
              <div style={{ marginBottom: '12px' }} />
              <TextInput
                label="Input with Icons"
                placeholder="Search"
                leadingIcon={MagnifyIcon}
                trailingIcon={CloseIcon}
                value={textValue}
                onChangeText={handleTextChange}
             />
              <div style={{ marginBottom: '12px' }} />
              <TextInput
                label="Disabled Input"
                placeholder="Cannot edit"
                value="Some disabled text"
                disabled
             />
         </Card>

         <div style={{ marginBottom: '24px' }} />

         <Card /* style={pageStyles.card} */>
             <h2 /* style={pageStyles.componentTitle} */ style={{ fontSize: 18, fontWeight: '500', marginBottom: 16 }}>Checkbox</h2>
             <Checkbox
                label="Accept Terms"
                checked={isChecked}
                onPress={() => setIsChecked(!isChecked)}
             />
              <div style={{ marginBottom: '12px' }} />
             <Checkbox
                label="Disabled Unchecked"
                checked={false}
                onPress={() => {}}
                disabled
             />
              <div style={{ marginBottom: '12px' }} />
              <Checkbox
                label="Disabled Checked"
                checked={true}
                onPress={() => {}}
                disabled
             />
         </Card>

          <div style={{ marginBottom: '24px' }} />

          <Card /* style={pageStyles.card} */>
             <h2 /* style={pageStyles.componentTitle} */>RadioButton</h2>
             <RadioGroup
                label="Choose an option:"
                options={radioOptions}
                selectedValue={radioValue}
                onValueChange={setRadioValue}
              >
              </RadioGroup>
               <p style={{ marginTop: '8px' }}>Selected: {radioValue || 'None'}</p>
          </Card>

            <div style={{ marginBottom: '24px' }} />

          <Card /* style={pageStyles.card} */>
             <h2 /* style={pageStyles.componentTitle} */>Switch</h2>
             <Switch
                label="Enable Feature"
                value={isSwitchEnabled}
                onValueChange={setIsSwitchEnabled}
             />
              <div style={{ marginBottom: '12px' }} />
              <Switch
                label="Disabled Off"
                value={false}
                onValueChange={() => {}}
                disabled
             />
               <div style={{ marginBottom: '12px' }} />
               <Switch
                label="Disabled On"
                value={true}
                onValueChange={() => {}}
                disabled
             />
          </Card>

      </main>
    </div>
  );
}

// Remove or adjust pageStyles definition if not used
/*
const pageStyles = {
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    textAlign: 'center',
  },
  card: {
    marginBottom: '24px',
    padding: '16px',
    border: '1px solid #eee',
    borderRadius: '8px',
  },
  componentTitle: {
     fontSize: '18px',
     fontWeight: '500',
     marginBottom: '16px',
  },
  componentSpacing: {
    marginBottom: '12px',
  },
};
*/

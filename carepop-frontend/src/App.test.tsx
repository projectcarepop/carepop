import React from 'react';
import {render, screen} from '@testing-library/react-native';
import App from './App';

// Basic smoke test for the App component
describe('<App />', () => {
  it('renders correctly', () => {
    render(<App />);
    // Example: Check if some initial text or element is present
    // Replace 'Welcome to React Native' with actual text from your App.tsx if different
    // const welcomeText = screen.getByText(/welcome to react native/i);
    // expect(welcomeText).toBeTruthy();

    // For now, just check if it renders without crashing
    expect(screen).toBeDefined();
  });
}); 
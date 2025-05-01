/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          'dark-blue': {
            light: '#142474', // Original for light mode
            dark: '#788BFF',  // Lighter variant for dark mode
          },
          pink: {
            light: '#F421DF', // Original for light mode
            dark: '#F421DF',  // Keep vibrant for dark mode (can adjust later)
          },
        },
        neutral: {
          light: '#FFFFFF',   // White background for light mode
          dark: '#212121',   // Dark gray background for dark mode
        },
        text: {
          light: '#111827', // Dark gray text for light mode
          dark: '#E5E7EB',  // Light gray text for dark mode
        }
      },
      fontFamily: {
        sans: ['Inter', 'System', 'sans-serif'], // Use Inter as the primary sans font
        serif: ['Georgia', 'serif'], // Example serif font
      }
    },
  },
  plugins: [],
}


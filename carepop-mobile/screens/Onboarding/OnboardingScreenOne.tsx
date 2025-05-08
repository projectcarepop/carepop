import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../src/components/theme';
// import Svg from 'react-native-svg'; // Remove SVG import
// TODO: Setup SVG transformer or load SVG content directly for illustration
// import Onboarding1 from '../../assets/onboarding-1.svg'; 

// Simplified props type
interface OnboardingScreenOneProps {
  navigation?: any; // Keep for potential future use, but not used for swipe
}

export const OnboardingScreenOne: React.FC<OnboardingScreenOneProps> = ({ navigation }) => {
  return (
    <View style={styles.container}> {/* Main container */} 
      <Image 
        source={require('../../assets/onboarding-1.png')} 
        style={styles.illustration} // Use illustration style for Image
        resizeMode="contain" 
      />
      <View style={styles.textContainer}> {/* Container for all text content */}
        <Text style={styles.headline}>Welcome to Carepop!</Text>
        <Text style={styles.bodyText}>
          Your journey to accessible, inclusive healthcare starts here. 
          Find the best professionals, manage appointments, and take control of your well-being, 
          all in one secure place.
        </Text>
        <Text style={styles.tagline}>Your Health. Your Choice. Your Space.</Text>
      </View>
      <Text style={styles.progressIndicator}>● ○ ○</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.background, 
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl * 1.5, // Adjusted padding
  },
  illustration: { 
    width: 300, 
    height: 300, 
    marginBottom: theme.spacing.xl, // Increased space below image
  },
  textContainer: { 
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.xl, // Space below text, above indicator
  },
  headline: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary, 
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    fontSize: theme.typography.body,
    color: theme.colors.text, 
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.body * 1.5,
  },
  tagline: {
    fontSize: theme.typography.subheading,
    fontWeight: '600',
    color: theme.colors.secondary, 
    textAlign: 'center',
    marginBottom: theme.spacing.lg, // Add some margin below tagline
  },
  progressIndicator: {
    fontSize: theme.typography.heading,
    color: theme.colors.textMuted, 
    // Positioned by justifyCoSntent: 'center' in container, and margins
  },
}); 
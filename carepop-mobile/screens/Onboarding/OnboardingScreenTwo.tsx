import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../src/components/theme';
// import Svg from 'react-native-svg'; // Remove SVG import
// TODO: Setup SVG transformer or load SVG content directly for illustration
// import Onboarding2 from '../../assets/onboarding-2.svg';

interface OnboardingScreenTwoProps {
  navigation?: any; // Keep for potential future use
}

export const OnboardingScreenTwo: React.FC<OnboardingScreenTwoProps> = ({ navigation }) => {
  return (
    <View style={styles.container}> 
      <Image 
        source={require('../../assets/onboarding-2.png')} 
        style={styles.illustration} 
        resizeMode="contain" 
      />
      <View style={styles.textContainer}> 
        <Text style={styles.headline}>Your Health Journey, Simplified.</Text>
        <Text style={styles.bodyText}>
          Easily book appointments that fit your schedule. 
          Find providers who understand your needs in our curated directory. 
          Securely track your health goals, medications, and cycles to stay informed and empowered.
        </Text>
        <Text style={styles.tagline}>All Your Care Essentials, Right Here.</Text>
      </View>
      <Text style={styles.progressIndicator}>○ ● ○</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.background, 
    alignItems: 'center',
    justifyContent: 'center', 
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl * 1.5, 
  },
  illustration: { 
    width: 300, 
    height: 300, 
    marginBottom: theme.spacing.xl, 
  },
  textContainer: { 
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.xl, 
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
    marginBottom: theme.spacing.lg, 
  },
  progressIndicator: {
    fontSize: theme.typography.heading,
    color: theme.colors.textMuted, 
  },
}); 
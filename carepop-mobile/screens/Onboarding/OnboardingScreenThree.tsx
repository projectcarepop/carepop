import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../src/components/theme';
import { Button } from '../../src/components';

interface OnboardingScreenThreeProps {
  onComplete?: () => void; // Function to call when onboarding finishes
}

export const OnboardingScreenThree: React.FC<OnboardingScreenThreeProps> = ({ onComplete }) => {

  const handleComplete = () => {
    console.log('Onboarding finished, calling onComplete');
    onComplete?.();
  };

  return (
    <View style={styles.container}> 
      <Image 
        source={require('../../assets/onboarding-3.png')} 
        style={styles.illustration} 
        resizeMode="contain" 
      />
      <View style={styles.textContainer}> 
        <Text style={styles.headline}>Secure, Confidential & Inclusive.</Text>
        <Text style={styles.bodyText}>
          Your privacy is our priority. We use strong security and encryption 
          to protect your sensitive health information. 
          Carepop is a safe space for everyone.
        </Text>
        <Text style={styles.tagline}>Healthcare with Respect & Confidentiality.</Text>
      </View>
      <Button 
        title="Get Started" 
        onPress={handleComplete} 
        style={styles.getStartedButton}
      />
      <Text style={styles.progressIndicator}>○ ○ ●</Text>
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
    width: 250, 
    height: 250, 
    marginBottom: theme.spacing.lg, // A bit less margin for button space
  },
  textContainer: { 
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.lg, // Space above button
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
    marginBottom: theme.spacing.md, // Space below tagline, above button
  },
  getStartedButton: {
    width: '80%', 
    alignSelf: 'center',
    marginBottom: theme.spacing.lg, // Space below button, above indicator
  },
  progressIndicator: {
    fontSize: theme.typography.heading,
    color: theme.colors.textMuted, 
  },
}); 
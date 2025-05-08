import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../src/components/theme';

export const OnboardingScreenOne: React.FC = ({ /* navigation */ }) => {
  return (
    <View style={styles.container}>
       <Image 
        source={require('../../assets/onboarding-1.png')} 
        style={styles.illustration} // Use illustration style for Image
        resizeMode="contain" 
      />
      <View style={styles.textContainer}> 
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
    // Positioned by justifyCoSntent: 'center' in container, and margins
  },
}); 
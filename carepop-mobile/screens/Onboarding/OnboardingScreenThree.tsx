import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Button } from '../../src/components/button.native';
import { theme } from '../../src/components/theme';
import { PartyPopper } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';

// This screen will likely be part of a larger stack that, upon completion,
// navigates the user to the main app (e.g., Auth or Dashboard).
// The onComplete prop is a good pattern for this.
export const OnboardingScreenThree = () => {
  const { completeOnboarding } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/onboarding-3.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.headline}>Secure & Confidential</Text>
            <Text style={styles.bodyText}>
              Your privacy is our priority. We use strong security and
              encryption to protect your sensitive health information. Carepop
              is a safe space for everyone.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            size="lg"
            onPress={completeOnboarding}
            style={{ flex: 1 }} // Make button take full width of footer
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  illustration: {
    width: 300,
    height: 300,
  },
  textContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headline: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  bodyText: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 60,
  },
});
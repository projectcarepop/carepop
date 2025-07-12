import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../src/components/button.native';
import { theme } from '../../src/components/theme';

type OnboardingScreenThreeProps = {
  onComplete: () => void;
};

export const OnboardingScreenThree = ({
  onComplete,
}: OnboardingScreenThreeProps) => {
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      onComplete();
    } catch (e) {
      console.error('Failed to save onboarding status', e);
      // Even if it fails, we should still try to navigate.
      onComplete();
    }
  };

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
            variant="default"
            onPress={handleGetStarted}
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
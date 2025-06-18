import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme, Button } from '../../src/components';
import { Ionicons } from '@expo/vector-icons';

// Assuming you have a RootStackParamList that includes an Onboarding stack
// This is a placeholder, adjust to your actual navigation structure
type OnboardingStackParamList = {
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  // ... and so on
};

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingOne'>;

export const OnboardingScreenOne: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/onboarding-1.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.headline}>Welcome to Carepop!</Text>
            <Text style={styles.bodyText}>
              Your journey to accessible, inclusive healthcare starts here. Find
              professionals, manage appointments, and take control of your
              well-being.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
            {/* Dots would go here */}
            <Button
                size="lg"
                onPress={() => navigation.navigate('OnboardingTwo')}
                icon={<Ionicons name="arrow-forward" size={24} color={theme.colors.primaryForeground} />}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 60,
  },
});
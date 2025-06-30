import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Corrected Screen Imports
import { OnboardingScreenOne } from '../screens/OnboardingScreenOne';
import { OnboardingScreenTwo } from '../screens/OnboardingScreenTwo';
import { OnboardingScreenThree } from '../screens/OnboardingScreenThree';
import { SplashScreen } from '../screens/SplashScreen';

export type OnboardingStackParamList = {
  Splash: undefined;
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  OnboardingThree: undefined;
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="OnboardingOne" component={OnboardingScreenOne} />
      <OnboardingStack.Screen name="OnboardingTwo" component={OnboardingScreenTwo} />
      <OnboardingStack.Screen name="OnboardingThree" component={OnboardingScreenThree} />
    </OnboardingStack.Navigator>
  );
} 
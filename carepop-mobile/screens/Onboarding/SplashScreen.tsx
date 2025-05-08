import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { theme } from '../../src/components/theme'; // Adjust path based on new location
// import type { NativeStackScreenProps } from '@react-navigation/native-stack'; // Removed complex typing for now
// import type { OnboardingStackParamList } from '../../App'; // Removed complex typing for now

// Simplified props type
interface SplashScreenProps {
  navigation?: any; // Use basic navigation prop type
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {

  // Navigate automatically after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // navigation.replace('OnboardingOne'); // Use replace so user can't go back to splash
      // Temporarily disable navigation for testing splash screen visuals
    }, 2500); // 2.5 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/carepop-logo-white.png')} 
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250, 
    height: 150, 
    resizeMode: 'contain',
  }
}); 
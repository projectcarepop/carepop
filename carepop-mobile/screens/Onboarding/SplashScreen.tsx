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
      {/* <LinearGradient
        // Subtle white overlay gradient
        colors={['rgba(255,255,255,0.2)', 'transparent', 'rgba(255,255,255,0.2)']}
        style={StyleSheet.absoluteFill} // Fill the container
      /> */}
      {/* <Text style={styles.appName}>CarePoP</Text>
      <ActivityIndicator size="large" color={theme.colors.background} /> */}
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
    backgroundColor: theme.colors.primary, // Background color like Login button
    alignItems: 'center',
    justifyContent: 'center',
  },
  // appName: {
  //   fontSize: theme.typography.heading * 1.5, // Made text bigger
  //   fontWeight: 'bold',
  //   color: theme.colors.background, // White text for contrast
  //   marginBottom: theme.spacing.xl,
  // },
  logo: {
    width: 250, // Adjust as needed
    height: 150, // Adjust as needed
    resizeMode: 'contain',
  }
}); 
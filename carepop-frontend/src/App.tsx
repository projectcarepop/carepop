import React from 'react';
// import { SafeAreaView, Text, StyleSheet } from 'react-native'; // Original imports

import './global.css'; // Import NativeWind styles
import LoginScreen from './screens/Auth/LoginScreen'; // Import LoginScreen
// import RegisterScreen from './screens/Auth/RegisterScreen'; // Can switch to this later

const App = () => {
  // Temporarily render LoginScreen
  return <LoginScreen />;

  // Original placeholder:
  // return (
  //   <SafeAreaView style={styles.container}>
  //     <Text style={styles.text}>CarePoP Frontend Placeholder</Text>
  //   </SafeAreaView>
  // );
};

// Original styles (can be removed or kept if needed elsewhere)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     fontSize: 18,
//   },
// });

export default App; 
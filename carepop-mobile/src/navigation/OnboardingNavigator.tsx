import React from 'react';
import Swiper from 'react-native-swiper';
import { View, StyleSheet } from 'react-native';
import { OnboardingScreenOne } from '../screens/OnboardingScreenOne';
import { OnboardingScreenTwo } from '../screens/OnboardingScreenTwo';
import { theme } from '../components'; // Assuming theme is accessible

interface OnboardingNavigatorProps {
  onOnboardingComplete: () => void;
}

export const OnboardingNavigator: React.FC<OnboardingNavigatorProps> = ({ onOnboardingComplete }) => {
  // This ref can be used to programmatically control the swiper if needed
  const swiperRef = React.useRef<Swiper>(null);

  // Determine the number of slides
  const slideCount = 2; // OnboardingScreenOne and OnboardingScreenTwo

  return (
    <View style={styles.wrapper}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsButtons={false} // No next/prev buttons, navigation is via swipe
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        // Called when the user swiped to a new slide
        onIndexChanged={(index) => {
          if (index === slideCount - 1) { // When the last slide (OnboardingScreenTwo) is reached
            // Consider this the trigger point for completing onboarding.
            // The user has seen all screens.
            onOnboardingComplete();
          }
        }}
        // A workaround to call onOnboardingComplete when the user swipes *past* the last slide.
        // This relies on a common pattern where swipers might allow a slight overscroll or
        // fire an event when trying to swipe beyond bounds.
        // A more direct approach would be needed if the swiper doesn't support this.
        // Since react-native-swiper's onMomentumScrollEnd is part of ScrollView props,
        // we can use it to check if we are on the last slide and the user is attempting to swipe further.
        // This specific implementation detail might need adjustment based on swiper behavior.

        // For now, we'll assume reaching the last slide and then swiping again
        // (or a timeout on the last slide) could trigger completion.
        // Let's make OnboardingScreenTwo responsible for calling onOnboardingComplete
        // if we want a more explicit "I'm done with this screen" action from it,
        // even without a button. For now, we'll pass the callback.
      >
        <OnboardingScreenOne />
        <OnboardingScreenTwo />
        {/* Pass onOnboardingComplete to the last screen if it should trigger it */}
        {/* <OnboardingScreenTwo onDone={onOnboardingComplete} /> */}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  dot: {
    backgroundColor: '#DDDDDD', // Default grey for inactive dots
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3, // Adjust if dots are too close to bottom
  },
  activeDot: {
    backgroundColor: theme.colors.primary, // Use primary color for active dot
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
}); 
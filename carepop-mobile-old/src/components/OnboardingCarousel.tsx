import React, { useRef } from 'react';
import { View, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { OnboardingScreenOne } from '../../screens/Onboarding/OnboardingScreenOne';
import { OnboardingScreenTwo } from '../../screens/Onboarding/OnboardingScreenTwo';
import { OnboardingScreenThree } from '../../screens/Onboarding/OnboardingScreenThree';

interface OnboardingCarouselProps {
  onOnboardingComplete: () => void;
}

const ONBOARDING_SCREENS = [
  { id: 'one', component: OnboardingScreenOne },
  { id: 'two', component: OnboardingScreenTwo },
  { id: 'three', component: OnboardingScreenThree },
];

export function OnboardingCarousel({ onOnboardingComplete }: OnboardingCarouselProps) {
  const carouselRef = useRef<any>(null);
  const width = Dimensions.get('window').width;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={width}
        height={Dimensions.get('window').height}
        data={ONBOARDING_SCREENS}
        scrollAnimationDuration={500}
        renderItem={({ item, index }) => {
          const ScreenComponent = item.component;
          // Pass the onComplete prop only to the last screen
          const props = index === ONBOARDING_SCREENS.length - 1 
            ? { onComplete: onOnboardingComplete } 
            : {};
          return <ScreenComponent {...props} />;
        }}
        style={{ width: '100%' }}
      />
    </View>
  );
} 
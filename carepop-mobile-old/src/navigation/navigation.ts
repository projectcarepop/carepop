import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string) {
  if (navigationRef.isReady()) {
    // @ts-ignore - This is a simple helper, we ignore the complex types for now.
    navigationRef.navigate(name);
  }
} 
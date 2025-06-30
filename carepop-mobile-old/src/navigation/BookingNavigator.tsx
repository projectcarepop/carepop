import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Imports
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import ClinicSelectionScreen from '../screens/booking/ClinicSelectionScreen';
import DateTimeSelectionScreen from '../screens/booking/DateTimeSelectionScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';
// Future screens will be imported here
// import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';

export type BookingStackParamList = {
  ServiceSelection: undefined;
  ClinicSelection: { serviceId: string };
  DateTimeSelection: { serviceId: string; clinicId: string };
  BookingConfirmation: { serviceId: string; clinicId: string; dateTime: string };
  BookingSuccess: { appointmentDetails: any }; // Consider creating a specific type for this
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export function BookingNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="ServiceSelection"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
      <Stack.Screen name="ClinicSelection" component={ClinicSelectionScreen} />
      <Stack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      {/* <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} /> */}
    </Stack.Navigator>
  );
} 
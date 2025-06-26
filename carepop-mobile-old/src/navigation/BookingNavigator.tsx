import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen Imports
import ClinicSelectionScreen from '../screens/booking/ClinicSelectionScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';
import DateTimeSelectionScreen from '../screens/booking/DateTimeSelectionScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
// Future screens will be imported here
// import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';

export type BookingStackParamList = {
  ClinicSelection: undefined;
  ServiceSelection: { clinicId: string };
  DateTimeSelection: { clinicId: string; serviceId: string };
  BookingConfirmation: { clinicId: string; serviceId: string; appointmentTime: string };
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export function BookingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClinicSelection" component={ClinicSelectionScreen} />
      <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
      <Stack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      {/* <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} /> */}
    </Stack.Navigator>
  );
} 
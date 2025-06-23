'use client';

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { BookingState, BookingAction } from '@/lib/types/booking';

const initialState: BookingState = {
  currentStep: 1,
  clinics: [],
  selectedClinic: null,
  servicesForClinic: [],
  selectedService: null,
  availabilitySlots: [],
  selectedDate: null,
  selectedTimeSlot: null,
  bookingNotes: '',
  bookingConfirmation: null,
  isLoading: {
    clinics: false,
    servicesForClinic: false,
    availabilitySlots: false,
    bookingSubmission: false,
  },
  errors: {
    clinics: null,
    servicesForClinic: null,
    availabilitySlots: null,
    bookingSubmission: null,
  },
};

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_CLINICS_LOADING':
      return { ...state, isLoading: { ...state.isLoading, clinics: action.payload } };
    case 'SET_CLINICS_SUCCESS':
      return {
        ...state,
        clinics: action.payload,
        isLoading: { ...state.isLoading, clinics: false },
        errors: { ...state.errors, clinics: null }
      };
    case 'SET_CLINICS_ERROR':
      return { ...state, isLoading: { ...state.isLoading, clinics: false }, errors: { ...state.errors, clinics: action.payload } };
    case 'SELECT_CLINIC':
      return {
        ...state,
        selectedClinic: action.payload,
        selectedService: null,
        servicesForClinic: [],
        availabilitySlots: [],
        selectedDate: null,
        selectedTimeSlot: null,
      };

    case 'SET_SERVICES_FOR_CLINIC_LOADING':
      return { ...state, isLoading: { ...state.isLoading, servicesForClinic: action.payload } };
    case 'SET_SERVICES_FOR_CLINIC_SUCCESS':
      return {
        ...state,
        servicesForClinic: action.payload,
        isLoading: { ...state.isLoading, servicesForClinic: false },
        errors: { ...state.errors, servicesForClinic: null }
      };
    case 'SET_SERVICES_FOR_CLINIC_ERROR':
      return {
        ...state,
        isLoading: { ...state.isLoading, servicesForClinic: false },
        errors: { ...state.errors, servicesForClinic: action.payload }
      };
    case 'SELECT_SERVICE':
      return {
        ...state,
        selectedService: action.payload,
        availabilitySlots: [],
        selectedDate: null,
        selectedTimeSlot: null,
      };

    case 'SET_AVAILABILITY_LOADING':
      return { ...state, isLoading: { ...state.isLoading, availabilitySlots: action.payload } };
    case 'SET_AVAILABILITY_SUCCESS':
      return {
        ...state,
        availabilitySlots: action.payload,
        isLoading: { ...state.isLoading, availabilitySlots: false },
        errors: { ...state.errors, availabilitySlots: null }
      };
    case 'SET_AVAILABILITY_ERROR':
      return { ...state, isLoading: { ...state.isLoading, availabilitySlots: false }, errors: { ...state.errors, availabilitySlots: action.payload } };
    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.payload,
        selectedTimeSlot: null,
        errors: { ...state.errors, availabilitySlots: null }
      };
    case 'SELECT_TIME_SLOT':
      return { ...state, selectedTimeSlot: action.payload };

    case 'SET_BOOKING_NOTES':
        return { ...state, bookingNotes: action.payload };

    case 'SET_BOOKING_SUBMISSION_LOADING':
        return { ...state, isLoading: { ...state.isLoading, bookingSubmission: action.payload }};
    case 'SET_BOOKING_SUBMISSION_SUCCESS':
        return { 
            ...state, 
            bookingConfirmation: action.payload,
            currentStep: 4, // Move to success step
            isLoading: { ...state.isLoading, bookingSubmission: false }
        };
    case 'SET_BOOKING_SUBMISSION_ERROR':
        return { ...state, isLoading: { ...state.isLoading, bookingSubmission: false }, errors: { ...state.errors, bookingSubmission: action.payload }};
    
    case 'RESET_BOOKING_STATE':
        return initialState;

    default:
      return state;
  }
};

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}; 
'use client';

import React, { createContext, useContext, useReducer, Dispatch, ReactNode } from 'react';
import { 
  BookingState as ImportedBookingState,
  BookingAction as ImportedBookingAction,
  Clinic as ImportedClinic,
  ServiceCategory as ImportedServiceCategory,
  Provider as ImportedProvider,
  AvailabilitySlot as ImportedAvailabilitySlot,
  BookingConfirmationData as ImportedBookingConfirmationData
} from '@/lib/types/booking';

// Re-export to mark as used and for potential external use if needed
export type Clinic = ImportedClinic;
export type ServiceCategory = ImportedServiceCategory;
export type Provider = ImportedProvider;
export type AvailabilitySlot = ImportedAvailabilitySlot;
export type BookingConfirmationData = ImportedBookingConfirmationData;
export type BookingState = ImportedBookingState;
export type BookingAction = ImportedBookingAction;

const initialState: BookingState = {
  currentStep: 1,
  clinics: [],
  selectedClinic: null,
  servicesForClinic: [],
  selectedService: null,
  providersForService: [],
  selectedProvider: null,
  availabilitySlots: [],
  selectedDate: null,
  selectedTimeSlot: null,
  bookingNotes: '',
  bookingConfirmation: null,
  isLoading: {
    clinics: false,
    servicesForClinic: false,
    providersForService: false,
    availabilitySlots: false,
    bookingSubmission: false,
  },
  errors: {
    clinics: null,
    servicesForClinic: null,
    providersForService: null,
    availabilitySlots: null,
    bookingSubmission: null,
  },
};

const BookingContext = createContext<{
  state: BookingState;
  dispatch: Dispatch<BookingAction>;
} | undefined>(undefined);

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_CLINICS_LOADING':
      return { ...state, isLoading: { ...state.isLoading, clinics: action.payload }, errors: { ...state.errors, clinics: null } };
    case 'SET_CLINICS_SUCCESS':
      return { ...state, clinics: action.payload, isLoading: { ...state.isLoading, clinics: false } };
    case 'SET_CLINICS_ERROR':
      return { ...state, isLoading: { ...state.isLoading, clinics: false }, errors: { ...state.errors, clinics: action.payload } };
    case 'SELECT_CLINIC':
      return {
        ...state,
        selectedClinic: action.payload,
        selectedService: null,
        servicesForClinic: [],
        selectedProvider: null,
        providersForService: [],
        selectedTimeSlot: null,
        availabilitySlots: [],
        selectedDate: null,
      };
    case 'SET_SERVICES_FOR_CLINIC_LOADING':
      return { ...state, isLoading: { ...state.isLoading, servicesForClinic: action.payload }, errors: { ...state.errors, servicesForClinic: null } };
    case 'SET_SERVICES_FOR_CLINIC_SUCCESS':
      return { ...state, servicesForClinic: action.payload, isLoading: { ...state.isLoading, servicesForClinic: false } };
    case 'SET_SERVICES_FOR_CLINIC_ERROR':
      return { ...state, isLoading: { ...state.isLoading, servicesForClinic: false }, errors: { ...state.errors, servicesForClinic: action.payload } };
    case 'SELECT_SERVICE':
      return {
        ...state,
        selectedService: action.payload,
        selectedProvider: null,
        providersForService: [],
        selectedTimeSlot: null,
        availabilitySlots: [],
        selectedDate: null,
      };
    case 'SET_PROVIDERS_LOADING':
      return { ...state, isLoading: { ...state.isLoading, providersForService: action.payload }, errors: { ...state.errors, providersForService: null } };
    case 'SET_PROVIDERS_SUCCESS':
      return { ...state, providersForService: action.payload, isLoading: { ...state.isLoading, providersForService: false } };
    case 'SET_PROVIDERS_ERROR':
      return { ...state, isLoading: { ...state.isLoading, providersForService: false }, errors: { ...state.errors, providersForService: action.payload } };
    case 'SELECT_PROVIDER':
      return {
        ...state,
        selectedProvider: action.payload,
        selectedTimeSlot: null,
        availabilitySlots: [],
        selectedDate: null,
      };
    case 'SET_AVAILABILITY_LOADING':
      return { ...state, isLoading: { ...state.isLoading, availabilitySlots: action.payload }, errors: { ...state.errors, availabilitySlots: null } };
    case 'SET_AVAILABILITY_SUCCESS':
      return { ...state, availabilitySlots: action.payload, isLoading: { ...state.isLoading, availabilitySlots: false } };
    case 'SET_AVAILABILITY_ERROR':
      return { ...state, isLoading: { ...state.isLoading, availabilitySlots: false }, errors: { ...state.errors, availabilitySlots: action.payload } };
    case 'SELECT_DATE':
        return { ...state, selectedDate: action.payload, selectedTimeSlot: null };
    case 'SELECT_TIME_SLOT':
      return { ...state, selectedTimeSlot: action.payload };
    case 'SET_BOOKING_NOTES':
      return { ...state, bookingNotes: action.payload };
    case 'SET_BOOKING_SUBMISSION_LOADING':
      return { ...state, isLoading: { ...state.isLoading, bookingSubmission: action.payload }, errors: { ...state.errors, bookingSubmission: null } };
    case 'SET_BOOKING_SUBMISSION_SUCCESS':
      return { ...state, bookingConfirmation: action.payload, isLoading: { ...state.isLoading, bookingSubmission: false } };
    case 'SET_BOOKING_SUBMISSION_ERROR':
      return { ...state, isLoading: { ...state.isLoading, bookingSubmission: false }, errors: { ...state.errors, bookingSubmission: action.payload } };
    case 'RESET_BOOKING_STATE':
      return initialState;
    default:
      // Add a type check for exhaustive switch, though with string literals for types it's less critical
      const __: never = action; 
      return state;
  }
}

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
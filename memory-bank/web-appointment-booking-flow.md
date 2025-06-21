# Web Appointment Booking Flow (CarePoP-Web)

## 1. Overview

This document outlines the user flow and technical implementation for booking an appointment on the CarePoP web application (`carepop-web`). The goal is to allow users to select a clinic, service, optionally a provider, a date/time, and confirm their booking.

## 2. Entry Point

-   Users typically navigate to `/book-service`.
-   The page can also be accessed with pre-selected `clinicId` and `serviceId` via URL query parameters (e.g., `/book-service?clinicId=123&serviceId=456`).

## 3. Core Component & Flow Management

-   **`carepop-web/src/app/book-service/page.tsx`**: Entry Next.js page, renders the `BookingForm`.
-   **`carepop-web/src/app/book-service/components/BookingForm.tsx`**: This is the central client component (`'use client'`) that manages the entire multi-step booking flow.
    -   It maintains the state for all selections (clinic, service, provider, date, time, notes).
    -   It orchestrates the display of different step components.
    -   It handles navigation (Next/Previous) between steps.
    -   It manages API call loading states and displays success/error messages to the user.
    -   It calls the `createAppointmentAction` Server Action upon final confirmation.

## 4. Booking Steps & Components

The booking process is divided into several steps, each typically handled by a dedicated React component:

1.  **Select Clinic & Service (`ClinicServiceSelectionStep.tsx`)**
    -   User selects a clinic and a service.
    -   Component fetches and displays available clinics and services.
    -   On selection, updates `selectedClinicId`, `selectedServiceId`, and `selectedServiceDetails` in `BookingForm.tsx`.
    -   The "Next" button is typically internal to this step and calls `handleNext` in `BookingForm.tsx` with service details.

2.  **Select Provider (`ProviderSelectionStep.tsx`)** (Conditional)
    -   If the selected service (`selectedServiceDetails.requiresProviderAssignment`) requires a specific provider, this step is shown.
    -   User selects a provider.
    -   Component fetches and displays available providers for the selected service and clinic.
    -   Updates `selectedProviderId` in `BookingForm.tsx`.

3.  **Select Date & Time (`DateTimeSelectionStep.tsx`)**
    -   User selects an available date and time slot.
    -   Component likely needs to fetch provider/service availability (e.g., via a new Server Action calling `/api/v1/providers/:providerId/availability`).
    -   Updates `selectedDate` and `selectedTimeSlot` in `BookingForm.tsx`.

4.  **Confirmation (`ConfirmationStep.tsx`)**
    -   Displays a summary of all selected details: clinic, service, provider (if any), date, time, and notes.
    -   User reviews and confirms.
    -   The actual "Confirm Booking" button click is handled by `handleConfirmBooking` in `BookingForm.tsx`.

### Supporting Components:

-   **`BookingProgressIndicator.tsx`**: Displays the current step in the flow.

## 5. State Management

-   Primarily managed within `BookingForm.tsx` using React `useState` hooks for:
    -   `currentStep`
    -   `selectedClinicId`, `selectedServiceId`, `selectedProviderId`
    -   `selectedDate`, `selectedTimeSlot`
    -   `appointmentNotes`
    -   `selectedServiceDetails` (to hold information about the chosen service, like `requiresProviderAssignment`)
    -   `isLoading` (for API call status)
    -   `formMessage` (for success/error feedback)
-   Props are passed down to step components, and callback functions (e.g., `onNext`, `onBack`, `setSelected...`) are used to update the state in `BookingForm.tsx`.

## 6. API Interaction (Server Actions)

-   **File**: `carepop-web/src/lib/actions/appointments.ts`
-   **Authentication**: `getAuthToken()` helper within the actions file retrieves the Supabase JWT for the logged-in user.
-   **`createAppointmentAction(formData)`**:
    -   Called by `BookingForm.tsx` when the user confirms the booking.
    -   Receives booking details (clinicId, serviceId, providerId, date, time, notes).
    -   Constructs the payload and makes a `POST` request to the backend API (`${API_BASE_URL}/appointments`).
    -   Handles the response, returning `{ success: boolean, message?: string, data?: UserAppointmentDetails }`.
-   **Other Actions**:
    -   `getFutureAppointments()`, `getPastAppointments()`, `cancelAppointmentAction()` exist for managing existing appointments.
    -   A new Server Action (e.g., `getProviderAvailability`) is needed to fetch time slots for `DateTimeSelectionStep.tsx`.

## 7. Key Files & Directories

-   **Booking Page & Main Form**:
    -   `carepop-web/src/app/book-service/page.tsx`
    -   `carepop-web/src/app/book-service/components/BookingForm.tsx`
-   **Step Components**:
    -   `carepop-web/src/app/book-service/components/ClinicServiceSelectionStep.tsx`
    -   `carepop-web/src/app/book-service/components/ProviderSelectionStep.tsx`
    -   `carepop-web/src/app/book-service/components/DateTimeSelectionStep.tsx`
    -   `carepop-web/src/app/book-service/components/ConfirmationStep.tsx`
    -   `carepop-web/src/app/book-service/components/BookingProgressIndicator.tsx`
-   **Server Actions (API communication)**:
    -   `carepop-web/src/lib/actions/appointments.ts`
-   **Types**:
    -   `carepop-web/src/lib/types/appointmentTypes.ts` (for `UserAppointmentDetails` etc.)

## 8. Identified Missing Pieces & Potential Improvements

1.  **Provider Availability Logic**:
    -   `DateTimeSelectionStep.tsx` needs to fetch and display available time slots based on the selected provider (if any), service (for duration), clinic, and date.
    -   Requires a new Server Action to call the backend endpoint (e.g., `/api/v1/providers/:providerId/availability`).
2.  **Data for Confirmation Step**:
    -   `ConfirmationStep.tsx` currently uses mock data for display. It should receive actual names/details (e.g., clinic name, service name, provider name) from `BookingForm.tsx`. `BookingForm.tsx` needs to accumulate this data as selections are made in earlier steps.
3.  **Comprehensive Error Handling**:
    -   While basic error messages are implemented in `BookingForm.tsx`, further refinement might be needed for specific error scenarios from the API.
4.  **Loading States**:
    -   Individual steps that fetch data (e.g., services, providers, availability) should have their own loading indicators.
5.  **URL State Management**:
    -   Consider more robust URL state management (e.g., using a library like `nuqs`) if deep linking into specific steps or preserving selections across refreshes becomes a requirement beyond the initial `clinicId` and `serviceId`.
6.  **Type Safety for `stepSpecificProps`**:
    -   The `stepSpecificProps` in `BookingForm.tsx` is currently typed as `any`. A more type-safe solution (e.g., using a discriminated union for props of all step components) would improve maintainability.
7.  **Redirect After Booking**:
    -   Currently redirects to `/dashboard/appointments`. Consider redirecting to a page showing the details of the newly booked appointment.
8.  **Pre-filling User Details**:
    -   If any user details are needed for the booking (beyond what's derived from auth), ensure they are pre-filled or easily accessible. (Currently, `patient_id` is handled by the backend from the auth token). 
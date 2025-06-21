# Mobile Appointment Booking Flow (CarePoP-Mobile)

## 1. Overview

This document outlines the **proposed** user flow and technical implementation for booking an appointment on the CarePoP mobile application (`carepop-mobile`). The goal is to allow users to select a clinic, service, optionally a provider, a date/time, and confirm their booking.

**Current Status (as of analysis):** The `ServiceBookingScreen.tsx` is a placeholder, indicating this feature is not yet implemented. This document describes a potential approach.

## 2. Entry Point

-   Users would typically navigate to the `ServiceBookingScreen` from a list of services or a clinic's detail page.
-   Navigation parameters (e.g., `serviceId`, `clinicId`) would be passed to the screen.
    ```typescript
    // Example navigation call
    // navigation.navigate('ServiceBooking', { serviceId: 'some-service-id', clinicId: 'some-clinic-id' });
    ```

## 3. Core Screen & Flow Management

-   **`carepop-mobile/src/screens/ServiceBookingScreen.tsx`**: This screen would serve as the main container and manager for the multi-step booking flow.
    -   It would likely use React state to manage the current step in the booking process (e.g., clinic/service selection, provider selection, date/time selection, confirmation).
    -   It would fetch necessary data (clinics, services, providers, availability) via API calls to the `carepop-backend`.
    -   It would manage the state of user selections (selected clinic, service, provider, date, time, notes).
    -   It would handle navigation between sub-views/components representing each step.
    -   Upon final confirmation, it would call an API service function to create the appointment.

## 4. Proposed Booking Steps & Components

The booking process could be broken down into several logical steps, potentially rendered as separate views within `ServiceBookingScreen.tsx` or as distinct components:

1.  **Select Clinic & Service** (if not pre-selected via navigation params)
    -   User selects a clinic (if applicable) and a service.
    -   Requires fetching and displaying lists of available clinics/services.
    -   **Relevant API calls**: `GET /api/v1/clinics`, `GET /api/v1/services` (or `GET /api/v1/clinics/:id/services`).

2.  **Select Provider** (Conditional)
    -   If the selected service requires a specific provider.
    -   User selects from a list of available providers for the chosen service/clinic.
    -   **Relevant API call**: `GET /api/v1/providers?clinicId=X&serviceId=Y` (or similar, depending on backend filtering capabilities).

3.  **Select Date & Time**
    -   User selects an available date and time slot.
    -   Requires fetching provider/service availability.
    -   **Relevant API call**: `GET /api/v1/providers/:providerId/availability?serviceId=X&clinicId=Y&date=YYYY-MM-DD` (or a general service availability endpoint if provider is not specific).

4.  **Enter Notes & Review**
    -   User can add optional notes for the appointment.
    -   A summary of all selections (clinic, service, provider, date, time, notes) is displayed for review.

5.  **Confirmation**
    -   User confirms the booking.
    -   **Relevant API call**: `POST /api/v1/appointments` with all collected data.
    -   On success, display a confirmation message and navigate to an appointments list or the home screen.
    -   On failure, display an error message.

## 5. State Management (Proposed)

-   React `useState` hooks within `ServiceBookingScreen.tsx` would manage:
    -   `currentStep` (string or number indicating the active step).
    -   `selectedClinic`, `selectedService`, `selectedProvider` (objects or IDs).
    -   `selectedDate`, `selectedTimeSlot`.
    -   `appointmentNotes`.
    -   Loading states (e.g., `isLoadingServices`, `isBooking`).
    -   Error states (e.g., `bookingError`).
-   For more complex global state or shared data (like user profile, auth status), React Context API or a dedicated state management library (e.g., Zustand, Redux Toolkit) could be used if not already in place.

## 6. API Interaction (Proposed)

-   API calls would be made to the `carepop-backend` (at `process.env.API_BASE_URL`).
-   Helper functions or a dedicated service module (e.g., `carepop-mobile/src/services/api.ts` or `appointmentService.ts`) would encapsulate `fetch` calls.
-   **Authentication**: An authentication token (Supabase JWT) would need to be retrieved (e.g., from secure storage or an auth context) and included in the `Authorization` header for protected endpoints.

    **Key API Endpoints to be consumed:**
    -   `GET /api/v1/clinics`
    -   `GET /api/v1/services`
    -   `GET /api/v1/providers` (with appropriate filters)
    -   `GET /api/v1/providers/:providerId/availability`
    -   `POST /api/v1/appointments`

## 7. Key Files & Directories (Proposed Structure)

-   **Main Booking Screen**:
    -   `carepop-mobile/src/screens/ServiceBookingScreen.tsx`
-   **Reusable UI Components for Booking Steps** (could reside in `carepop-mobile/src/components/booking/`):
    -   `ClinicSelection.tsx`
    -   `ServiceSelection.tsx`
    -   `ProviderSelection.tsx`
    -   `DateTimePicker.tsx` (or use a library component)
    -   `BookingSummaryView.tsx`
-   **API Service Layer** (e.g., create `carepop-mobile/src/services/`):
    -   `appointmentService.ts` (containing functions to call booking-related APIs).
    -   `clinicService.ts`, `providerService.ts` etc.
-   **Navigation**:
    -   `carepop-mobile/src/navigation/` would need to include `ServiceBookingScreen` in a stack navigator.
-   **Types**:
    -   Shared types (e.g., `Appointment`, `Service`, `Provider`) might be defined in `carepop-mobile/src/types/`.

## 8. Next Steps for Implementation

1.  **Design UI/UX**: Define the visual appearance and interaction flow for each step.
2.  **Component Development**: Create the individual React Native components for each part of the flow.
3.  **State Management**: Implement state handling within `ServiceBookingScreen.tsx`.
4.  **API Integration**: Develop service functions to communicate with the backend API endpoints.
5.  **Authentication Handling**: Ensure auth tokens are correctly passed with API requests.
6.  **Navigation**: Integrate the screen into the app's navigation structure.
7.  **Error Handling & Feedback**: Implement user-friendly error messages and loading indicators.
8.  **Testing**: Thoroughly test the booking flow on different devices and scenarios.

This proposed structure provides a starting point. The actual implementation may vary based on more detailed requirements and chosen libraries/patterns. 
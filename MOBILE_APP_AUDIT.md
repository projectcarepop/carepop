# Carepop Mobile Application: Full Audit & Strategic Recommendations

**Date:** July 26, 2024
**Auditor:** Czar

## Executive Summary

This audit provides a comprehensive analysis of the `carepop-mobile-old` React Native application. The application's goal is to provide an accessible and inclusive healthcare experience.

While the application possesses a strong foundation in its UI component library, theming, and the foundational logic of its authentication context (`AuthContext`), it is critically undermined by significant architectural flaws. The most severe issue is the **presence of two conflicting Supabase client initializations**, which is the root cause of the persistent authentication and session management problems.

Furthermore, the project structure is highly fragmented, with duplicate and obsolete screen components scattered across different directories. The navigation system is monolithic and overly complex, making it difficult to maintain and extend.

This report details these findings and provides a strategic, phased plan to refactor the application onto a stable, scalable, and maintainable foundation. The immediate priority must be to resolve the core authentication conflict.

---

## 1. Key Findings & Actionable Recommendations

This section summarizes the most critical issues and the recommended actions to address them.

---

**Priority:** CRITICAL
**Issue:** Dual Supabase Clients
**Description:** The app initializes two Supabase clients: one in `src/lib/supabase.ts` using `AsyncStorage` and another in `src/utils/supabase.ts` using `expo-secure-store`. This conflict leads to unpredictable session management, token loss, and is the **root cause of the `Invalid Refresh Token` error**.
**Recommended Action:** **Consolidate to a single Supabase client.** The `expo-secure-store` implementation (`src/utils/supabase.ts`) is the correct, more secure approach. All imports must be pointed to this single client, and `src/lib/supabase.ts` must be deleted.

---

**Priority:** HIGH
**Issue:** Fragmented & Duplicate Screens
**Description:** Screen components are scattered between the root `/screens` and `/src/screens` directories. Multiple versions of the same screen exist (e.g., `BookingScreen`, `LoginScreen`), leading to confusion and bugs.
**Recommended Action:** **Consolidate all screens into `src/screens`**. Create a clear, feature-based directory structure (e.g., `src/screens/auth`, `src/screens/booking`). Systematically review and delete all obsolete and duplicate files from the root `/screens` directory.

---

**Priority:** HIGH
**Issue:** Monolithic Navigation
**Description:** `src/navigation/AppNavigator.tsx` is a single, massive file that manages all navigation stacks (Root, Auth, Onboarding, Drawer, Appointments, etc.). This makes the navigation logic brittle, hard to reason about, and difficult to modify.
**Recommended Action:** **Refactor into a modular, navigator-based architecture.** Create separate navigator files for each feature stack (e.g., `AuthNavigator.tsx`, `OnboardingNavigator.tsx`, `DrawerNavigator.tsx`). The main `RootAppNavigator` should only be responsible for conditionally rendering these feature navigators based on the application's state (`authStatus`).

---

**Priority:** MEDIUM
**Issue:** Inconsistent API Layer
**Description:** The app mixes two patterns for data fetching: direct Supabase calls and calls to a custom backend via an `apiFetch` wrapper in `src/services/api.ts`. The `getUserProfile` function in `src/utils/supabase.ts` is redundant and confusingly placed.
**Recommended Action:** **Centralize all data fetching logic within `src/services/api.ts`**. All Supabase calls and backend fetches should be exposed as clearly named functions from this service layer. The redundant `getUserProfile` function in the Supabase utility file should be removed.

---

## 2. Detailed Analysis

### 2.1. Architecture & Project Structure

- **Strengths:** The project attempts to separate concerns with directories for `components`, `context`, `hooks`, `lib`, `navigation`, and `services`.
- **Weaknesses:**
    - The separation is not enforced, leading to the critical file fragmentation issue mentioned above.
    - There is no clear, enforced standard for where files should be located, causing confusion and a high risk of importing incorrect components or utilities.
    - The presence of two `supabase.ts` files is a major architectural red flag.

### 2.2. Backend & Data Layer

- **The Dual Client Conflict:**
    - `src/lib/supabase.ts`: Initializes a client using `@react-native-async-storage/async-storage`. This is generally acceptable but less secure for sensitive tokens.
    - `src/utils/supabase.ts`: Initializes a client using `expo-secure-store`. This is the **best practice** for storing sensitive data like auth tokens on a mobile device.
    - **Impact:** When different parts of the app import from these different files, they are interacting with two separate instances of the Supabase client, each with its own session state. This leads to race conditions where one client's session invalidates the other's, causing the "token not found" errors.

- **Data Fetching:**
    - The application correctly uses `@tanstack/react-query` for server state management, which is excellent for caching, refetching, and handling loading/error states.
    - However, the functions used within `useQuery` are sourced inconsistently from `api.ts` and other utility files.

### 2.3. Authentication & State Management

- **`AuthContext`:** The logic within `src/context/AuthContext.tsx` is well-designed. It correctly listens for `onAuthStateChange`, checks for a user's profile to determine their status (`unauthenticated`, `no-profile`, `authenticated`), and provides this status to the entire application.
- **The Flaw:** The effectiveness of `AuthContext` is completely undermined by the dual Supabase client issue. The context itself is likely using one client instance while other parts of the app (e.g., a login or signup screen) might be using the other, leading to the state becoming out of sync.

### 2.4. Navigation

- **The Monolith:** `AppNavigator.tsx` is over 280 lines long and defines 7 different navigator stacks and their associated screens.
- **State Machine Logic:** The `RootAppNavigator` component contains a "state machine" that correctly uses the `authStatus` from `AuthContext` to decide which main navigator to show (Splash, Onboarding, Auth, Create Profile, or the main App Drawer). This logic is sound but belongs in a more streamlined root navigator, not buried in a file with five other navigator definitions.
- **Complexity:** This centralized approach makes it extremely difficult to add or change screens within a specific flow without potentially impacting others. For example, changing a screen in the `BookingNavigator` still requires editing this massive, shared file.

### 2.5. UI & Theming

- **Strengths:** The application has a very well-defined and consistent design system defined in `src/components/theme.ts`.
    - **Tokens:** It specifies a clear color palette, spacing scale, and radius values.
    - **Typography:** It defines a full typography scale with different font weights and sizes.
    - **Components:** It features a library of custom, themed components (Button, Card, Input, etc.) that consume these theme tokens.
- **Opportunity:** This strong theming is a major asset and should be leveraged during the refactoring process to ensure a consistent look and feel.

---

## 3. Screen-by-Screen Breakdown

This section documents the purpose of every identified screen in the application.

### Onboarding
**File Path:** `/screens/Onboarding/OnboardingScreenOne.tsx`
**Screen Name:** Onboarding Screen One
**Purpose & Functionality:** Introduces the app's value proposition. Navigates to the next onboarding screen.
***
**File Path:** `/screens/Onboarding/OnboardingScreenTwo.tsx`
**Screen Name:** Onboarding Screen Two
**Purpose & Functionality:** Highlights the provider search feature. Navigates to the final onboarding screen.
***
**File Path:** `/screens/Onboarding/OnboardingScreenThree.tsx`
**Screen Name:** Onboarding Screen Three
**Purpose & Functionality:** Emphasizes security and privacy. Sets `hasOnboarded` flag in `AsyncStorage` and navigates to the Auth flow.
***
### Authentication
**File Path:** `/screens/LoginScreen.tsx`
**Screen Name:** Login Screen
**Purpose & Functionality:** Handles user login with email/password and Google OAuth. Uses `react-hook-form` and `zod` for validation. Displays auth errors.
***
**File Path:** `/screens/RegisterScreen.tsx`
**Screen Name:** Register Screen
**Purpose & Functionality:** Handles new user registration. Includes password strength indicator and links to legal documents. Uses `react-hook-form` and `zod`.
***
**File Path:** `/screens/ForgotPasswordScreen.tsx`
**Screen Name:** Forgot Password Screen
**Purpose & Functionality:** Allows users to request a password reset link via email.
***
**File Path:** `/screens/EmailConfirmationScreen.tsx`
**Screen Name:** Email Confirmation
**Purpose & Functionality:** A placeholder screen likely intended to be shown after registration, instructing the user to check their email.
***
### Profile
**File Path:** `/screens/CreateProfileScreen.tsx`
**Screen Name:** Create Profile Screen
**Purpose & Functionality:** A basic form for new users to enter their profile information after signing up. Appears to be an older, less complete version.
***
**File Path:** `/src/screens/EditProfileScreen.tsx`
**Screen Name:** Edit Profile Screen
**Purpose & Functionality:** A more comprehensive form allowing existing users to update their detailed profile information.
***
**File Path:** `/src/screens/MyProfileScreen.tsx`
**Screen Name:** My Profile Screen
**Purpose & Functionality:** Displays the current user's profile information. Provides navigation to the Edit Profile screen.
***
### Core App
**File Path:** `/src/screens/DashboardScreen.tsx`
**Screen Name:** Dashboard Screen
**Purpose & Functionality:** The main landing page after login. Displays a welcome message, upcoming appointments, quick actions, and health buddy info.
***
**File Path:** `/src/screens/MyAppointmentsScreen.tsx`
**Screen Name:** My Appointments Screen
**Purpose & Functionality:** Displays a tabbed view of "Upcoming" and "Past" appointments. Allows users to view details or book a new service.
***
**File Path:** `/src/screens/AppointmentDetailScreen.tsx`
**Screen Name:** Appointment Detail Screen
**Purpose & Functionality:** Shows detailed information about a specific appointment, including clinic, doctor, service, time, and status.
***
**File Path:** `/src/screens/MyRecordsScreen.tsx`
**Screen Name:** My Records Screen
**Purpose & Functionality:** Displays a list of the user's medical records. Includes a placeholder "View" function.
***
**File Path:** `/screens/ClinicFinderScreen.tsx`
**Screen Name:** Clinic Finder Screen
**Purpose & Functionality:** (Functionality not fully implemented in file) Intended to be the primary interface for searching for clinics.
***
### Booking Flow
**File Path:** `/src/navigation/BookingNavigator.tsx`
**Screen Name:** (Navigator)
**Purpose & Functionality:** Defines the multi-step booking flow (Service -> Clinic -> DateTime -> Confirmation).
***
**File Path:** `/src/screens/booking/ServiceSelectionScreen.tsx`
**Screen Name:** Service Selection
**Purpose & Functionality:** Step 1: User selects a healthcare service from a categorized list.
***
**File Path:** `/src/screens/booking/ClinicSelectionScreen.tsx`
**Screen Name:** Clinic Selection
**Purpose & Functionality:** Step 2: User selects a clinic that offers the chosen service.
***
**File Path:** `/src/screens/booking/DateTimeSelectionScreen.tsx`
**Screen Name:** Date & Time Selection
**Purpose & Functionality:** Step 3: User chooses an available date and time slot for their appointment.
***
**File Path:** `/src/screens/booking/BookingConfirmationScreen.tsx`
**Screen Name:** Booking Confirmation
**Purpose & Functionality:** Step 4: User reviews all appointment details before confirming the booking.
***
**File Path:** `/src/screens/BookingSuccessScreen.tsx`
**Screen Name:** Booking Success
**Purpose & Functionality:** A final screen shown after a booking is successfully created.
***
### Health Buddy
**File Path:** `/src/screens/HealthBuddyScreen.tsx`
**Screen Name:** Health Buddy Main
**Purpose & Functionality:** Main dashboard for the "Health Buddy" feature, providing access to various health tracking tools.
***
**File Path:** `/src/screens/LogHealthDataScreen.tsx`
**Screen Name:** Log Health Data
**Purpose & Functionality:** A generic screen for logging health symptoms, mood, and notes.
***
**File Path:** `/src/screens/AddMedicationScreen.tsx`
**Screen Name:** Add Medication
**Purpose & Functionality:** Form to add a new medication to the user's list for tracking.
***
**File Path:** `/src/screens/PillTrackerScreen.tsx`
**Screen Name:** Pill Tracker
**Purpose & Functionality:** Interface for managing and tracking medication intake.
***
**File Path:** `/src/screens/MensTrackerScreen.tsx`
**Screen Name:** Menstrual Tracker
**Purpose & Functionality:** Dashboard for the menstrual cycle tracking feature.
***
**File Path:** `/src/screens/LogPeriodScreen.tsx`
**Screen Name:** Log Period
**Purpose & Functionality:** Allows the user to log the start and end dates of their menstrual cycle.
***
**File Path:** `/src/screens/LogBloodPressureScreen.tsx`
**Screen Name:** Log Blood Pressure
**Purpose & Functionality:** Form for users to log their blood pressure readings.
***
### Static & Other
**File Path:** `/src/screens/AboutUsScreen.tsx`
**Screen Name:** About Us Screen
**Purpose & Functionality:** Displays static information about the Carepop mission and team.
***
**File Path:** `/screens/Onboarding/SplashScreen.tsx`
**Screen Name:** Splash Screen
**Purpose & Functionality:** A simple loading screen shown while the app determines the initial navigation state. 
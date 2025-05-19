# Project Progress Summary (CarePoP)

**Last Updated:** {{YYYY-MM-DDTHH:MM:SSZ}} (AUTO_FILLED_ON_COMMIT)

## Overall Project Status:
*   **MVP Focus:** Native Mobile App (Expo) and Backend (Node.js/Cloud Run + Supabase). **Development focus is now shifting to the Web Application (`carepop-web/`) for foundational setup.**
*   **Current Phase:** Native app core features (Auth, Onboarding, User Profile) are complete. **`carepop-web/` foundational setup is in progress, including core styling, Header, Homepage. Login (`AUTH-FE-1`) and Registration (`AUTH-FE-2`) UIs are implemented and ready for testing.**
*   **Significant Progress:**
    *   Native mobile app: User registration and login with email/password is complete and stable.
    *   Native mobile app: Onboarding flow is complete and functional.
    *   Native mobile app: Core User Profile management (including SOGIE data and navigation) is complete and functional.
    *   Native mobile navigation structure refactored and stabilized, with the persistent `NAV-MOBILE-1` error now resolved.
    *   **Supabase trigger (`handle_new_user`) deployed to automatically create profile stubs on new user signup.**
    *   Initial UI for Onboarding, Auth (Login, Register, Forgot Password), Profile (Create, View, Edit) screens in native app are largely complete.
    *   Picker UIs in `EditProfileScreen.tsx` and `CreateProfileScreen.tsx` have been refactored for consistency and adherence to user-specified inline display pattern.
    *   Backend services for user profile creation and updates are in place, including application-level encryption for sensitive fields.
    *   Foundational backend setup (logging, config, CI/CD for backend) is mostly complete.
    *   **`carepop-web/`: Foundational styling system (Tailwind CSS v3, custom fonts via CSS workaround, theme colors) established and working.** `Header.tsx` component significantly developed. Homepage (`page.tsx`) hero section refined (height, border), and a four-card feature display added within the hero with styling (white background, image placeholders, shadows, hover effects).
    *   **`carepop-web/`: Login page (`login/page.tsx`) implemented for email/password. Registration page (`register/page.tsx`) UI implemented. `AuthContext.tsx` modified to support `signInWithPassword` for the `signInWithEmail` method. Both auth pages are ready for testing.**
*   **Key Blockers:**
    *   None currently critical for web frontend development. Previous SOGIE data issues on native are resolved.
*   **Next Major Milestones:**
    *   **User testing of `carepop-web/` Login (`AUTH-FE-1`) and Registration (`AUTH-FE-2`) pages.**
    *   Address any bugs from auth page testing.
    *   **Proceed with development of next prioritized `carepop-web/` pages/features.**
    *   Continue with `COMPLIANCE-1` (Data Encryption at Rest) for `facilities` and `providers` tables in the backend (can be parallel).

## Epic-Level Status Summary (from `tracker.md`):

*   **COMPLIANCE: Data Privacy & Security Assurance**
    *   Status: In Progress (COMPLIANCE-1 - Encryption for `profiles` done, other tables and full testing pending).
    *   Notes: Core RLS policies (COMPLIANCE-2) are implemented.
*   **FE-SETUP: Frontend Applications Initialization & Core Structure**
    *   Status: Partially Done.
    *   Notes: Native app init and navigation are done. Theme and core UI components integrated. **Web app setup (`FE-SETUP-4`, `FE-SETUP-6`) is now the primary focus.**
*   **Epic 1: Core Setup, Authentication & Deployment Foundation**
    *   Status: Mostly Done.
    *   Notes: CI/CD for native app (EAS) needs setup/testing.
*   **AUTH: User Authentication**
    *   Status: Native Email/Password Done. Web UI & Logic To Do. Google Sign-In/Up Deferred. Password Reset (Full Flow) Deferred.
    *   Notes: Core native authentication (signup, login, logout, session management) for email/password users is complete. Password reset native UI is done, but full flow is blocked by web dependency. Google Sign-In/Up for native and web is deferred.
*   **USER-PROF: User Profile Management (Native MVP)**
    *   Status: Done
    *   Notes: Native app user profile creation (`CreateProfileScreen.tsx`), viewing (`MyProfileScreen.tsx`), and editing (`EditProfileScreen.tsx`) are complete. This includes handling of SOGIE data (gender_identity, pronouns, assigned_sex_at_birth) from UI to backend (encryption in `profileService.ts`) and database persistence (Supabase migration `20250514161325_add_sogie_fields_to_profiles.sql`). The related navigation error `NAV-MOBILE-1` has been resolved.
*   **Epic 2: UI/UX Design System & Core Components (Native Mobile App)**
    *   Status: Done.
    *   Notes: Core components created and integrated. Form input (picker) UIs refined for consistency.
*   **ONBOARDING: Native App Onboarding Flow**
    *   Status: Done
    *   Notes: All onboarding screens and flow logic are complete and functional.
*   **WEB: Dedicated Web Application (Next.js, Tailwind CSS, Shadcn UI)**
    *   Status: **In Progress (Foundational UI)**
    *   Notes: Project initialized (`WEB-SETUP-1`), Supabase client & Auth Context implemented (`WEB-SETUP-2`). Foundational styling (`FE-SETUP-6`) is now largely functional. Basic layout and navigation (`WEB-SETUP-3`, `FE-SETUP-4`) evolving with `Header.tsx` development. Homepage (`page.tsx`) hero section and feature cards developed (`FE-HOME-1`, `FE-HOME-2`).

## Detailed View / Next Steps:
*   **Current Focus: Preparing for user testing of `carepop-web/` Login (`AUTH-FE-1`) and Registration (`AUTH-FE-2`) pages.**
    *   `FE-HOME-1` (Homepage Hero): **Done** (Core structure and nested cards are in place. Further refinements can be separate tickets).
    *   `FE-HOME-2` (Homepage Feature Cards): **Done** (Implemented within Hero).
    *   `FE-SETUP-6` (Web Styling & Base Components): **Ongoing.** Core styling established. Homepage, Auth pages styled.
    *   `WEB-SETUP-3` & `FE-SETUP-4` (Web Layout & Navigation): **Ongoing.** `Header.tsx` provides initial navigation.
    *   **`AUTH-FE-1` (Web Login Page): Implemented. Ready for testing.**
    *   **`AUTH-FE-2` (Web Registration Page): Implemented. Ready for testing.**
    *   **Next: User testing of Login and Registration pages.**
*   Address any issues found during user testing.

## Current High-Level Blockers & Issues

*   Full theme consistency across all web components needs verification.
*   Supabase email setup is needed for full magic link login test (once UI is usable).

## Next Major Focus Areas (Beyond Current USER-PROF work)

*   **`carepop-web/` foundational UI development (refine Header, implement Footer, main layout structure, style core pages).**
*   Implementing core web application features (Auth UIs, Public Pages).

## What Works

*   Native app: User registration and login with email/password (Supabase direct auth).
*   Native app: Onboarding flow (Splash screen, multi-step carousel).
*   Native app: Secure session/token handling using `expo-secure-store`.
*   **Supabase DB trigger (`handle_new_user`) automatically creates a profile stub (`user_id`, `email`) in `public.profiles` on new user signup.**
*   Native app: UI for Profile creation (`CreateProfileScreen.tsx`) and editing (`EditProfileScreen.tsx`) includes SOGIE fields.
*   Native app: Basic navigation structure and core UI components with theming.
*   Backend: Zod validation in `profileController.ts` now includes SOGIE fields.
*   Backend: `profileService.ts` includes logic for Application-Level Encryption for SOGIE fields.
*   Backend: `authMiddleware` for protecting API routes.
*   Supabase: DB trigger for initial profile row creation on new user signup.
*   Supabase: RLS policies for directory tables.
*   **`carepop-web/`: Initial project setup, Tailwind CSS (v3.4.3), Shadcn UI, theme (colors, fonts applied via `globals.css` and `tailwind.config.ts`), core components added. Supabase client and AuthContext implemented. Basic pages created. `Header.tsx` extensively styled and functional. Homepage (`page.tsx`) hero section developed with iterative height adjustments, border, and removal of image placeholder. Four feature cards added within hero section, styled with white backgrounds, image placeholders, shadows, and hover effects.**
*   **`carepop-web/`: Login page UI (`login/page.tsx`) and Registration page UI (`register/page.tsx`) implemented. `AuthContext.tsx` updated to support `signInWithPassword`.**

## What's Next (Immediate & High Priority from `activeContext.md` & `tracker.md`)

1.  **User Testing of `carepop-web/` Login Page (`AUTH-FE-1`) and Registration Page (`AUTH-FE-2`) functionality.**
2.  Address any bugs found.
3.  **User to define next priority for `carepop-web/` page/feature development.**
4.  CI/CD for Native App (FOUND-5): Set up and test EAS build/submit pipeline (can be done in parallel).

## Known High-Level Issues/Blockers

*   Full theme consistency across all web components needs verification.
*   Supabase email setup needed for full magic link login test (once UI is usable).
*   **`carepop-web/`: Login and Registration pages UI implemented and `AuthContext` updated. Full functionality requires user testing.**

## Recently Completed Milestones

*   Identified that SOGIE fields were correctly sent by client but stripped by backend Zod validation.
*   Fixed Zod validation in `profileController.ts` to include SOGIE fields.
*   Identified subsequent PGRST204 error indicating missing SOGIE columns in the database schema.
*   **Created and deployed Supabase migration `20240815120000_create_handle_new_user_trigger.sql` for automatic profile stub creation.**
*   User confirmed SOGIE columns migration (`20250514161325_add_sogie_fields_to_profiles.sql`) was applied.
*   Added core Shadcn UI components (`button`, `input`, `label`, `card`, `dialog`, `select`, `checkbox`, `form`, `textarea`, `dropdown-menu`) to `carepop-web/src/components/ui/`. This significantly progresses `FE-SETUP-6`.
*   **Implemented Supabase client and AuthContext in `carepop-web/` (`WEB-SETUP-2`).**
*   **Recreated basic pages (`login`, `register`, `dashboard`, `about`, `contact`) in `carepop-web/`.**
*   **Replaced default Next.js `page.tsx` content with a custom welcome page in `carepop-web/`.**
*   **Resolved major `carepop-web/` styling issues by downgrading Tailwind CSS to v3.4.3 and implementing font workarounds. `Header.tsx` significantly developed.**
*   **Developed `carepop-web/` homepage (`page.tsx`) hero section: iterative height adjustments, border styling, removal of initial image placeholder. Added and styled four feature cards within the hero section (white background, image placeholders, shadows, hover effects).**

## Progress Summary ({{YYYY-MM-DD HH:MM Z}} AUTO_UPDATE)

**Overall Status:** Development has successfully completed the core native mobile app Authentication (Email/Password) and Onboarding flows. **Focus has shifted to `carepop-web/` with foundational UI (Header, Homepage) and Auth UIs (Login, Registration) implemented and ready for testing.**

**Recent Accomplishments:**
*   Native app Email/Password Authentication (Login, Registration, Logout, Session Management) is complete and functional.
*   Native app Onboarding flow (Splash, Carousel screens, completion logic) is complete and functional.
*   Identified and addressed a likely recursive call in `carepop-mobile/App.tsx`.
*   Corrected associated linter errors in `theme.ts` and `OnboardingScreenThree.tsx`.
*   **`carepop-web/`: Homepage hero and feature cards styled and implemented.**
*   **`carepop-web/`: Login page UI (`login/page.tsx`) and Registration page UI (`register/page.tsx`) created. `AuthContext.tsx` updated to support `signInWithPassword`.**

**Current Blockers:**
*   The SOGIE fields database schema issue (PGRST204 error previously) for `public.profiles` (USER-PROF epic) needs to be fully verified as resolved and the data flow tested.
*   Native Navigation Error (`NAV-MOBILE-1`): The `EditProfile` navigation error remains a high-priority issue to resolve for full profile management testing.

**Next Key Milestones (Pending Next Epic Decision):**
1.  **Complete user testing of `carepop-web/` Login (`AUTH-FE-1`) and Registration (`AUTH-FE-2`) pages.**
2.  Address any bugs found.
3.  **Begin development of next prioritized `carepop-web/` features.**

**Key Areas of Focus:**
*   **`carepop-web/` User Testing: Login (`AUTH-FE-1`) & Signup (`AUTH-FE-2`) pages.**

**Confidence Score (1-5):** 4 (High - Native app MVP features are stable. Web foundational work including Auth UIs is now substantially complete for initial testing.)

## Project Progress (CarePoP Platform)

**Overall Status:** Phase 1 (MVP) development for `carepop-web` is actively underway. Core styling, header navigation, foundational authentication pages, and the user profile creation page are in place. The dashboard now displays detailed user profile information.

**Current Focus Pillar:** `carepop-web`

**Key Achievements Recently:**
*   **`carepop-web` - Dashboard Enhancement:** The user dashboard (`/dashboard`) now fetches and displays detailed profile information (First Name, Last Name, DOB, Pronouns, SOGIE). It also prompts users to complete their profile if key details are missing and provides an "Edit Profile" link.
*   **`carepop-web` - Profile Creation:** Implemented the `/create-profile` page, allowing new users to input and save their basic profile information to Supabase.
*   **`carepop-web` - Authentication Core:** Login, Registration, and Forgot Password (request part) pages are functional on the frontend. Google OAuth buttons added. `AuthContext.tsx` updated.
*   **`carepop-web` - UI/Styling Foundation:** Tailwind CSS v3.4.3 and custom fonts are stable. Main `Header.tsx` is complete. Homepage has initial content.

**What's Working:**
*   `carepop-web` basic application shell, routing.
*   Styling, custom fonts, Header, basic Homepage.
*   User registration, login (email/password & Google initiation - frontend; **login now includes password visibility toggle**), forgot password request (frontend).
*   User profile creation form and data saving.
*   **Dashboard display of detailed user profile information, including prompt for incomplete profiles and edit link.**

**What's Next (Immediate Focus for `carepop-web`):**
1.  **Testing of Login Page Enhancements & Dashboard Profile Display.**
2.  **Complete Password Reset Flow:** Implement the `/update-password` page.
3.  **Further Dashboard Implementation:** Add other planned dashboard features.
4.  **Full Auth Flow Testing (End-to-End):** Requires user to configure Supabase.

**Key Blockers/Issues:**
*   **User Action Required:** Supabase backend configuration for full auth/profile testing.

**Memory Bank File Status:**
*   `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md` are stable.
*   `epics_and_tickets.md`: Updated for `FE-PROFILE-CREATE-W` and `FE-DASH-PROFILE-DISPLAY-W`.
*   `tracker.md`: Reflects current task statuses.
*   `memorylog.md`: Captures key decisions.
*   `activeContext.md`: Updated with current focus on testing dashboard and next steps.
*   `progress.md`: This document, updated.

## Overall Project Progress (Czar)

**Date:** YYYY-MM-DD (AUTO_UPDATE_DATE)

**Current Phase:** MVP Development - Focus on Core Web App Features & API Integrations

**High-Level Summary:**
Development is primarily focused on the `carepop-web` application. Core authentication pages (Login, Register, Forgot Password) are largely complete. The `AuthContext` has been significantly updated: the `Profile` interface now aligns with `carepop-mobile` fields (using `camelCase` and specific SOGIE fields), and redirection logic is in place. 

The `create-profile` page has undergone substantial enhancements:
*   It now correctly maps data to `snake_case` for Supabase.
*   The redundant `sogie` textarea has been removed.
*   Fields like `civilStatus`, `pronouns`, and `assignedSexAtBirth` use `Select` components.
*   Most significantly, the address fields (Province, City/Municipality, Barangay) have been converted from static inputs to dynamic, `Select` components. These now fetch data from local JSON files (`provinces.json`, `cities-municipalities.json`, `barangays.json`) in `carepop-web/public/data/psgc/`, with chained loading based on user selections. The user has confirmed these files are in place.

The `dashboard` page correctly displays profile data using `camelCase` fields from the updated `AuthContext.Profile`.

Both profile-related pages (`create-profile`, `dashboard`) are now ready for thorough testing, especially the new dynamic address functionality and overall data flow.

**Key Accomplishments Recently:**
*   **`carepop-web/src/app/create-profile/page.tsx` Major Update:** 
    *   Implemented dynamic, API-driven `Select` components for Province, City/Municipality, and Barangay using an external PSGC API (`jeffreybernadas/psgc-api`).
    *   Established chained API calls for dependent address dropdowns.
    *   Added comprehensive state management for API data, loading, and errors for the address section.
    *   Ensured `initialProfile` data correctly populates and triggers these dynamic dropdowns in an edit scenario.
    *   Changed `civilStatus`, `pronouns`, `assignedSexAtBirth` fields to `Select` components.
    *   Removed redundant `sogie` textarea.
*   **`carepop-web/src/app/dashboard/page.tsx` Update:** Display logic aligned with `camelCase` fields in `AuthContext.Profile`.
*   **`AuthContext.tsx` Update:** `Profile` interface refactored for mobile consistency (`camelCase`, specific SOGIE fields).

**Current Blockers/Risks:**
*   Potential unreliability or rate-limiting of the external PSGC API used for address selection.
*   Comprehensive testing of the new dynamic address fields and overall profile creation/editing flow is pending.

**Next Steps:**
*   Thorough end-to-end testing of profile creation and editing, focusing on the new API-driven address fields (happy paths, error handling, edge cases).
*   Verify data integrity in Supabase after profile creation/updates.
*   Review and enhance form validation as needed.
*   Address any bugs or UI/UX issues identified during testing.

**Overall Confidence:** Medium-High. The core functionality is implemented, but testing is critical due to the new external API dependency and complexity of chained selects.
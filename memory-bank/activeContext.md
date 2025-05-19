# Active Context: CarePop/QueerCare

## 1. Current Task/Focus

*   [Placeholder: What is the immediate task or area of focus? Reference TICKET-ID from `epics_and_tickets.md` and `tracker.md` if applicable.]

## 2. Recent Developments/Decisions (Link to `memorylog.md` if detailed)

*   [Placeholder: Note any very recent significant findings, decisions, or changes. E.g., "Identified a blocker for TICKET-XYZ due to API limitations."]

## 3. Next Immediate Steps

*   [Placeholder: What are the 1-3 concrete actions to be taken next in this session?]
    *   Step 1:
    *   Step 2:

## 4. Active Considerations/Questions

*   [Placeholder: Any open questions, uncertainties, or points that need clarification or further investigation?]

## 5. Recent Learnings/Insights

*   [Placeholder: Any new understanding gained that's relevant to the current work?]

---

*This document reflects the immediate "now" and should be updated frequently during a work session.*

## Active Context (Czar)

**Date:** YYYY-MM-DD (AUTO_UPDATE_DATE)

**Current Sprint/Focus:** Web App - Profile Management API Integration & Refinement

**Immediate Goal:** Complete implementation of dynamic, API-driven address selection in the web profile form and ensure all related Memory Bank documents are updated.

**Key Open Tickets (from `tracker.md`):**
*   `FE-PROFILE-1`: Create/Edit Profile Page (Web) - Address fields (`provinceCode`, `cityMunicipalityCode`, `barangayCode`) now use dynamic API-driven `Select` components. `civilStatus`, `pronouns`, `assignedSexAtBirth` are also `Select` components. Ready for thorough testing.
*   `FE-PROFILE-2`: Dashboard Page (Web) - Updated to use `camelCase` fields from `AuthContext.Profile`. Ready for testing.

**Recent Changes/Decisions:**
*   **`carepop-web/src/app/create-profile/page.tsx` address dropdowns fixed:**
    *   Clarified that the dynamic `Select` components for Province, City/Municipality, and Barangay fetch data from *local JSON files* (`provinces.json`, `cities-municipalities.json`, `barangays.json`) located in `carepop-web/public/data/psgc/`. This corrects previous notes that may have indicated an external API for these specific fields.
    *   User has confirmed placing/renaming these files correctly in the `carepop-web/public/data/psgc/` directory.
    *   This resolves the issue where these dropdowns might not have been populating correctly due to missing data sources.
    *   The `useEffect` hook in `create-profile/page.tsx` for populating the form with `initialProfile` data correctly sets `provinceCode`, `cityMunicipalityCode`, and `barangayCode`, which then triggers the cascading loading of dropdowns from the local JSON files if editing an existing profile.

**Next Immediate Steps:**
*   **User to test** the `create-profile` page functionality on `carepop-web/src/app/create-profile/page.tsx`, specifically the dynamic address fields, to ensure they populate and function correctly with the newly added local JSON data.
*   Review overall form validation after address fields are confirmed working.
*   **Proceed with commit and push of all changes to GitHub as requested by the user.**
*   Update `progress.md` and `memorylog.md` (Memory Log updated, Progress update will follow this).

**Risks/Blockers:**
*   Correctness and completeness of the data within the user-provided PSGC JSON files. If the data is malformed or incomplete, dropdowns might still have issues.
*   Reliability and rate limiting of the external PSGC API. If the API becomes unavailable or restrictive, it will impact profile creation/editing.

**Key Learnings:**
*   Successfully integrated chained loading of dependent dropdowns from local JSON files in a Next.js client component.
*   Handled loading and error states for multiple asynchronous operations related to form inputs.

**Memory Bank Files Status:**
*   `tracker.md`: Review status for `FE-PROFILE-1` (will be done before commit).
*   `activeContext.md`: This update.
*   `progress.md`: Pending update.
*   `memorylog.md`: Updated.

## Active Context (as of YYYY-MM-DD HH:MM)

**Previous Focus:** Completed the user profile creation page (`/create-profile`) for `carepop-web`.

**Current Focus:** Enhanced `dashboard/page.tsx` to display detailed user profile information and prompt for completion.

**Recent Changes/Decisions:**
*   Updated the `Profile` interface in `carepop-web/src/lib/contexts/AuthContext.tsx` to include `first_name`, `last_name`, `date_of_birth`, `pronouns`, and `sogie`.
*   Modified `carepop-web/src/app/dashboard/page.tsx` to:
    *   Fetch and display the newly added detailed profile fields from `AuthContext` (`profile` object).
    *   Display a personalized welcome message using `profile.first_name`.
    *   Show a prominent callout card prompting users to complete their profile if `first_name`, `last_name`, or `date_of_birth` are missing, with a direct link to `/create-profile`.
    *   Include an "Edit Profile" button that links to `/create-profile` (since it handles upserts).
    *   Improved loading and unauthenticated user states.
*   Successfully created and finalized `carepop-web/src/app/create-profile/page.tsx` in the previous step.
*   Added a password visibility toggle (eye icon) to the Login page (`carepop-web/src/app/login/page.tsx`).

**Next Immediate Steps & Considerations:**
1.  **Testing:**
    *   Test the dashboard profile display with a complete profile.
    *   Test with a new user who has an incomplete profile (verify the prompt appears and links correctly).
    *   Test the "Edit Profile" button functionality.
    *   Test the login page, specifically the new password visibility toggle.
2.  **`/update-password` Page:** Implement the `/update-password` page (ticket `AUTH-W-UP-1`) to complete the password reset flow.
3.  **Further Dashboard Development:** Continue with other planned dashboard features (e.g., displaying upcoming appointments, quick links to services).
4.  **Supabase Setup (User Action Reminder):**
    *   Ensure `profiles` table schema and RLS are correctly configured in Supabase.
    *   Configure Supabase Email provider and Google OAuth provider if not already done.

**Open Questions/Blockers:**
*   None currently active from AI side. User needs to test the new dashboard functionality and proceed with Supabase setup for full auth testing.

**Key Memory Log References:**
*   Decision on SOGIE data storage for web MVP (plain text).
*   Creation of `/create-profile` page.
*   Dashboard enhancement for profile display.
*   Login page password visibility toggle enhancement.

## Previous Context Snippets (for reference during update)

**Forgot Password Page (Part 1) Created:**
*   `forgot-password/page.tsx` created with email form.
*   `AuthContext.tsx` updated with `sendPasswordResetEmail` function.
*   Linter error in `forgot-password/page.tsx` resolved.

## Next Immediate Steps

1.  **Font Configuration with Tailwind v3:**
    *   The current font workaround (direct CSS in `globals.css`) is active.
    *   **Discuss with User:** Decide whether to attempt configuring fonts directly in `tailwind.config.ts` `theme.extend.fontFamily` using `next/font` CSS variables, which is typically supported in Tailwind v3. This could provide a cleaner setup than the current workaround.
2.  **UI Review & Theming:**
    *   User to review existing UI elements (`Header`, `page.tsx` sections) to ensure all colors, spacing, and component styles are applying as intended with the now-functional theme.
3.  **Continue UI Development:**
    *   Based on user priorities, proceed with styling other components, implementing new sections, or refining existing UI according to inspiration images and project requirements.

## Active Considerations & Known Issues

- The project is now on a stable version of Tailwind CSS (v3.4.3).
- The existing font workaround can be kept if preferred, or an attempt can be made to integrate fonts more directly via `tailwind.config.ts`.

## Memory Bank Files Updated

*   `activeContext.md` (This file - details of the new PGRST204 error and investigation steps)
*   `tracker.md` (Notes for USER-PROF-1/2/3 will be updated to reflect this DB schema issue)
*   `progress.md` (Reflecting this new blocker for USER-PROF epic)
*   `memorylog.md` (Logging this new error and investigation path)

# Active Dev Context & Focus (CarePoP)

**Last Updated:** {{YYYY-MM-DDTHH:MM:SSZ}} (AUTO_FILLED_ON_COMMIT)

**Current Primary Focus:** Finalizing Memory Bank updates after the successful creation and deployment of the `handle_new_user` Supabase trigger.

**Recent Key Activities & Decisions:**
*   **`handle_new_user` Trigger Deployed:**
    *   Successfully created and deployed the Supabase migration `carepop-backend/supabase/migrations/20240815120000_create_handle_new_user_trigger.sql`.
    *   This trigger automatically creates a profile stub (with `user_id` and `email`) in `public.profiles` when a new user is created in `auth.users`.
    *   This resolves the gap where a profile record was not being automatically created upon signup, which is essential for the two-step profile completion flow.
*   **SOGIE DB Migration Confirmed:** User previously confirmed that the migration `20250514161325_add_sogie_fields_to_profiles.sql` (adding `gender_identity`, `pronouns`, `assigned_sex_at_birth` to `public.profiles`) has been applied.
*   **Picker UI Refactor Complete (Previous Major Task):**
    *   Aligned picker UIs in `EditProfileScreen.tsx` and `CreateProfileScreen.tsx`.
    *   Converted "Gender Identity" to a `TextInput` in `EditProfileScreen.tsx`.

**Next Immediate Steps & Focus:**

1.  **Verify End-to-End Registration & Profile Flow (Client & Backend - `USER-PROF-1`, `AUTH-1`):
    *   **Action (User/AI):** Thoroughly test the entire user registration flow:
        1.  User signs up via the native app (`RegisterScreen.tsx`).
        2.  Confirm the `handle_new_user` trigger fires and creates a basic profile in `public.profiles` (check Supabase DB directly).
        3.  Confirm the user is then appropriately navigated to `CreateProfileScreen.tsx` (or the intended next step for new users needing to complete their profile).
        4.  User completes their profile on `CreateProfileScreen.tsx`, including SOGIE fields.
        5.  Confirm the `createProfile` service in the backend is called, encrypts sensitive data (including SOGIE), and updates the existing profile stub in `public.profiles`.
        6.  Confirm the user can then view their complete profile on `MyProfileScreen.tsx` (verifying decryption works via `getUserProfileService`).

2.  **Address Native App Navigation Error (`FE-SETUP-3`
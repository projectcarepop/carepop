# Active Context: CarePop/QueerCare

**Date:** YYYY-MM-DD (AUTO_UPDATE_DATE)

**Current Task/Focus:**
*   **Primary Blocker:** Resolving a CORS (Cross-Origin Resource Sharing) issue. The `carepop-web` frontend (running locally on `http://localhost:3000`) encounters a `TypeError: Failed to fetch` when trying to get user profile data from the deployed `carepop-backend-staging` service on Google Cloud Run (`https://carepop-backend-staging-199126225625.asia-southeast1.run.app`). Browser developer tools indicate this is due to invalid/missing CORS response headers from the backend.
*   **Previous Success:** A redirect loop on `carepop-web` related to profile completion was fixed.

**Recent Developments/Decisions (Link to `memorylog.md` if detailed):**
*   Confirmed frontend `NEXT_PUBLIC_BACKEND_API_URL` correctly points to the Cloud Run service.
*   The local `carepop-backend/src/server.ts` file contains a CORS configuration that *should* allow `http://localhost:3000`. The current hypothesis is that this configuration is not active or is being overridden in the currently deployed Cloud Run instance of `carepop-backend-staging`.
*   Initial troubleshooting of Cloud Run backend environment variables (KMS, Supabase URL/Key) was done.
*   Refined "email confirmed" logic in `AuthContext.tsx` to be less likely to interfere with normal sign-in.

**Next Immediate Steps:**
1.  **Verify Deployed Backend CORS Configuration:**
    *   Ensure the version of `carepop-backend/src/server.ts` containing the correct CORS setup (allowing `http://localhost:3000`) is the version deployed to `carepop-backend-staging` on Cloud Run. If unsure, redeploy `carepop-backend`.
2.  **Inspect Cloud Run Logs for `carepop-backend-staging`:**
    *   When the frontend attempts to fetch the profile and fails, check the Cloud Run logs for:
        *   Any incoming requests to `/api/users/profile`.
        *   Specific CORS error messages from the backend, especially `[CORS] Blocked request from origin: ...` (and note the reported origin).
        *   Any other backend errors that might prevent a successful response or proper CORS header attachment.
3.  **Examine Browser Network Tab in Detail:**
    *   For the failed fetch to `/api/users/profile`, inspect the preceding `OPTIONS` (preflight) request:
        *   What is its status code?
        *   What are its exact request and response headers? This will show what the browser asked for and what the server (Cloud Run) actually responded with regarding CORS.

**Active Considerations/Questions:**
*   Is the latest `carepop-backend` code with the intended CORS configuration definitely deployed and active on Cloud Run?
*   What specific origin (if any) is the deployed backend reporting as blocked by CORS in its logs?
*   Are there any other configurations on Cloud Run (e.g., load balancer, gateway) that might be interfering with CORS headers, though less likely for a standard setup.

**Recent Learnings/Insights:**
*   `TypeError: Failed to fetch` when a specific backend URL is used, coupled with browser "Issues" tab reporting CORS, strongly points to a server-side CORS configuration problem.
*   Distinguishing between local backend behavior and deployed backend behavior is crucial.

---

*This document reflects the immediate "now" and should be updated frequently during a work session.*

## Active Context (Czar)

**Date:** YYYY-MM-DD (AUTO_UPDATE_DATE)

**Current Sprint/Focus:** Web App - Profile Management API Integration & Refinement

**Immediate Goal:** Complete implementation of dynamic, API-driven address selection in the web profile form and ensure all related Memory Bank documents are updated.

**Key Open Tickets (from `tracker.md`):**
*   `TICKET-WEB-PROF-1`: Create/Edit Profile Page (Web) - Functionality significantly improved by fixing redirect loop. Address fields still text inputs. Requires full testing.
*   `TICKET-WEB-DASH-1`: Dashboard Page (Web) - Functionality significantly improved. Requires full testing.

**Recent Changes/Decisions:**
*   **Redirect Loop Fixed:** `AuthContext.tsx` now maps snake_case keys from backend to camelCase for profile state.
*   **`carepop-web/src/app/create-profile/page.tsx` address fields changed to Text Inputs:** (Consistent with memorylog.md)
    *   Due to persistent issues with `Select` dropdowns, the `provinceCode`, `cityMunicipalityCode`, and `barangayCode` fields were converted to use standard `Input` components as a temporary workaround.
    *   Associated state variables (`provincesList`, `citiesMunicipalitiesList`, `barangaysList`) and `useEffect` hooks for fetching/managing dropdown data have been commented out.
    *   The `AddressSelectItem` interface was removed as it became unused.
    *   This allows users to input address information as free text, bypassing the problematic dropdowns for now.
*   **`carepop-web/src/app/create-profile/page.tsx` address dropdowns fixed:** // This entry is now outdated by the change above.
    *   ~~Clarified that the dynamic `Select` components for Province, City/Municipality, and Barangay fetch data from *local JSON files* (`provinces.json`, `cities-municipalities.json`, `barangays.json`) located in `carepop-web/public/data/psgc/`. This corrects previous notes that may have indicated an external API for these specific fields.~~
    *   ~~User has confirmed placing/renaming these files correctly in the `carepop-web/public/data/psgc/` directory.~~
    *   ~~This resolves the issue where these dropdowns might not have been populating correctly due to missing data sources.~~
    *   ~~The `useEffect` hook in `create-profile/page.tsx` for populating the form with `initialProfile` data correctly sets `provinceCode`, `cityMunicipalityCode`, and `barangayCode`, which then triggers the cascading loading of dropdowns from the local JSON files if editing an existing profile.~~

**Next Immediate Steps:**
*   **Session Concluding.** Next session should begin with comprehensive testing of all auth and profile flows on web.

**Risks/Blockers:**
*   Free-text address input remains a temporary solution.

**Key Learnings:**
*   Importance of careful data mapping between frontend and backend, especially key casing.
*   `AuthContext.tsx` is central and now more robust.

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

**Current Primary Focus:** Session conclusion after fixing web profile redirect loop. Memory Bank synchronization is complete.

**Recent Key Activities & Decisions:**
*   **Redirect Loop Resolved:** Key mapping (snake_case to camelCase) implemented in `AuthContext.tsx` `fetchProfile`.
*   **`AuthContext.tsx` Review & Refinement:** Iteratively debugged and improved profile fetching and state management.
*   **Memory Bank Synchronization:** This current update process.
*   **`handle_new_user` Trigger Deployed:** (Still relevant background)
*   **SOGIE DB Migration Confirmed:** User previously confirmed that the migration `20250514161325_add_sogie_fields_to_profiles.sql` (adding `gender_identity`, `pronouns`, `assigned_sex_at_birth` to `public.profiles`) has been applied.
*   **Picker UI Refactor Complete (Previous Major Task):**
    *   Aligned picker UIs in `EditProfileScreen.tsx` and `CreateProfileScreen.tsx`.
    *   Converted "Gender Identity" to a `TextInput` in `EditProfileScreen.tsx`.

**Next Immediate Steps & Focus (for next session):**

1.  **Comprehensive E2E Testing of Web Auth/Profile (`TICKET-004`, `TICKET-005`, `TICKET-WEB-PROF-1`, `TICKET-WEB-DASH-1`):
    *   **Action (User/AI):** Test all scenarios: registration, email confirmation, login (new/existing user, complete/incomplete profile), profile creation/editing, dashboard display, sign out.

2.  **Prioritize Address Dropdown Implementation:** Discuss and plan the reimplementation of dynamic address dropdowns for `create-profile` page.

3.  **Verify Supabase Email Configuration (User task).**

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
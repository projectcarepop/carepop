# Active Context: CarePop/QueerCare

**Date:** YYYY-MM-DD (AUTO_UPDATE_DATE)

**Current Task/Focus:**
*   **Session Wrap-up & Planning:** Completed several UI/UX and functional improvements on `carepop-web`. Reviewing progress, updating Memory Bank, and planning next steps.

**Recent Developments/Decisions (Link to `memorylog.md` if detailed):**
*   **`carepop-web` `/create-profile` page:**
    *   Fixed "Submit Profile" button to correctly call `handleSubmit`.
    *   Replaced `Select` components for address fields (Province, City/Municipality, Barangay) with a reusable, searchable `Combobox` component for improved UX.
*   **`carepop-web` `/dashboard` page:**
    *   Updated to display full names for province, city/municipality, and barangay instead of codes, by fetching and mapping PSGC data.
*   **Themeing (`carepop-web`):**
    *   Changed the `--accent` color in `globals.css` to a lighter shade of the primary color, affecting hover states globally for better brand consistency.
*   PSGC data filtering for barangays in `/create-profile` was successfully debugged earlier in the session.
*   Backend `PATCH /api/users/profile` remains functional.

**Next Immediate Steps:**
1.  **Update `memorylog.md`** with details of the Combobox implementation, dashboard address display, submit button fix, and theme hover color change.
2.  **Confirm all Memory Bank files are consistent and accurate.**
3.  **Plan next steps for the project** (e.g., comprehensive E2E testing of `carepop-web` auth and profile features, moving to new features/epics).

**Active Considerations/Questions:**
*   Are there any other immediate UI tweaks needed for the `Combobox` or other profile/dashboard elements?
*   What is the highest priority for the next development cycle after E2E testing?

**Recent Learnings/Insights:**
*   Shadcn UI `Combobox` (using `cmdk`) provides a good solution for long dropdown lists.
*   Theme-wide color changes via CSS variables in `globals.css` are effective for consistent styling.
*   Fetching and mapping reference data (like PSGC codes to names) on the client-side is a viable pattern for display purposes when the datasets are manageable.

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
    *   Fetch and display the newly added detailed profile fields from `AuthContext` (`profile`
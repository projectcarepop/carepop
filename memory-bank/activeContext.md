# Active Context: CarePop/QueerCare

## Current Work Focus

*   **PIVOT:** Project has pivoted from **React Native CLI** to **Expo CLI** for native app development due to persistent build/configuration challenges with the previous setup.
*   **Current Goal:** Initialize and stabilize the new Expo CLI-based monorepo structure.
*   **Status:** Actively setting up the new monorepo.
*   **Previous Accomplishments (RN CLI Context):**
    *   Implemented and styled core UI components (`Button`, `Card`, `TextInput`, etc.) using `StyleSheet`.
    *   Integrated `react-native-vector-icons`.
    *   Resolved various RN CLI monorepo configuration issues (Metro, Next.js, Gradle, pnpm) after significant effort.
    *   Confirmed `StyleSheet` approach was the only stable method found for `packages/ui` *in the RN CLI context*.

## Recent Changes & Decisions

*   **Decision:** Pivoted from React Native CLI to Expo CLI.
*   *Historical (RN CLI):* Completed initial versions and styling enhancements for core UI components.
*   *Historical (RN CLI):* Applied UI design principles to components.
*   *Historical (RN CLI):* Committed UI styling enhancements.
*   *Historical (RN CLI):* Added Google Sign-Up button UI (web), created native registration screen structure.

## Next Steps (Expo Focus)

*   **Finalize Expo Monorepo Initialization:** Complete the setup using the chosen method (e.g., `create-expo-app` template, manual Turborepo integration).
*   **Configure Shared Packages:** Ensure `packages/ui`, `store`, etc., work correctly within the Expo environment.
*   **Determine Native Styling Strategy:** Evaluate Expo options (`expo-styling`, NativeWind v4, `StyleSheet`) and implement.
*   **Test Shared UI:** Verify basic shared components render in Expo Go / Dev Build.
*   **Integrate Navigation:** Set up Expo Router (recommended).
*   **Establish Dev Workflow:** Confirm `pnpm run dev` and basic Expo build processes.
*   **(Web - Remains Relevant):** Implement Google OAuth Logic.
*   **(Web - Remains Relevant):** Setup Frontend Supabase Client.

## Active Decisions & Considerations

*   **Frontend Architecture:** Monorepo (Next.js + **Expo CLI** + Shared Packages).
*   **Styling (Native):** **TBD** - Evaluate Expo options.
*   **Styling (Web):** Tailwind CSS.
*   **Dependencies:** Need to review/manage dependencies for Expo compatibility (e.g., `@expo/vector-icons` likely preferred over `react-native-vector-icons`).
*   **Known Issues (RN CLI - Historical):** Native Metro Port Conflict (Port 8081), build fragility - **These are superseded by the Expo pivot.**
*   **Known Issues (Expo):** TBD.

## Learnings & Insights

*   **Pivot Rationale:** RN CLI monorepo setup proved overly complex and fragile, hindering development velocity. Expo CLI is expected to offer a more integrated and stable development experience.
*   Applying general UI design principles significantly improves component polish.
*   Monorepo setups require diligent configuration (Expo may simplify parts).
*   Aggressive caching can still cause issues (`expo start -c`).

## Active Context - 2024-08-28 / 29 (Historical - RN CLI)

> _The following details relate to the state **before** the pivot to Expo CLI._

**Focus (Then):** Stabilizing RN CLI Frontend Monorepo & Implementing Core UI Components.

**Recent Changes & Discoveries (Then):**
*   Resolved Persistent RN Rendering Errors (Aggressive cleaning).
*   Shared Button (`@repo/ui`) Working in Native (RN CLI).
*   **Decision (Then):** Reverted from `styled-components` back to standard `StyleSheet`.
*   **Font Integration (RN CLI):** Added Inter font manually.

**Previous Context (RN CLI):**
*   *Root Cause of RN Errors:* Build/cache/config issue.
*   *Solution:* Aggressive cleaning.
*   Encountered/Resolved `ERR_PNPM_EBUSY`.

**Next Steps (Then):**
1.  Confirm `nativeapp` (RN CLI) Runs.
2.  Refine Theme.
3.  Integrate Button in Web.
4.  Build Next UI Component.

**Active Decisions/Considerations (Then):**
*   Using `StyleSheet` for `@repo/ui`.
*   Inter font chosen.
*   React version mismatches.

**Learnings/Insights (Then):**
*   `styled-components` type checking complex in RN CLI monorepos.
*   RN CLI requires manual font linking.
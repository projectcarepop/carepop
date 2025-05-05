# Active Context: CarePop/QueerCare

## Current Work Focus

*   **CRITICAL CORRECTION:** The main application component file for the native app is **`apps/nativeapp/App.tsx`**, NOT `apps/nativeapp/src/App.tsx`. Previous edits incorrectly targeted the `/src` path, leading to extensive debugging delays.
*   **Status:** Initial implementation of shared `RadioButton` and `RadioGroup` components (`packages/ui/src/radioButton.tsx`, `packages/ui/src/radioGroup.tsx`) created.
*   **Next Step:** Test the new Radio components in `nativeapp` and `apps/web`.
*   **Accomplishments:**
    *   Implemented and tested `Button`, `Card`, `TextInput`, `Checkbox` components.
    *   Integrated `react-native-vector-icons` successfully.
    *   Successfully integrated `react-native-vector-icons` for native and web, resolving previous build/rendering issues.
    *   Resolved various monorepo configuration issues (Metro, Next.js, Gradle, pnpm).
    *   Implemented `primary`, `secondary-solid`, and `secondary-outline` button variants using `StyleSheet` and shared theme.
    *   Configured `apps/web` with `react-native-web` and successfully rendered the shared button.
    *   Confirmed `StyleSheet` approach for `packages/ui` is stable.
*   **Building out foundational UI components in `@repo/ui` for cross-platform use (web/native).**
*   **Current goal: Transition from component building to implementing core features like user registration.**
*   Implementing the User Registration form (Ticket AUTH-2).
*   Current goal: Finalize web registration form UI and logic, connect to backend.

## Recent Changes & Decisions

*   Completed initial versions of `Button`, `Card`, `TextInput`, `Checkbox`, `RadioButton`, `RadioGroup`.
*   Implemented `Switch` component with platform-specific files (`.web.tsx`, `.native.tsx`) to handle rendering differences and achieve desired styling:
    *   Web: Custom implementation using `divs`/Tailwind.
    *   Native: Uses standard `RNSwitch`.
    *   Both use `theme.colors.destructive` ('#FF4769') for the 'on' track color and white for the thumb.
*   Updated color theme significantly based on user input (primary: `#142474`, secondary: `#87CEFA`, destructive: `#FF4769`, accent: `#FDBA74`).
*   Resolved various build/dependency/styling issues, particularly around icons (`react-native-vector-icons`) and web CSS overrides.
*   Created basic web registration page (`apps/web/app/register/page.tsx`) with email, password, confirm password fields using `@repo/ui` components.
*   Added state management (`useState`) for form inputs, loading, and errors.
*   Implemented client-side validation (required fields, password match).
*   Implemented `handleSubmit` function with `fetch` call to backend `/api/auth/register` endpoint.
*   Resolved CORS issues by configuring `cors` middleware in the backend (`carepop-backend/src/server.ts`).
*   Resolved backend startup issues related to incorrect imports in `server.ts`.
*   Successfully tested email/password registration flow connecting frontend to backend.
*   Added placeholder "Sign up with Google" button and handler to web registration form based on UX best practices.
*   Created basic native registration screen (`apps/nativeapp/src/screens/RegisterScreen.tsx`) with UI, state, and placeholder logic (requires navigation setup and API URL update for testing).
*   Updated password helper text and added TODO comments for future UX refinements (inline validation, show/hide password, social login logic) to both web and native forms.

## Next Steps

*   **Implement Google OAuth Logic:** Wire up the "Sign up with Google" button on the web to call the Supabase OAuth function.
*   **Setup Frontend Supabase Client:** Create a Supabase client instance specifically for the frontend (`apps/web`) to interact with Supabase Auth.
*   **Refine UI/UX:** Consider further UI refinements for the registration page (e.g., logo, better error display).
*   **Native App:**
    *   Setup navigation library (e.g., React Navigation).
    *   Integrate `RegisterScreen.tsx` into the navigation flow.
    *   Resolve native Metro port conflict (Port 8081).
    *   Update native API URL and test registration.

## Active Decisions & Considerations

*   **Frontend Architecture:** Monorepo (Next.js + RN CLI + Shared Packages) setup confirmed working and stable.
*   **Styling:** Standard `StyleSheet` + theme tokens for `packages/ui`. Tailwind CSS for `apps/web`.
*   **Dependencies:** `react-native-web` added to `apps/web`. React override to `18.2.0` in place.
*   **Build Scripts:** Added `--no-packager` to `nativeapp` android script.
*   **Known Issues:** Persistent TS/Linter errors for module resolution in IDE (e.g., `@repo/ui`, `react-native`), but runtime resolution works correctly.
*   **Native Metro Port Conflict:** The Metro bundler for `nativeapp` consistently fails to start due to port 8081 being in use (`EADDRINUSE`). Resolution deferred by user. This prevents testing the latest native code changes.
*   **Platform Differences:** Accept visual differences where necessary (e.g., native Switch doesn't have icon in thumb).
*   **Frontend Supabase Client:** Needs setup for web OAuth calls.
*   **Google OAuth Configuration:** Backend/Supabase settings for Google provider need to be fully configured and verified.

## Learnings & Insights

*   Monorepo setups with RN + Web require careful configuration (`next.config.js` aliasing/transpiling, `metro.config.js` watchfolders/resolvers, package manager specifics like pnpm/gradle paths).
*   Aggressive caching (Metro, Next.js, node_modules) can mask file changes and require thorough cleaning (`rimraf`, cache resets) during troubleshooting.
*   Verifying file content and paths directly is crucial when edits don't appear to take effect.
*   Separating `pnpm run dev` (bundler/server) and `pnpm run android/ios` (build/launch) into different terminals generally leads to clearer logs and less confusion.

## Active Context - 2024-08-28 / 29

**Current Focus:** Stabilizing Frontend Monorepo & Implementing Core UI Components.

**Recent Changes & Discoveries:**
*   Resolved Persistent RN Rendering Errors (Aggressive cleaning detailed below).
*   Shared Button (`@repo/ui`) Working in Native.
*   **Decision:** Reverted from `styled-components` back to standard `StyleSheet` for `@repo/ui` package due to persistent TypeScript type conflicts in the monorepo environment, specifically related to React version mismatches and theme type propagation.
*   **Font Integration:** Added Inter font.
    *   **Web:** Configured via `next/font/google` in `layout.tsx` and extended Tailwind theme.
    *   **Native:** Requires manual download of `.ttf` files to `apps/nativeapp/assets/fonts/`, creation of `apps/nativeapp/react-native.config.js`, and running `npx react-native-asset`. Font family ('Inter') added to shared theme (`packages/ui/src/theme.ts`) and applied in `Button.tsx`.

**Previous Context:**
*   *Root Cause of RN Errors:* Fundamental build/cache/config issue.
*   *Solution:* Aggressive cleaning:
        1.  `cd apps/nativeapp/android; ./gradlew clean; cd ../../..`
        2.  `pnpm dlx rimraf apps/nativeapp/android/build apps/nativeapp/android/app/build`
        3.  `pnpm dlx rimraf node_modules`
        4.  `pnpm dlx rimraf packages/.../node_modules` (explicitly)
        5.  `pnpm dlx rimraf apps/.../node_modules` (explicitly)
        6.  Terminate lingering Node/Metro/Gradle processes.
        7.  `pnpm install`
*   Encountered/Resolved `ERR_PNPM_EBUSY`.

**Next Steps:**
1.  **Confirm `nativeapp` Runs:** Verify `nativeapp` runs correctly with StyleSheet Button and Inter font.
2.  **Refine Theme:** Expand `packages/ui/src/theme.ts` with more comprehensive tokens (typography, shadows, etc.). (Task UI-2)
3.  **Integrate Button in Web (UI-4):** Add the `@repo/ui/button` to `apps/web/app/page.tsx` and verify rendering/styling (using Tailwind + Inter variable).
4.  **Build Next UI Component:** Proceed with Inputs, Cards, etc.

**Active Decisions/Considerations:**
*   Using `StyleSheet` for `@repo/ui` currently.
*   Inter font chosen.
*   React version mismatches (18.2 vs 19) still present as warnings, may need addressing later.

**Learnings/Insights:**
*   `styled-components` type checking can be complex in RN monorepos, potentially conflicting with `@types/react-native` or core RN types.
*   React Native requires manual font file placement and linking.
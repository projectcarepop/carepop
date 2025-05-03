# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Goal:** Begin implementing shared UI components and core app features.
*   **Action:** Discussing next steps (Shared UI, Auth Flow, etc.).

## Current Focus & Decisions

*   **Primary Goal:** Continue implementing the UI/UX Epic (Epic 2).
*   **Current Task:** Develop foundational shared UI components within `packages/ui`.
*   **Styling Approach:** Proceeding with **React Native `StyleSheet`** for `packages/ui` components, leveraging the defined theme tokens (`packages/ui/src/theme.ts`). The attempt to use `styled-components` introduced significant instability and build/type errors and has been successfully reverted.
*   **Blocker Resolved:** The persistent \"Objects are not valid as a React child\" rendering error in `apps/nativeapp` has been resolved by reverting code/config changes made after the last known good state and performing an aggressive clean install.

## Recent Changes & Decisions

*   **Decision:** Deleted `carepop-monorepo` for a third time due to persistent RN Android build issues.
*   **Setup Attempt 3:**
    *   Re-initialized Turborepo (`pnpx create-turbo`).
    *   Created `.npmrc` with `public-hoist-pattern` rules for RN packages (effectiveness for Gradle unclear).
    *   Manually configured Next.js (`apps/web`) within the starter template (dependencies, Tailwind, PostCSS, globals.css).
    *   Created shared `@repo/tailwind-config` package.
    *   Resolved `web` dev server/build issues related to Tailwind config resolution (used relative path + `require`) and TypeScript types (`React.FC` in layout).
    *   Initialized React Native (`apps/nativeapp`).
    *   **Resolved Android Gradle Build Errors:** Modified `settings.gradle` and `app/build.gradle` to point directly to the scripts in the *root* `node_modules` directory (`../../../` and `../../../../` respectively), bypassing `.npmrc` hoisting issues for Gradle.
    *   **Resolved Metro Bundler Error:** Commented out the `blockList` entry for `react-native/Libraries/Core/Devtools/` in `metro.config.js` to fix internal module resolution.
*   **Outcome:** Both `apps/web` and `apps/nativeapp` development servers are now running successfully.

## Next Steps

1.  Continue building out shared UI components (e.g., Card, Input, etc.) using `StyleSheet` and the theme.
2.  Integrate and test these components in both `apps/web` and `apps/nativeapp`.
3.  Refine the existing `Button` component styling as needed.

## Active Decisions & Considerations

*   **Frontend Architecture:** Monorepo (Next.js + RN CLI + Shared Packages) setup confirmed working.
*   **Styling:** Standard `StyleSheet` for `nativeapp` and shared `packages/ui`. Tailwind CSS for `apps/web` (will need RNW integration to use shared UI).
*   **Package Manager:** pnpm confirmed working, but required manual adjustments to RN Android Gradle build files (`settings.gradle`, `app/build.gradle`) to point to root `node_modules`, overriding `.npmrc` hoisting attempts for build scripts.
*   **Metro Config:** Required commenting out a default `blockList` entry to fix internal RN module resolution.

## Learnings & Insights

*   Monorepo setups with React Native can be sensitive to dependency mismatches and bundler configurations. `pnpm.overrides` helps, but deep cleaning (`node_modules`, caches) is sometimes necessary after dependency changes or failed experiments.
*   Introducing complex styling solutions like `styled-components` requires careful verification of compatibility with the specific React Native version and existing type definitions to avoid cascading errors.
*   Meticulously reverting to the last known good state is a crucial debugging technique when encountering persistent, hard-to-diagnose errors.

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
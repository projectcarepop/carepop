# Progress: CarePoP/QueerCare

## Progress Log

**Current Status:** Foundational shared Button component implemented and rendering correctly in both `nativeapp` (Android) and `apps/web`. Monorepo build/dev environment stabilized after troubleshooting.

**What Works:**
*   **FE Monorepo:** Turborepo structure stable and functional.
*   **FE NativeApp (`apps/nativeapp`):
    *   Builds and runs on Android.
    *   Metro bundler configured and stable.
    *   Renders shared UI (`Button` with variants, `Card`, `TextInput` with icons/disabled state) correctly using `react-native-vector-icons`.
*   **FE Web (`apps/web`):
    *   Builds and runs (using Webpack, Turbopack disabled for now).
    *   Configured with Tailwind CSS.
    *   Configured for `react-native-web`.
    *   Renders shared UI (`Button` with variants, `Card`, `TextInput` with icons/disabled state) correctly using `react-native-vector-icons`.
*   **Shared UI (`packages/ui`):
    *   `Button` component implemented with `primary`, `secondary-solid`, `secondary-outline` variants using `StyleSheet`.
    *   `Card` component implemented using `StyleSheet`.
    *   `TextInput` component implemented using `StyleSheet` with label, helper/error text, focus state, disabled state, and icon support.
    *   `Checkbox` component implemented.
    *   `RadioButton` and `RadioGroup` components implemented.
    *   `Switch` component implemented.
    *   Shared `theme.ts` defined with color palette, spacing, typography (using `sans-serif`), radii.

**What's Left to Build (Immediate Focus):**
*   **Test `Radio*`:** Integrate and test the new Radio components in both `nativeapp` and `apps/web`.
*   **Expand Shared UI Library (`packages/ui`):**
    *   Implement next core components (e.g., `Switch`, `Form`).
*   **Integrate UI in Apps:** Start using shared components to build actual screens/pages.
*   **State Management:** Set up shared state (`packages/store`).
*   **Authentication Flow:** Implement UI screens.
*   **(Lower Priority):** Revisit Turbopack issue in `apps/web`.

**Known Issues:**
*   Persistent TS/Linter errors for module resolution in IDE (e.g., `@repo/ui`, `react-native`), but runtime resolution works correctly.
*   Web app sometimes shows hydration errors likely caused by browser extensions.
*   **Native Metro Port Conflict:** Port 8081 (`EADDRINUSE`) prevents Metro bundler from starting. User has deferred resolution.
*   **Switch Visual Difference:** Native switch doesn't have an icon in the thumb like the (now unused) web version design iteration.

**Decisions/Evolutions:**
*   Confirmed `StyleSheet` + theme tokens as the styling approach for `packages/ui`.
*   Removed unused folders outside `carepop-monorepo`.
*   Configured `next.config.js` for RNW.
*   Installed `react-native-web` in `apps/web`.
*   Added `--no-packager` flag to `nativeapp` android script.
*   Switched button font from 'Inter' back to default `sans-serif`.

## Progress & Current Status

### What Works

*   **Monorepo Structure:** Turborepo setup with pnpm is functional.
*   **Web App (`apps/web`):** Basic Next.js app with Tailwind CSS runs correctly.
*   **Native App (`apps/nativeapp`):**
    *   Basic React Native app runs on Android.
    *   Builds successfully after Gradle path modifications.
    *   Metro bundler configured for monorepo runs.
    *   **Shared UI (`packages/ui`):** Basic `Button` component using `StyleSheet` and theme tokens renders correctly in `nativeapp`. The previous rendering error ("Objects are not valid...") is resolved.
*   **Shared Theme (`packages/ui/src/theme.ts`):** Basic theme tokens (colors, spacing, etc.) are defined.
*   **Font Integration:** Inter font configured for web and native (manual linking).
*   **React Version:** Forced to `18.2.0` via `pnpm.overrides`.

### What's Left to Build (Immediate Focus)

*   **Test `Radio*`:** Integrate and test the new Radio components in both `nativeapp` and `apps/web`.
*   **Expand Shared UI Library (`packages/ui`):**
    *   Implement core components (Card, Input, Headers, etc.) using `StyleSheet`.
    *   Refine styling and variants for existing components (Button).
*   **Integrate UI in Apps:** Use the shared components consistently in both `web` and `nativeapp`.
*   **State Management (`packages/store`):** Set up shared state (e.g., Redux Toolkit).
*   **Authentication Flow:** Implement UI screens for login, registration, etc.

### Current Status Summary

The foundational monorepo setup for both web and native apps is stable. The primary blocker related to rendering shared UI components in the native app has been resolved by reverting to a known good state and confirming the `StyleSheet` approach works. The immediate next steps involve expanding the shared UI library using `StyleSheet` and theme tokens.

### Known Issues

*   TypeScript errors persist in IDE/Linter regarding inability to find `@repo/ui` modules and its contents, despite runtime success. Likely an IDE/TS server issue needing restart or further investigation if it causes problems later.
*   Web app sometimes shows hydration errors likely caused by browser extensions.
*   **Native Metro Port Conflict:** Port 8081 (`EADDRINUSE`) prevents Metro bundler from starting. User has deferred resolution.
*   **Switch Visual Difference:** Native switch doesn't have an icon in the thumb like the (now unused) web version design iteration.

### Evolution of Decisions

*   **Initial Plan:** Use NativeWind/Tailwind for native styling.
    *   **Outcome:** Abandoned due to intractable Babel errors.
*   **Second Attempt:** Use `styled-components` for shared UI theming.
    *   **Outcome:** Abandoned due to build/type errors and introduction of rendering instability.
*   **Current Approach:** Use React Native `StyleSheet` with shared theme tokens (`packages/ui/src/theme.ts`) for `packages/ui` components. This approach is currently stable and functional.

## What Works

*   Backend Infrastructure & Core Logic (Supabase + Cloud Run).
*   Backend Auth Endpoints (Register, Login).
*   Backend Profiles Table & Basic RLS.
*   **Frontend Monorepo Structure (`carepop-monorepo`).**
*   **`apps/web` Development Server (Next.js + Tailwind).**
*   **`apps/nativeapp` Development Server (React Native Metro Bundler).**
*   **`apps/nativeapp` Android Build (Gradle build succeeds).**

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Frontend Monorepo Setup:**
    *   ~~Re-initialize Turborepo monorepo.~~ (Done)
    *   ~~Configure pnpm hoisting (`.npmrc`).~~ (Done, but ineffective for Gradle)
    *   ~~Initialize `apps/nativeapp` (RN CLI).~~ (Done)
    *   ~~Initialize `apps/web` (Next.js).~~ (Done)
    *   ~~Establish basic monorepo build/dev workflows, verifying native Android build succeeds.~~ (Done)
    *   **Configure shared `packages/ui`:** Create basic shared components (e.g., Button) using `StyleSheet`.
    *   **Test Shared UI:** Render shared components in both `apps/web` (using RNW) and `apps/nativeapp`.
    *   Configure shared `packages/typescript-config` usage consistency.
    *   Configure shared `packages/store`.
*   **Phase 1 (MVP) - Frontend Implementation within Monorepo:**
    *   Implement Auth UI.
    *   Implement Profile Management UI.
    *   Implement Basic Appointment Scheduling UI.
    *   Implement Basic Provider Directory UI.
    *   Implement DPA Consent UI flow.
*   **Phase 1 (MVP) - Backend Refinements:**
    *   Refine RLS policies (Epic 3).
    *   Implement Profile Update endpoint (Epic 4).
    *   Implement foundational DPA consent logic (Epic 3).
*   **Phase 2 & 3:** As previously outlined.

*(Refer to `epics_and_tickets.md` for detailed task breakdown)*

## Known Issues

*   ~~BLOCKER: React Native Android builds fail within the pnpm monorepo due to Gradle being unable to find required scripts.~~ (Resolved by modifying Gradle paths)
*   ~~Metro bundler fails to resolve internal RN modules.~~ (Resolved by modifying `metro.config.js` `blockList`)
*   ~~Web build/dev fails due to Tailwind config resolution / TS errors.~~ (Resolved)
*   Peer Dependency Warning in `apps/web`: Tailwind version mismatch (Low priority, may cause issues later).
*   Production build (`pnpm run build`) might still fail due to TypeScript/Next.js type resolution issues (Low priority for now).
*   Task Master AI tools fail (Low Priority).

## Evolution of Project Decisions

*   Initial state: Decision made to proceed with Supabase + Google Cloud Run hybrid architecture.
*   Decision made to prioritize React Native CLI over Expo.
*   Decision made to recommend Redux Toolkit for state management.
*   Decision made that application-level encryption (AES-256-GCM) is mandatory for SPI/PHI.
*   Decision made that SSR/SSG is required for public web pages.
*   Decision to handle auth via backend endpoints.
*   Decision to use `service_role` Supabase client for specific trusted server-side ops.
*   **Decision:** Abandoned initial frontend implementation due to build issues.
*   **Decision:** Restarted frontend using a Monorepo structure (Turborepo/pnpm) with Next.js (web), RN CLI (native), NativeWind styling, and shared packages, based on a detailed frontend plan.
*   **Decision:** Discarded first monorepo initialization attempt due to errors; proceeding with fresh `create-turbo` initialization.
*   **Decision:** Named the React Native application `nativeapp` during initialization.
*   **Decision:** Configured `metro.config.js` in `nativeapp` with monorepo settings (`watchFolders`, `nodeModulesPaths`, `extraNodeModules`, `blockList`, `server.enhanceMiddleware`).
*   **Decision:** Downgraded React/React-DOM to 18.2.0 across workspaces to match RN 0.73.8 dependency.
*   **Decision:** Removed NativeWind/Tailwind CSS from `apps/nativeapp` due to persistent build errors. Switched to standard React Native `StyleSheet` for native styling.
*   **Decision:** Re-initialized monorepo after resolving initial Babel errors.
*   **Decision:** Deleted the re-initialized monorepo again after encountering persistent Android Gradle build failures related to pnpm path resolution.
*   **Decision (Attempt 3):** Initialized monorepo, configured `.npmrc` (ineffective for Gradle), manually set up `apps/web`, created shared Tailwind config, initialized `apps/nativeapp`.
*   **Decision:** Resolved `web` dev issues by using relative path + `require` for Tailwind config and `React.FC` for layout type.
*   **Decision:** Resolved Android Gradle build issues by modifying `settings.gradle` and `app/build.gradle` to point directly to root `node_modules`.
*   **Decision:** Resolved Metro bundler issues by commenting out `blockList` entry for RN Devtools path.
*   **Outcome:** Monorepo development environment is now functional for both web and native apps.

## Current Status

*   **Core UI Components (@repo/ui):**
    *   `Button`: Functional (Primary, Secondary Solid/Outline, Destructive variants). Styles refined.
    *   `Card`: Basic container functional.
    *   `TextInput`: Functional with label, placeholder, helper text, error state, leading/trailing icons.
    *   `Checkbox`: Functional with label, disabled state. Style refined.
    *   `RadioButton`/`RadioGroup`: Functional with label, disabled state. Style refined.
    *   `Switch`: Functional. Uses platform-specific implementations (`.web.tsx`, `.native.tsx`) for consistent styling goals (pink 'on' track, white thumb). Native version uses standard `RNSwitch` (no thumb icon), Web uses custom divs/Tailwind.
*   **Platform Setup:**
    *   `apps/web`: Next.js app running, displaying UI components, Tailwind configured.
    *   `apps/nativeapp`: React Native app setup, dependencies linked. **Metro bundler currently blocked by port 8081 conflict (`EADDRINUSE`).**
*   **Tooling:** Icons (`react-native-vector-icons`) working on both platforms.

## What Works

*   Basic UI components render and function on both web and native (assuming native Metro can be started).
*   Theme colors are applied correctly.
*   Monorepo structure allows sharing UI code.
*   Platform-specific file resolution (`.web.tsx`, `.native.tsx`) is working for the Switch.

## What's Left / Next Steps

*   **Implement User Registration Form:** Utilize existing UI components.
*   **Resolve Native Metro Port Conflict:** The `EADDRINUSE` error for port 8081 needs to be fixed to allow native development/testing.
*   **Develop Core App Features:** Move beyond basic UI components.
*   **Add State Management:** Implement more robust state management if needed (beyond local component state).
*   **Backend Integration:** Connect forms/actions to the backend (Supabase).
*   **Testing:** Implement unit/integration/E2E tests.
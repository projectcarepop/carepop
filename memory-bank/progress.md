# Progress: CarePoP/QueerCare

## Progress Log

**Current Status:** Frontend Monorepo (`carepop-monorepo`) initialized and basic setup complete for `nativeapp` and `web`. Backend (`carepop-backend`) basic structure exists but needs implementation.

**What Works:**
*   **FE Monorepo:** Turborepo structure initialized.
*   **FE NativeApp:**
    *   Basic app initializes and builds successfully on Android after fixing Gradle path issues (`settings.gradle`, `app/build.gradle`) and Metro `blockList` conflicts.
    *   Persistent rendering errors ("Objects are not valid...", "Text strings must...") resolved through aggressive cleaning (Gradle, build folders, all node_modules).
    *   Shared UI Button (`@repo/ui/button`, using `title` prop) renders correctly.
*   **FE Web:**
    *   Basic Next.js app setup.
    *   Tailwind configured.

**What's Left to Build (High-Level):**
*   **FE Shared UI (`@repo/ui`):
    *   **UI-1:** Finalize styling approach (StyleSheet/Context vs Styled Components) and implement Theme setup/providers.
    *   **UI-2:** Define comprehensive theme tokens (colors, spacing, typography). (Basic structure exists in `theme.ts`).
    *   **UI-3:** Button component. (Basic version working in native, needs web testing & refinement).
    *   **UI-4:** Integrate Button in Web.
    *   Implement other core components (Inputs, Cards, Modals, etc.).
*   **FE NativeApp:**
    *   Integrate chosen theming solution.
    *   Build out actual app screens and navigation.
    *   Connect to backend API.
*   **FE Web:**
    *   Integrate chosen theming solution.
    *   Build out actual app pages and navigation.
    *   Connect to backend API.
*   **Backend:**
    *   Implement core services (Authentication, User Profiles, etc.).
    *   Define database schema (Supabase migrations).
    *   Implement API endpoints.
    *   Set up tests.
*   **Infrastructure & CI/CD:**
    *   GitHub Actions workflows.
    *   Deployment strategies.

**Known Issues:**
*   None currently critical now that RN rendering is fixed.

**Decisions/Evolutions:**
*   **2024-08-28:** Abandoned NativeWind for `nativeapp` due to persistent Babel errors. Switched to standard `StyleSheet` approach for initial components.
*   **2024-08-28:** Reset entire `carepop-monorepo` due to intractable build/cache errors.
*   **2024-08-28:** Resolved Gradle path issues in `nativeapp` for monorepo compatibility.
*   **2024-08-28:** Resolved Metro `blockList` issue preventing app boot.
*   **2024-08-28:** Resolved persistent RN rendering errors via aggressive cleaning.

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

*   **Expand Shared UI Library (`packages/ui`):**
    *   Implement core components (Card, Input, Headers, etc.) using `StyleSheet`.
    *   Refine styling and variants for existing components (Button).
*   **Integrate UI in Apps:** Use the shared components consistently in both `web` and `nativeapp`.
*   **State Management (`packages/store`):** Set up shared state (e.g., Redux Toolkit).
*   **Authentication Flow:** Implement UI screens for login, registration, etc.

### Current Status Summary

The foundational monorepo setup for both web and native apps is stable. The primary blocker related to rendering shared UI components in the native app has been resolved by reverting to a known good state and confirming the `StyleSheet` approach works. The immediate next steps involve expanding the shared UI library using `StyleSheet` and theme tokens.

### Known Issues

*   TypeScript errors persist in `App.tsx` regarding inability to find `@repo/ui` modules, despite runtime success. Likely an IDE/TS server issue needing restart or further investigation if it causes problems later.
*   Web app (`apps/web`) hasn't been tested with the latest shared UI Button changes yet.

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
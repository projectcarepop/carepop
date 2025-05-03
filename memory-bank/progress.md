# Progress: CarePoP/QueerCare

## Current Status

*   **Frontend Monorepo:** Deleted due to persistent React Native Android build errors related to pnpm path resolution. Requires re-initialization with a modified strategy (e.g., `.npmrc` hoisting rules).
*   Backend infrastructure, CI/CD, auth endpoints, profiles table, etc., remain functional and unchanged.

## What Works

*   Backend Infrastructure & Core Logic (Supabase + Cloud Run).
*   Backend Auth Endpoints (Register, Login).
*   Backend Profiles Table & Basic RLS.

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Frontend Monorepo Setup (RESTART):**
    *   Re-initialize Turborepo monorepo.
    *   Configure pnpm hoisting (`.npmrc`).
    *   Initialize `apps/nativeapp` (RN CLI).
    *   Initialize `apps/web` (Next.js).
    *   Establish basic monorepo build/dev workflows, **verifying native Android build succeeds**.
    *   Configure shared packages (`ui`, `config`, `store`, etc.) using appropriate styling (StyleSheet native, Tailwind web).
*   **Phase 1 (MVP) - Frontend Implementation within Monorepo:** (Dependent on successful setup)
    *   Implement Auth UI.
    *   Implement Profile Management UI.
    *   Implement Basic Appointment Scheduling UI.
    *   Implement Basic Provider Directory UI.
    *   Implement DPA Consent UI flow.
*   **Phase 1 (MVP) - Backend Refinements:** (Can proceed independently if needed)
    *   Refine RLS policies (Epic 3).
    *   Implement Profile Update endpoint (Epic 4).
    *   Implement foundational DPA consent logic (Epic 3).
*   **Phase 2 & 3:** (Dependent on successful setup)

*(Refer to `epics_and_tickets.md` for detailed task breakdown)*

## Known Issues

*   **BLOCKER:** React Native Android builds fail within the pnpm monorepo due to Gradle being unable to find required scripts (`native_modules.gradle`, `gradle-plugin`) because of pnpm's default hoisting behavior. Requires re-setup with hoisting configuration.
*   Peer Dependency Warning in `apps/web` (from previous attempt, likely to reappear): Tailwind version mismatch.
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
*   **Decision:** Deleted the re-initialized monorepo again after encountering persistent Android Gradle build failures related to pnpm path resolution. Will attempt a third initialization, configuring pnpm hoisting immediately.
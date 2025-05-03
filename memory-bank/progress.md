# Progress: CarePoP/QueerCare

## Current Status

*   Monorepo structure (`carepop-monorepo`) initialized with `apps/web` and `apps/nativeapp`.
*   Basic setup for shared Tailwind config (`packages/tailwind-config`) for web and shared UI (`packages/ui` using StyleSheet for native) is complete.
*   `apps/web` is configured for Tailwind; basic dev mode runs.
*   `apps/nativeapp` is configured for standard `StyleSheet` styling. **Build is no longer blocked by Babel error.** Verification pending.
*   React/React-DOM versions downgraded to 18.2.0 across workspaces.
*   Foundational infrastructure (GCP, Supabase), backend CI/CD, logging, config management, and backend testing frameworks remain set up (FOUND-1 to FOUND-6 related to backend).
*   User registration (FOUND-9) and login (FOUND-10) backend endpoints remain implemented and functional.
*   `profiles` table created and basic RLS policies implemented and verified (FOUND-8).
*   Backend CI/CD Pipeline.
*   Backend Testing Framework.
*   Monorepo structure created (`carepop-monorepo`) with `apps/web` and `apps/nativeapp`.
*   **Basic monorepo development environment (`pnpm run dev`) starts both web and native apps.**

## What Works

*   Backend Infrastructure & Core Logic.
*   Monorepo structure created (`carepop-monorepo`) with `apps/web` and `apps/nativeapp`.
*   Shared Tailwind configuration (`packages/tailwind-config`) for web.
*   Shared UI package (`packages/ui`) setup using `StyleSheet` for native.
*   `apps/web` development server (`pnpm run dev`) starts and renders shared component (styling might be affected by NativeWind/Tailwind peer dep warning).
*   `apps/nativeapp` development server (`pnpm run dev`) starts without the previous Babel error (App functionality verification pending).

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Frontend Monorepo Setup:**
    *   ~~Initialize new monorepo using `create-turbo`.~~ (Done)
    *   ~~Initialize `apps/nativeapp` (RN CLI).~~ (Done)
    *   ~~Establish basic monorepo build/dev workflows (`pnpm run dev`).~~ (Native no longer blocked, verification pending)
    *   ~~Refine `apps/web` (Next.js setup, Tailwind, etc.).~~ (Basic setup done)
    *   ~~Configure shared packages (`ui`, `config` [Tailwind part]).~~ (UI uses StyleSheet for native)
    *   ~~Fix `apps/nativeapp` Babel build error.~~ (Fixed by removing NativeWind)
    *   **Verify `apps/nativeapp` runs correctly and renders basic components.**
    *   Test shared component styling/functionality end-to-end (Native: StyleSheet, Web: Tailwind/RNW).
    *   Develop strategy for consistent cross-platform styling in `packages/ui`.
    *   Configure shared `packages/typescript-config` usage consistency.
    *   Configure shared `packages/store`.
*   **Phase 1 (MVP) - Frontend Implementation within Monorepo:**
    *   Implement Auth UI (`apps/web`, `apps/nativeapp` using `packages/ui`).
    *   Implement Profile Management UI.
    *   Implement Basic Appointment Scheduling UI.
    *   Implement Basic Provider Directory UI (`apps/web` with SEO focus).
    *   Integrate State Management (`packages/store`, app providers).
    *   Implement DPA Consent UI flow.
*   **Phase 1 (MVP) - Backend Refinements:**
    *   Refine RLS policies (Epic 3).
    *   Implement Profile Update endpoint (Epic 4).
    *   Implement foundational DPA consent logic (Epic 3).
*   **Phase 2 & 3:** As previously outlined, implemented within the new monorepo structure.

*(Refer to `Epic and Tickets Tracker.txt` or `epics_and_tickets.md` for detailed task breakdown)*

## Known Issues

*   ~~`apps/nativeapp` build fails due to persistent Babel error: `.plugins is not a valid Plugin property`. Root cause unclear despite troubleshooting (React versions aligned, config syntax checked, cache cleared).~~ (Resolved by removing NativeWind)
*   Peer Dependency Warning in `apps/web`: `tailwindcss` v4 installed, but a dependency might expect v3. (Potential styling issues later on web).
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
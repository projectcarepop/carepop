# Project Progress: CarePop/QueerCare

## Current Status (As of <YYYY-MM-DDTHH:MM:SSZ_PLACEHOLDER>)

**Major project restructure in progress. The primary goal is to establish a new, simplified top-level directory structure within the main Git repository (`https://github.com/projectcarepop/carepop.git`) consisting of three distinct applications: `carepop-backend/`, `carepop-nativeapp/`, and `carepop-web/`. This will be followed by a force push to the `main` branch to set this new structure as the baseline, effectively resetting the commit history on `main` for a cleaner start.**

-   **File Reorganization (Manual - IN PROGRESS):** Actively organizing files into a temporary `carepop-final-structure/` local directory. This involves:
    *   Copying the existing `carepop-backend/` contents.
    *   Migrating and integrating the `carepop-frontend/apps/nativeapp/` and relevant parts of `carepop-frontend/packages/ui/` into a new `carepop-final-structure/carepop-nativeapp/`.
    *   Migrating the contents of the recently initialized `carepop-web-nextjs/` project into `carepop-final-structure/carepop-web/`.
    *   Ensuring no nested `.git` directories or unnecessary `node_modules` are copied into `carepop-final-structure`.
-   **Memory Bank Update (IN PROGRESS):** All Memory Bank files are being updated to reflect this new three-pillar architecture and the decision to force push.
-   **Git Operations (PENDING):** Once file organization and Memory Bank updates are complete:
    1.  Initialize Git in `carepop-final-structure/`.
    2.  Commit all files as the new baseline.
    3.  Force push to `origin main` of the main GitHub repository.

### Architectural Shift Summary (Evolution):

1.  **Initial Concept:** Single React Native application for mobile and web (RNW).
2.  **First Major Pivot:** Dual-frontend system – Native app (Expo for iOS/Android within `carepop-frontend` monorepo) and a separate new web app (Next.js/Tailwind/Shadcn in its own repo/folder).
3.  **Current Major Pivot (Restructure):** Simplify to three distinct top-level folders (`carepop-backend`, `carepop-nativeapp`, `carepop-web`) within the *single main Git repository*, abandoning the complex `carepop-frontend` monorepo structure and preparing for a force push to reset `main` branch history.

## What Works (Locally, prior to final reorganization)

-   **`carepop-backend/`:** Basic setup runs, Supabase client configured. Core CRUD operations and auth logic were in development.
-   **`carepop-frontend/apps/nativeapp/` (Source for new `carepop-nativeapp/`):**
    *   Expo project initializes and runs on simulators/devices.
    *   Navigation structure (Drawer, Stacks) implemented.
    *   Numerous UI screens scaffolded (Dashboard, Profile, Booking, Trackers etc.).
    *   AuthContext created (was bypassed for UI dev).
    *   Basic theme and shared UI components (from `packages/ui`) were functional within it.
-   **`carepop-web-nextjs/` (Source for new `carepop-web/`):**
    *   Next.js project initialized successfully with TypeScript, Tailwind CSS, and Shadcn UI.

## What's Left to Build (Immediate Post-Restructure Focus)

1.  **Finalize & Verify New Structure:** Complete the manual file copy to `carepop-final-structure/`, initialize Git, commit, and **successfully force push to the main GitHub repository**.
2.  **Update & Verify Memory Bank:** Ensure all Memory Bank documents accurately reflect the final, implemented structure.
3.  **Establish Local Development Workflows:** Confirm and document `npm install` and `npm run dev` (or equivalent) for each of the three applications (`carepop-backend`, `carepop-nativeapp`, `carepop-web`) in their new top-level locations.
4.  **Configure CI/CD Pipelines:** Adapt or create new CI/CD workflows (e.g., GitHub Actions) for the three distinct applications based on their new paths.
5.  **Native App (`carepop-nativeapp/`):**
    *   Verify all migrated code (from `apps/nativeapp` and `packages/ui`) functions correctly.
    *   Re-integrate and test authentication flow against `carepop-backend/` (remove bypass).
    *   Continue feature development per `epics_and_tickets.md`.
6.  **Web App (`carepop-web/`):**
    *   Begin building out core pages (Login, Registration, Public Info, Admin Shell) and features per `epics_and_tickets.md`.
7.  **Backend (`carepop-backend/`):**
    *   Continue developing API endpoints to support both frontend applications.

## Known Issues & Blockers (Current)

-   **Complexity of Manual File Migration:** Risk of errors (missing files, incorrect paths, nested `.git` folders) during the manual copy into `carepop-final-structure/`. Requires careful execution.
-   **Force Push Implication:** Overwrites `main` branch history on GitHub. Requires confirmation that this is acceptable and any collaborators are aware.
-   **Build/Dependency Conflicts Post-Migration:** Potential for issues when running `npm install` or builds in the newly structured applications if paths or dependencies were implicitly tied to the old monorepo structure. Needs thorough testing.

## Key Decisions & Evolutions Log

-   **<Current Date Placeholder> - Decision:** Adopt a simplified three-pillar top-level folder structure (`carepop-backend/`, `carepop-nativeapp/`, `carepop-web/`) within the single main Git repository. Abandon the `carepop-frontend` monorepo. Plan to force push the new structure to `main`, resetting its history.
    *   **Rationale:** Simplify development, reduce monorepo tooling overhead, clarify project boundaries, and provide a cleaner baseline for future development. Accepted loss of old `main` branch history for these benefits.
-   **(Previous Decision - Documented):** Shifted from React Native for Web to a separate Next.js/Tailwind/Shadcn UI web application. Native app to use Expo for iOS/Android only. (This decision is refined by the current structural pivot).
-   **(Previous Decision - Documented):** Switched native app development from React Native CLI to Expo CLI (Managed Workflow) due to monorepo setup difficulties with RN CLI.

*(Retain older decision log entries below for historical context)*
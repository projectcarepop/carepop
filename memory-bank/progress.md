# Progress: CarePoP/QueerCare

## Current Status

*   **Frontend development being restarted from scratch using a Monorepo structure (`carepop-monorepo`).**
*   Previous `carepop-frontend` code and build configuration discarded.
*   Foundational infrastructure (GCP, Supabase), backend CI/CD, logging, config management, and backend testing frameworks remain set up (FOUND-1 to FOUND-6 related to backend).
*   User registration (FOUND-9) and login (FOUND-10) backend endpoints remain implemented and functional.
*   `profiles` table created and basic RLS policies implemented and verified (FOUND-8).

## What Works

*   Backend Infrastructure (GCP Services, Supabase Project).
*   Backend Core Logic (Auth Endpoints, Profile Creation, Basic RLS, Config, Logging).
*   Backend CI/CD Pipeline.
*   Backend Testing Framework.

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Frontend Monorepo Setup:**
    *   **Initialize new monorepo using `create-turbo`.**
    *   Configure `apps/web` (Next.js).
    *   Initialize `apps/native` (RN CLI).
    *   Configure shared packages (`ui`, `config`, `store`, `types`).
    *   Establish monorepo build/dev workflows.
*   **Phase 1 (MVP) - Frontend Implementation within Monorepo:**
    *   Implement Auth UI (`apps/web`, `apps/native` using `packages/ui`).
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

*   Task Master AI tools fail (Low Priority).
*   **Monorepo initialization needs to be performed.**

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
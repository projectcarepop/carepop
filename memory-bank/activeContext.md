# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Active Ticket:** FOUND-5: Configure CI/CD Pipeline (Build, Test, Deploy to Staging) (Cloud Run & Supabase).
*   **Current Goal:** Set up an initial CI/CD pipeline (e.g., GitHub Actions) to automate linting, testing (basic), building Docker images for the backend, and deploying to the staging Cloud Run service.

## Current Focus

*   Completing foundational setup tasks (Epic 1).
*   Currently transitioning from **FOUND-2 (Basic Dev Env Setup)** to **FOUND-3 (Setup Supabase Project & Basic Schema)**.

## Recent Changes

*   Created initial versions of `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, and `progress.md`.
*   Completed FOUND-1: Established initial project directory structure and placeholder files for `carepop-frontend` and `carepop-backend`.
*   Completed FOUND-2: Configured basic development environments for frontend (React Native/TS) and backend (Node/TS), including dependency installation, TS config, basic scripts, and Supabase client initialization.

## Next Steps

*   Begin work on **FOUND-3: Setup Supabase Project & Basic Schema**. This includes:
    *   Creating the Supabase project (if not already done).
    *   Configuring basic project settings (Auth, APIs).
    *   Defining initial database schema (e.g., `users`, `profiles` tables) via Supabase Studio UI or SQL migrations.
    *   Setting up basic RLS policies.
*   Review the initialized Memory Bank files for accuracy and completeness based on the source documents.
*   Address the Task Master AI initialization/parsing issues (API key error) or proceed with manual task creation based on `Epic and Tickets Tracker.txt`.

## Active Decisions & Considerations

*   Confirming the Supabase + Google Cloud Run hybrid architecture.
*   Verifying the multi-layered access control strategy (Supabase RLS + Cloud Run checks).
*   Acknowledging the critical need for application-level encryption (AES-256-GCM) for SPI/PHI.
*   Planning for SSR/SSG for public web pages (Directory).
*   Need to resolve Task Master AI tool errors or switch to manual task management.

## Important Patterns & Preferences

*   **Backend:** Node.js/TypeScript on Google Cloud Run.
*   **Database/BaaS:** Supabase (PostgreSQL, Auth, RLS).
*   **Security:** SPI/PHI requires application-level AES-256-GCM encryption before storage. RLS is primary access control, supplemented by backend checks. Secrets in GCP Secret Manager.
*   **Frontend:** React Native (CLI) with TypeScript. Redux Toolkit recommended.
*   **Infrastructure:** Staging environment provisioned (Supabase project, GCP Cloud Run, Secret Manager).
    *   Staging Cloud Run URL: `https://carepop-backend-staging-199126225625.asia-southeast1.run.app`
    *   Supabase URL/Keys stored in GCP Secret Manager (`supabase-staging-url`, `supabase-staging-anon-key`, `supabase-staging-service-role-key`, `supabase-staging-db-password`).
*   Leverage managed services (Supabase, GCP) where possible.
*   Prioritize security and compliance (DPA mandatory, HIPAA strategic).
*   User-centered and inclusive design.
*   Cross-platform development using React Native CLI.

## Learnings & Insights

*   The project involves significant complexity due to sensitive data, dual compliance goals (DPA/HIPAA), cross-platform requirements, and the hybrid backend architecture.
*   Supabase RLS is powerful but requires careful design and testing.
*   Application-level encryption adds a necessary layer but requires careful implementation and key management (via Cloud Secret Manager).
*   Third-party vetting (including Supabase/GCP) is crucial. 
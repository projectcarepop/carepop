# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Active Ticket:** FOUND-6: Set up Basic Testing Frameworks & Initial Unit Tests.
*   **Current Goal:** Integrate Jest (or similar) into frontend and backend projects. Write minimal initial unit tests to verify setup and integration with the CI pipeline (`deploy-backend-staging.yml`).

## Current Focus

*   Completing foundational setup tasks (Epic 1).
*   Just completed setting up the initial backend CI/CD pipeline (`FOUND-5` backend part).

## Recent Changes

*   Completed FOUND-3: Staging infrastructure setup (Supabase, Cloud Run, Secret Manager).
*   Completed FOUND-4: Implemented backend structured logging (Winston/Cloud Logging) and configuration loading (Secret Manager/.env).
*   Completed FOUND-5 (Backend Part): Added `carepop-backend/Dockerfile` and `.github/workflows/deploy-backend-staging.yml` for automated deployment to Cloud Run.
*   Pushed all changes up to FOUND-5 (Backend Part) to GitHub `main` branch.

## Next Steps

*   Monitor the first run of the `deploy-backend-staging.yml` workflow in GitHub Actions.
*   Begin work on **FOUND-6: Set up Basic Testing Frameworks & Initial Unit Tests**.
    *   Install Jest and necessary types/presets for `carepop-backend`.
    *   Install Jest and React Native Testing Library for `carepop-frontend`.
    *   Configure Jest in both projects.
    *   Add basic unit tests.
    *   Update CI workflow to include a test step.

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
*   **CI/CD:** GitHub Actions workflow (`.github/workflows/deploy-backend-staging.yml`) handles backend build and deployment to Cloud Run staging via Workload Identity Federation.

## Learnings & Insights

*   The project involves significant complexity due to sensitive data, dual compliance goals (DPA/HIPAA), cross-platform requirements, and the hybrid backend architecture.
*   Supabase RLS is powerful but requires careful design and testing.
*   Application-level encryption adds a necessary layer but requires careful implementation and key management (via Cloud Secret Manager).
*   Third-party vetting (including Supabase/GCP) is crucial. 
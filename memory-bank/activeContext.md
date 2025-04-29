# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Active Epic:** Epic 1: Core Platform & Foundational Setup / Epic 2: User Management & Core Features
*   **Active Ticket:** AUTH-2: Integrate Supabase Client (Frontend)

## Current Focus

*   Completing foundational setup tasks (Epic 1).
*   Just completed setting up the initial backend CI/CD pipeline (`FOUND-5` backend part).

## Recent Changes & Decisions

*   Completed Supabase Auth dashboard configuration (**AUTH-1** Part 1): Enabled Email/Google, configured URLs.
*   Completed **FOUND-6:** Configured Jest testing framework for backend (`ts-jest`) and frontend (`react-native-testing-library`).
*   Completed **FOUND-5:** Backend CI/CD pipeline setup (GitHub Actions, WIF, Cloud Run deployment).
    *   Successfully configured GitHub Actions workflow (`deploy-backend-staging.yml`).
    *   Utilized Workload Identity Federation for GCP authentication.
    *   Troubleshooted and resolved issues related to OIDC audience and GCP attribute mapping.
    *   Backend container is now automatically built, pushed to Artifact Registry, and deployed to Cloud Run staging on `main` branch pushes.
*   Resolved local Git state inconsistencies that prevented changes to the workflow file from being detected by `git status`.

## Next Steps

*   **Immediate:**
    *   Begin work on **AUTH-2**:
        *   Install Supabase JS SDK (`@supabase/supabase-js`) in `carepop-frontend`.
        *   Create Supabase client instance configuration (`carepop-frontend/src/config/supabaseClient.ts` or similar).
        *   Load Supabase URL and Anon Key securely (e.g., via environment variables for React Native - `react-native-dotenv`).
        *   Set up an Auth context provider or similar mechanism to manage user session state globally in the frontend app.
    *   Plan initial frontend Auth UI components (Login/Signup screens - UI-5, UI-6).
*   **Upcoming:**
    *   Define user schema and RLS (`FOUND-8`).
    *   Build backend registration/login endpoints (`FOUND-9`, `FOUND-10`).

## Active Decisions & Considerations

*   **Decision:** Use **Jest** as the testing framework for both backend (Node.js/TypeScript) and frontend (React Native) for consistency.
    *   Backend will use `ts-jest` for TypeScript integration.
    *   Frontend will use Jest with `react-native-testing-library` for component testing.
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
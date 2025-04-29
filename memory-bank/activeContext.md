# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Active Epic & Ticket(s):**
    *   `FOUND-8`: Design & Implement Foundational User Database Schema (Supabase) - **Table created, basic RLS policies verified.**
    *   `FOUND-9`: Registration Endpoint (including profile creation) - **Done & Verified.**
    *   `FOUND-10`: Login Endpoint - **Done & Verified.**
*   **Goal:** Foundational authentication and profile management backend is functional and secure with basic RLS. Recent changes committed and pushed.

## Current Focus

*   Consolidating recent progress on authentication and RLS.
*   Planning next steps based on foundational work completion.

## Recent Changes & Decisions

*   Completed foundational setup (FOUND-1 to FOUND-6), including project structure, dependencies, Supabase clients, GCP infrastructure (Cloud Run, Artifact Registry, Secret Manager), logging, config, CI/CD pipeline, and basic testing setup.
*   Configured Supabase Auth providers (Email, Google) in the dashboard (AUTH-1 Part 1).
*   **Decision:** Confirmed that user authentication (registration, login) will be handled via dedicated backend endpoints (Option B) rather than direct frontend Supabase calls.
*   Backend refactored to use Express (`server.ts`).
*   Registration (FOUND-9) and Login (FOUND-10) endpoints implemented and tested via Postman.
*   `profiles` table migration (FOUND-8) created and applied.
*   **Decision:** Implemented profile creation within `registerUserService` immediately after successful `signUp`.
*   **Troubleshooting:** Resolved `email_address_invalid` error (Supabase blocks `@example.com`). Resolved `consent_given` column mismatch. Resolved RLS violation on profile insert.
*   **Decision/Pattern:** Implemented a dual Supabase client pattern in the backend (`supabaseClient.ts`):
    *   Standard client (`supabase`) using `anon` key for general operations respecting RLS.
    *   Service role client (`supabaseServiceRole`) using `service_role` key (loaded from `.env`/Secret Manager) to bypass RLS for specific trusted server-side operations (e.g., initial profile creation post-signup).
*   Basic RLS policies (`Allow individual read/update/insert`) verified manually via SQL Editor.
*   Relevant code changes committed and pushed to `origin main`.

## Next Steps

*Discuss and decide on the next priority:*
1.  **Implement Profile Update:** Work on an endpoint for users to update their own profiles (Part of Epic 4 - Profile Management, e.g., PROF-3).
2.  **Frontend Integration:** Start integrating these auth/profile endpoints into the frontend application (e.g., UI-5, UI-6).
3.  **Refine RLS:** Discuss and implement more complex RLS scenarios (e.g., provider access) (Part of Epic 3 - Security/Consent, e.g., SEC-BE-1, SEC-BE-3).
4.  **Other:** Address another task or feature from the backlog.

## Active Decisions & Considerations

*   **Decision:** Use **Jest** as the testing framework for both backend (Node.js/TypeScript) and frontend (React Native) for consistency.
*   Confirming the Supabase + Google Cloud Run hybrid architecture.
*   Verifying the multi-layered access control strategy (Supabase RLS + Cloud Run checks).
*   Acknowledging the critical need for application-level encryption (AES-256-GCM) for SPI/PHI.
*   Planning for SSR/SSG for public web pages (Directory).
*   Need to resolve Task Master AI tool errors or switch to manual task management.
*   **Pattern:** Use dual Supabase clients (anon/service role) in backend for appropriate privilege levels.

## Important Patterns & Preferences

*   **Backend:** Node.js/TypeScript on Google Cloud Run, using Express.
*   **Database/BaaS:** Supabase (PostgreSQL, Auth, RLS).
*   **Security:** SPI/PHI requires application-level AES-256-GCM encryption before storage. RLS is primary access control, supplemented by backend checks. Secrets in GCP Secret Manager. **Use service role key with caution only for trusted server-side ops needing to bypass RLS.**
*   **Frontend:** React Native (CLI) with TypeScript. Redux Toolkit recommended.
*   **Infrastructure:** Staging environment provisioned (Supabase project, GCP Cloud Run, Secret Manager).
    *   Staging Cloud Run URL: `https://carepop-backend-staging-199126225625.asia-southeast1.run.app`
    *   Supabase URL/Keys stored in GCP Secret Manager (`supabase-staging-url`, `supabase-staging-anon-key`, `supabase-staging-service-role-key`, `supabase-staging-db-password`). `.env` used for local dev.
*   Leverage managed services (Supabase, GCP) where possible.
*   Prioritize security and compliance (DPA mandatory, HIPAA strategic).
*   User-centered and inclusive design.
*   Cross-platform development using React Native CLI.
*   **CI/CD:** GitHub Actions workflow (`.github/workflows/deploy-backend-staging.yml`) handles backend build and deployment to Cloud Run staging via Workload Identity Federation.
*   **Supabase Client:** Dual client pattern used in backend (`supabaseClient.ts`) - `supabase` (anon key) and `supabaseServiceRole` (service role key).

## Learnings & Insights

*   The project involves significant complexity due to sensitive data, dual compliance goals (DPA/HIPAA), cross-platform requirements, and the hybrid backend architecture.
*   Supabase RLS is powerful but requires careful design and testing, especially in the context of the SQL editor vs. actual client behavior.
*   Server-side operations creating data for a user immediately after signup often require bypassing RLS using the `service_role` key, as the standard client may not be authenticated as the new user yet in that context.
*   Application-level encryption adds a necessary layer but requires careful implementation and key management (via Cloud Secret Manager).
*   Third-party vetting (including Supabase/GCP) is crucial.
*   Supabase Auth may block certain email domains (e.g., `@example.com`).
*   Ensure database schema matches code expectations (e.g., column names). 
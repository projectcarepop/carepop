# Epic & Ticket Tracker

This file tracks the progress of Epics and Tickets using a structured format.

---

## Epic 1: Core Setup, Authentication & Deployment Foundation (Supabase & GCP)

### Ticket: FOUND-1: Setup Code Repositories & Initial Project Structure

*   **Status:** Done
*   **Goal:** Create Git repositories, initialize basic folder structure.
*   **Acceptance Criteria:**
    *   [x] GitHub repository created (`projectcarepop/carepop`).
    *   [x] `carepop-frontend` directory created.
    *   [x] `carepop-backend` directory created.
    *   [x] Basic `.gitignore` files added.
*   **Notes:**
    *   Initial commit made.
*   **Related Commits:** [0f02776]

### Ticket: FOUND-2: Configure React Native & Node.js Development Environment with TypeScript & Supabase SDK

*   **Status:** Done
*   **Goal:** Ensure consistent local dev setup, install core deps, configure TS.
*   **Acceptance Criteria:**
    *   [x] `package.json` initialized for frontend and backend.
    *   [x] Core dependencies installed (React Native, Node, TS, Supabase client, dotenv).
    *   [x] `tsconfig.json` configured for both.
    *   [x] Basic run/dev/build scripts added.
    *   [x] Backend Supabase client configured (`src/config/supabaseClient.ts`) reading from `.env`.
*   **Notes:**
    *   Developers need to manually create `.env` locally for Supabase keys.
*   **Related Commits:** [3da65da] (Part of larger commit)

### Ticket: FOUND-3: Select, Provision, & Configure Core Cloud Infrastructure (Staging)

*   **Status:** Done
*   **Goal:** Provision Supabase project and basic GCP resources (Cloud Run, Secret Manager, Logging) for staging.
*   **Acceptance Criteria:**
    *   [x] Supabase project (`carepop-staging`) provisioned.
    *   [x] GCP project selected, APIs enabled (Cloud Run, Secret Manager, Logging).
    *   [x] Placeholder Cloud Run service (`carepop-backend-staging`) created.
    *   [x] Supabase credentials stored in GCP Secret Manager.
    *   [x] Basic Cloud Logging confirmed.
*   **Notes:**
    *   Staging Cloud Run URL: https://carepop-backend-staging-199126225625.asia-southeast1.run.app
*   **Related Commits:** [3da65da] (Part of larger commit)

### Ticket: FOUND-4: Implement Structured Logging and Configuration Management

*   **Status:** Done
*   **Goal:** Integrate Winston for structured logging to Cloud Logging, load config from Secret Manager/.env.
*   **Acceptance Criteria:**
    *   [x] Added Winston for structured logging with Cloud Logging integration (`carepop-backend/src/utils/logger.ts`).
    *   [x] Updated Supabase client config (`carepop-backend/src/config/supabaseClient.ts`) to load secrets from GCP Secret Manager (in GCP) or `.env` (local).
    *   [x] Created basic backend entrypoint (`carepop-backend/src/server.ts`) demonstrating usage.
*   **Notes:**
    *   Configuration logic prioritizes GCP Secret Manager when `GCP_PROJECT_ID` env var is set.
*   **Related Commits:** [3da65da] (Part of larger commit)

### Ticket: FOUND-5: Configure CI/CD Pipeline (Backend Part)

*   **Status:** Done
*   **Goal:** Automate backend build, test, and deployment to Cloud Run staging via GitHub Actions.
*   **Acceptance Criteria:**
    *   [x] Created `carepop-backend/Dockerfile` for containerization.
    *   [x] Configured GCP Artifact Registry (`carepop-images`).
    *   [x] Set up GitHub Actions Workload Identity Federation for GCP auth.
    *   [x] Created `.github/workflows/deploy-backend-staging.yml`.
    *   [x] Successfully deployed to Cloud Run staging via CI/CD.
*   **Notes:**
    *   Troubleshooting required for Workload Identity Federation (audience/attribute mapping issues).
*   **Related Commits:** [00ff14a], [0f149f8], [28e69d6], [0acfa52], [83c4009], [4297e45], [065f1f8], [8132b23]

### Ticket: FOUND-6: Configure Testing Frameworks (Unit/Integration)

*   **Status:** Done
*   **Goal:** Set up Jest for testing frontend and backend code.
*   **Acceptance Criteria:**
    *   [x] Jest installed and configured for backend (`ts-jest`).
    *   [x] Jest installed and configured for frontend (`react-native` preset).
    *   [x] React Native Testing Library installed for frontend.
    *   [x] Basic test files exist for both projects.
    *   [x] `npm test` script works for both projects.
*   **Notes:**
    *   Decision made to use Jest for consistency across frontend and backend.
    *   Encountered configuration issues with RN preset and RNTL on frontend, resolved by explicit installs (`@react-native/babel-preset`, `@testing-library/jest-native`) and dependency cleaning.
*   **Related Commits:** [74c7f5a]

### Ticket: AUTH-1: Configure Supabase Auth & Basic Settings

*   **Status:** In Progress
*   **Goal:** Set up the basic authentication configuration within the Supabase project dashboard.
*   **Acceptance Criteria:**
    *   [x] Decision made on primary auth method (Email/Password + Google Login for MVP).
    *   [x] Email provider enabled in Supabase dashboard.
    *   [x] Google provider enabled in Supabase dashboard (requires GCP OAuth setup).
    *   [x] Email templates (confirmation, password reset) reviewed.
    *   [x] Site URL and Redirect URLs configured correctly in Supabase Auth settings.
    *   [x] RLS policies for basic user access reviewed/created (e.g., users can see their own profile) - **Verified via SQL Editor.**
*   **Notes:**
    *   Initial setup includes both Email/Password and Google Login.
    *   Google OAuth requires setting up credentials in Google Cloud Console first.
    *   Basic RLS policies (`Allow individual read/update/insert`) implemented in FOUND-8 migration and verified.
*   **Technology/Implementation Suggestions:** Supabase Platform (Auth section), Supabase JS SDK, Google Cloud Console (OAuth Credentials).

### Ticket: FOUND-9: Build Backend API (Cloud Run Function): Secure User Registration

*   **Status:** Done
*   **Goal:** Create the backend endpoint (Google Cloud Run function) for new user registration, leveraging Supabase Authentication and storing basic profile data.
*   **Acceptance Criteria:**
    *   [x] POST `/api/auth/register` endpoint implemented as a Google Cloud Run function (or equivalent Express route/controller/service pattern).
    *   [x] API accepts email and password.
    *   [x] Implement initial input validation (basic checks) within the Cloud Run function/service layer.
    *   [x] Utilize Supabase JS SDK within the Cloud Run function/service layer to call `supabase.auth.signUp()`.
    *   [x] If Supabase Auth signup is successful, automatically create a corresponding entry in the `profiles` table (linked to FOUND-8) linked to the new `auth.uid()`. **Requires using the `service_role` key client.**
    *   [x] Handles email uniqueness constraint gracefully (managed by Supabase Auth).
    *   [x] API returns appropriate status codes (201 Created on success, error codes on failure handled by controller).
*   **Notes:**
    *   Relies on Supabase Auth for registration.
    *   Profile creation implemented using `service_role` client to bypass RLS.
    *   Column name mismatch (`consent_given` vs `granular_consents`) resolved.
*   **Related Commits:** [a5d7816], [3ece009], [dfaebf6]

### Ticket: FOUND-10: Build Backend API (Cloud Run Function): Secure User Login & Token Generation

*   **Status:** Done
*   **Goal:** Implement the endpoint (Google Cloud Run function) for user authentication, using Supabase Authentication to issue tokens on success.
*   **Acceptance Criteria:**
    *   [x] POST `/api/auth/login` endpoint implemented as a Google Cloud Run function (or equivalent Express route/controller/service pattern).
    *   [x] API accepts email and password.
    *   [x] Implement input validation within the Cloud Run function/service layer.
    *   [x] Utilize Supabase JS SDK within the Cloud Run function/service layer to call `supabase.auth.signInWithPassword()`.
    *   [x] If verification succeeds, Supabase Auth returns an authentication token (JWT). The Cloud Run function/service returns this token to the frontend.
    *   [x] API returns 200 OK with token on success, 401 Unauthorized on failure (or 400 if input invalid). Avoid leaking "user exists" info on failure.
    *   [ ] Basic rate limiting added for this endpoint (potential future enhancement).
*   **Notes:**
    *   Relies on Supabase Auth for login.
*   **Related Commits:** [4d2e9e5]

### Ticket: FOUND-8: Design & Implement Foundational User Database Schema (**Supabase**) (Authentication Focus)

*   **Status:** Done
*   **Goal:** Define the minimum schema needed to support secure user registration and login within **Supabase PostgreSQL**, linked to its authentication, and implement basic **Row Level Security (RLS)**.
*   **Acceptance Criteria:**
    *   [x] **`users` table schema verified (managed by Supabase Auth).**
    *   [x] **Additional `profiles` table created in Supabase PostgreSQL for basic user-specific data (linked via `user_id` to Supabase Auth `users.id` with appropriate foreign key/constraints).**
    *   [x] Basic `created_at`, `updated_at` timestamps added to `profiles` table.
    *   [x] **Row Level Security (RLS) enabled on the `profiles` table.**
    *   [x] **Initial RLS policies defined and implemented on `profiles`** to allow authenticated users to view and edit *only their own* profile (`user_id = auth.uid()`) - **Verified via SQL Editor.**
    *   [x] **Supabase JS SDK configured to interact with the `profiles` table.**
    *   [x] Ensure appropriate indexing (e.g., on email in Auth, on `user_id` in `profiles`).
    *   [x] **Supabase migrations created to apply the schema.**
*   **Technology/Implementation Suggestions:** **Supabase PostgreSQL, Supabase RLS, Supabase migrations, Supabase JS SDK.**
*   **Related Commits:** [815983a]

---

*(Structure for other epics/tickets can be added here as needed)* 
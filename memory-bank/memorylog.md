# Conceptual Change Log

*   **Timestamp:** 2024-05-21T10:00:00Z (Placeholder) - **Action:** Completed FOUND-1 (Setup Code Repositories & Initial Project Structure). Conceptual commit approved. 
*   **Timestamp:** 2024-05-21T10:05:00Z (Placeholder) - **Action:** Started FOUND-2: Initialized `package.json`, installed core dependencies (react, react-native, typescript, types), and created `tsconfig.json` for `carepop-frontend`.
*   **Timestamp:** 2024-05-21T10:10:00Z (Placeholder) - **Action:** Continued FOUND-2: Initialized `package.json`, installed dependencies (@supabase/supabase-js, dotenv, typescript, types, ts-node-dev), and created `tsconfig.json` for `carepop-backend`. 
*   **Timestamp:** 2024-05-21T10:15:00Z (Placeholder) - **Action:** Completed FOUND-2: Added dev/build/run scripts to `package.json` files and created backend Supabase client config (`src/config/supabaseClient.ts`). User confirmed manual creation of `.env` file.
*   **Timestamp:** 2024-05-21T10:20:00Z (Placeholder) - **Action:** Conceptual Commit Point: FOUND-2 (Basic Dev Env Setup) completed and approved. 
*   **Timestamp:** 2024-05-21T10:XX:XXZ (Placeholder) - **Action:** Completed FOUND-3: Provisioned core staging infrastructure (Supabase Project, GCP Cloud Run placeholder, GCP Secret Manager for keys, Cloud Logging confirmed). Staging Cloud Run URL: https://carepop-backend-staging-199126225625.asia-southeast1.run.app
*   **Timestamp:** 2024-05-21T11:XX:XXZ (Placeholder) - **Action:** Conceptual Commit Point: FOUND-3 (Core Staging Infrastructure) completed and approved.
*   **Timestamp:** 2024-05-21T11:YY:YYZ (Placeholder) - **Action:** Completed FOUND-4: Implemented structured logging (Winston + Cloud Logging) and configuration management (GCP Secret Manager / .env fallback) in backend.
*   **Timestamp:** 2024-05-21T11:ZZ:ZZZ (Placeholder) - **Action:** Conceptual Commit Point: FOUND-4 (Logging & Config) completed and approved.
*   **Timestamp:** 2024-05-21T12:AA:AAZ (Placeholder) - **Action:** Completed FOUND-5 (Backend Part): Created backend Dockerfile, configured Artifact Registry, and set up GitHub Actions workflow (`deploy-backend-staging.yml`) for CI/CD to Cloud Run staging service using Workload Identity Federation. 
*   **Timestamp:** 2024-05-21T14:00:00Z (Placeholder) - **Action:** Successfully completed FOUND-5 (Backend CI/CD) after troubleshooting Workload Identity Federation audience and attribute mapping issues. Backend is deploying to Cloud Run staging via GitHub Actions.
*   **Timestamp:** 2024-05-21T15:00:00Z (Placeholder) - **Action:** Completed FOUND-6: Configured Jest testing framework for backend (ts-jest) and frontend (react-native-testing-library), including basic test files and package scripts.
*   **Timestamp:** 2024-05-21T15:30:00Z (Placeholder) - **Action:** Completed Supabase Auth dashboard configuration (AUTH-1 Part 1): Enabled Email/Google providers, configured Google OAuth Client, set Site/Redirect URLs.
*   **Timestamp:** 2024-05-21T15:35:00Z (Placeholder) - **Action:** Decided to implement backend endpoints (Option B) for user registration and login (FOUND-9, FOUND-10) rather than direct frontend calls to Supabase Auth.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Proposed plan to implement `registerUserService` in `carepop-backend/src/services/authService.ts` to handle user registration via Supabase `signUp` (FOUND-9).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Implemented `registerUserService` in `carepop-backend/src/services/authService.ts`, including Supabase client import, input validation, `supabase.auth.signUp` call, and error handling (FOUND-9). Corrected import name after initial error.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Added Jest unit tests for `registerUserService` in `carepop-backend/src/services/__tests__/authService.test.ts`, mocking Supabase client and covering success/failure cases. Tests passed. (FOUND-9)
*   **Timestamp:** <placeholder_timestamp> - **Action:** Committed changes for registration endpoint implementation and tests (FOUND-9).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Confirmed next step is FOUND-10 (Login Endpoint). Updated active context.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Updated `tracker.md` to include FOUND-9 (Done) and FOUND-10 (To Do) entries based on `epics_and_tickets.md`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Implemented login endpoint (route, controller, service) and added unit tests for `loginUserService`. Tests passed. (FOUND-10)
*   **Timestamp:** <placeholder_timestamp> - **Action:** Committed changes for login endpoint implementation and tests (FOUND-10).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Pushed commits for FOUND-9 (Registration) and FOUND-10 (Login) to origin main.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Updated `tracker.md` to mark FOUND-10 as Done.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Fixed `Promise<void>` linter warnings in `authController.ts` by changing return type annotation to `Promise<Response | void>`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Shifted focus to FOUND-8 (Profiles Table & RLS). Updated active context.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Guided user to fix PATH environment variable for Supabase CLI.
*   **Timestamp:** <placeholder_timestamp> - **Action:** `supabase db push` failed due to missing `moddatetime` extension. Instructed user to enable it in Supabase dashboard.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Modified `create_profiles_table` migration trigger to use `extensions.moddatetime()`. User manually ran `supabase db push` successfully, applying the migration. (FOUND-8)
*   **Timestamp:** <placeholder_timestamp> - **Action:** Committed profiles table migration file (FOUND-8).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Reviewed Memory Bank. Proposed plan: Push FOUND-8 commit, implement profile creation on registration, commit/push, discuss RLS verification.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Pushed commit for FOUND-8 (Profiles migration) to origin main.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Implemented profile creation in `registerUserService` after successful signup (FOUND-9 TODO).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Committed and pushed profile creation logic.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Manual RLS test failed to select user's own profile; investigation showed profile row did not exist for the test user (likely created before profile creation logic was added).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Registration test with `@gmail.com` succeeded, confirming `@example.com` was blocked by Supabase (`email_address_invalid`).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Restored `options.data` block in `signUp` call in `authService.ts`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Registration succeeded but profile creation failed due to schema mismatch (`consent_given` vs `granular_consents`). Corrected column name in `authService.ts` profile insert.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Profile creation still failed due to RLS violation (`new row violates row-level security policy`). Identified that anon key client lacked permission for insert.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Updated `supabaseClient.ts` to initialize and export a second client (`supabaseServiceRole`) using the service role key.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Updated `authService.ts` to use `supabaseServiceRole` client for the profile insert operation.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Added `SUPABASE_SERVICE_ROLE_KEY` to local `.env` file. Restarted backend. Successful user registration and profile creation confirmed.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Manually verified RLS policies (individual read/update) via SQL Editor - Passed.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Committed and pushed fixes for profile creation and RLS verification.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Memory Bank update process completed after successful implementation and verification of user registration, profile creation, and basic RLS.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Corrected Memory Bank references to non-existent FOUND-11 ticket; clarified Profile Update belongs to Epic 4.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Decided to restart frontend implementation using a Monorepo structure (Turborepo/npm) with Next.js (web) + React Native CLI (native) and NativeWind, following a detailed frontend plan provided by the user. Previous frontend code/build setup discarded.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Attempted initial Turborepo setup; encountered errors. Deleted partial setup. Proceeding with fresh `npx create-turbo@latest` initialization.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Successfully initialized React Native app (`apps/nativeapp`) using interactive prompt (`npx @react-native-community/cli init --version 0.73.8`) after failures with non-interactive commands.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Added `dev` script to `apps/nativeapp/package.json`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Corrected Android SDK path format in `apps/nativeapp/android/local.properties`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Performed clean install (`rm -rf node_modules pnpm-lock.yaml && pnpm install`) to fix workspace linking issues for `nativeapp`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Corrected syntax error (`image.png`) in `apps/web/next.config.js`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Corrected Android SDK path format (escaped backslashes) in `apps/nativeapp/android/local.properties`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Configured `apps/nativeapp/metro.config.js` with `watchFolders` and `nodeModulesPaths` for pnpm monorepo compatibility.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Successfully ran `pnpm run dev` from monorepo root; both `apps/web` (Next.js) and `apps/nativeapp` (Metro bundler) started correctly.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Conceptual Commit Point: Basic monorepo structure (`create-turbo`, `react-native init`, Metro config) completed and development environment (`pnpm run dev`) verified. Approved.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Configured Tailwind CSS for `apps/web` and created shared `@repo/tailwind-config` package.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Configured `packages/ui` for NativeWind and tested shared Button component in `apps/web` and `apps/nativeapp`.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Encountered persistent Babel error (`.plugins is not a valid Plugin property`) in `apps/nativeapp` despite troubleshooting (React downgrade, cache clears, config changes).
*   **Timestamp:** <placeholder_timestamp> - **Action:** Pausing work. Next step is to investigate the root cause of the `nativeapp` Babel error.
*   **Timestamp:** <placeholder_timestamp> - **Action:** Decided to remove NativeWind/Tailwind CSS from `apps/nativeapp` due to persistent build errors. Removed dependencies (`nativewind`, `tailwindcss`), updated `babel.config.js`, and modified shared UI component (`packages/ui/src/button.tsx`) to use `StyleSheet`.
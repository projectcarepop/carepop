# Progress: CarePoP/QueerCare

## Current Status

*   Project initialized.
*   Foundational infrastructure (GCP, Supabase), CI/CD, logging, config management, and testing frameworks are set up (FOUND-1 to FOUND-6).
*   User registration (FOUND-9) and login (FOUND-10) backend endpoints implemented and functional.
*   `profiles` table created and basic RLS policies implemented and verified (FOUND-8).
*   Profile creation is now successfully linked to the registration process.

## What Works

*   Basic project structure exists.
*   FOUND-1: Initial project structure created.
*   FOUND-2: Basic Dev Env Setup completed.
*   FOUND-3: Core Cloud Infrastructure (Staging) provisioned.
*   FOUND-4: Structured Logging & Configuration Management implemented.
*   FOUND-5: Backend CI/CD Pipeline configured and working.
*   FOUND-6: Testing Frameworks configured.
*   FOUND-8: Profiles Table & Basic RLS:
    *   `profiles` table schema defined and migrated.
    *   Basic RLS policies (`Allow individual read/update/insert`) implemented and **verified** via SQL Editor tests.
*   FOUND-9: Secure User Registration Endpoint:
    *   Backend endpoint `/api/auth/register` implemented using Express and `authService`.
    *   Successfully calls `supabase.auth.signUp`.
    *   Successfully creates a corresponding `profiles` table entry using the `service_role` client to bypass RLS.
    *   Functionality confirmed via Postman testing.
*   FOUND-10: Secure User Login Endpoint:
    *   Backend endpoint `/api/auth/login` implemented using Express and `authService`.
    *   Successfully calls `supabase.auth.signInWithPassword`.
    *   Returns JWT session/user data on success.
    *   Functionality confirmed via Postman testing.
*   Backend Configuration (`supabaseClient.ts`):
    *   Successfully loads credentials from GCP Secret Manager or local `.env`.
    *   Initializes both `anon` and `service_role` Supabase clients.

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Phase 1 (MVP):**
    *   User Management (AUTH-1 RLS refinement - Epic 3, Auth UI - Epic 2).
    *   Profile Management (View/Update - Epic 4).
    *   Basic Appointment Scheduling (Epic 2 tickets).
    *   Basic Provider Directory (Epic 2 tickets, Web SEO setup).
    *   Foundational Security/Compliance (Further RLS, Consent mechanism - Epic 3 tickets).
    *   Frontend integration for Auth/Profile.
*   **Phase 2 (Core Feature Expansion):**
    *   Health Records/Labs integration.
    *   Advanced Appointment features (reminders).
    *   Enhanced Directory (maps).
    *   Initial Reporting (non-sensitive).
    *   Basic Admin UI.
    *   Robust Application Encryption implementation.
    *   Solidified RLS policies for providers/relationships.
*   **Phase 3 (Advanced Features):**
    *   AI Health Assessment (low-risk).
    *   Pill/Menstrual Trackers.
    *   Full Inventory Management.
    *   Sensitive/Anonymized Reporting.
    *   Full Compliance posture hardening.
    *   Performance Tuning / Advanced SEO.

*(Refer to `Epic and Tickets Tracker.txt` or `epics_and_tickets.md` for detailed task breakdown)*

## Known Issues

*   Task Master AI `parse_prd` / `add_task` tools fail due to API key authentication error (Low Priority).
*   ~~Profile creation failed after registration due to schema mismatch (`consent_given`)~~ - **Resolved.**
*   ~~Profile creation failed after registration due to RLS violation~~ - **Resolved by using service_role client.**
*   ~~Supabase client initialization failed locally due to missing `SUPABASE_SERVICE_ROLE_KEY` in `.env`~~ - **Resolved.**

## Evolution of Project Decisions

*   Initial state: Decision made to proceed with Supabase + Google Cloud Run hybrid architecture based on Technical Spike findings.
*   Decision made to prioritize React Native CLI over Expo for long-term flexibility.
*   Decision made to recommend Redux Toolkit for state management due to complexity.
*   Decision made that application-level encryption (AES-256-GCM) is mandatory for SPI/PHI before storage in Supabase.
*   Decision made that SSR/SSG is required for public web pages.
*   Decision to handle auth via backend endpoints instead of direct frontend calls.
*   **Decision:** Use `service_role` Supabase client for server-side operations that need to bypass user RLS (e.g., profile creation post-signup). 
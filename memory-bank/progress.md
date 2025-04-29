# Progress: CarePoP/QueerCare

## Current Status

*   Project initialized.
*   Initial Memory Bank files created based on context documents (`PRD`, `Technical Spike`, `Brainstorming`, `Epic Tracker`).
*   Task Master AI tools encountered errors (API key issue), preventing automated task generation from PRD or Epic Tracker.

## What Works

*   Basic project structure exists (implicitly, via Memory Bank creation).
*   Core requirements and technical direction documented in Memory Bank.
*   FOUND-1: Initial project structure (`carepop-frontend`, `carepop-backend` folders, basic files, `.gitignore`) created.
*   FOUND-2: Basic Dev Env Setup:
    *   `package.json` initialized for frontend and backend.
    *   Core dependencies installed (React Native, Node, TS, Supabase client, dotenv).
    *   `tsconfig.json` configured for both.
    *   Basic run/dev/build scripts added.
    *   Backend Supabase client configured (`src/config/supabaseClient.ts`) reading from `.env`.
*   FOUND-3: Core Cloud Infrastructure (Staging):
    *   Supabase project (`carepop-staging`) provisioned.
    *   GCP project selected, APIs enabled (Cloud Run, Secret Manager, Logging).
    *   Placeholder Cloud Run service (`carepop-backend-staging`) created.
    *   Supabase credentials stored in GCP Secret Manager.
    *   Basic Cloud Logging confirmed.
*   FOUND-4: Structured Logging & Configuration Management:
    *   Added Winston for structured logging with Cloud Logging integration (`carepop-backend/src/utils/logger.ts`).
    *   Updated Supabase client config (`carepop-backend/src/config/supabaseClient.ts`) to load secrets from GCP Secret Manager (in GCP) or `.env` (local).
    *   Created basic backend entrypoint (`carepop-backend/src/server.ts`) demonstrating usage.
*   FOUND-5: Configure CI/CD Pipeline (Backend Part):
    *   Created `carepop-backend/Dockerfile` for containerization.
    *   Configured GCP Artifact Registry (`carepop-images`).
    *   Set up GitHub Actions Workload Identity Federation for GCP auth.
    *   Created `.github/workflows/deploy-backend-staging.yml` to build/push/deploy backend to Cloud Run on `main` branch pushes.
    *   **Successfully deployed to Cloud Run staging via CI/CD.**

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Phase 1 (MVP):**
    *   Core platform foundation (FOUND-6 Testing - Epic 1 tickets).
    *   User Management (Auth UI, Profile - Epic 1/2 tickets).
    *   Basic Appointment Scheduling (Epic 2 tickets).
    *   Basic Provider Directory (Epic 2 tickets, Web SEO setup).
    *   Foundational Security/Compliance (Consent mechanism, initial RLS - Epic 3 tickets).
*   **Phase 2 (Core Feature Expansion):**
    *   Health Records/Labs integration.
    *   Advanced Appointment features (reminders).
    *   Enhanced Directory (maps).
    *   Initial Reporting (non-sensitive).
    *   Basic Admin UI.
    *   Robust Application Encryption implementation.
    *   Solidified RLS policies.
*   **Phase 3 (Advanced Features):**
    *   AI Health Assessment (low-risk).
    *   Pill/Menstrual Trackers.
    *   Full Inventory Management.
    *   Sensitive/Anonymized Reporting.
    *   Full Compliance posture hardening.
    *   Performance Tuning / Advanced SEO.

*(Refer to `Epic and Tickets Tracker.txt` for detailed task breakdown)*

## Known Issues

*   Task Master AI `parse_prd` tool fails due to API key authentication error.
*   Task Master AI `add_task` tool fails because `tasks.json` doesn't exist (due to `parse_prd` failure).

## Evolution of Project Decisions

*   Initial state: Decision made to proceed with Supabase + Google Cloud Run hybrid architecture based on Technical Spike findings.
*   Decision made to prioritize React Native CLI over Expo for long-term flexibility.
*   Decision made to recommend Redux Toolkit for state management due to complexity.
*   Decision made that application-level encryption (AES-256-GCM) is mandatory for SPI/PHI before storage in Supabase.
*   Decision made that SSR/SSG is required for public web pages. 
# CarePoP Backend Rebuild Plan

**Objective:** To document the final decisions, architecture, and plan for the CarePoP backend rebuild. This document serves as the high-level summary of the new backend's design. For granular implementation details and patterns, refer to `system_patterns.md`.

---

## 1. Core Architectural Decisions

*This section holds our foundational choices.*

-   **Framework:** Hono
-   **Database:** Supabase PostgreSQL (Retained)
-   **Authentication:** Supabase Auth (JWT-based, Retained)
-   **Deployment Platform:** Vercel
-   **Language:** TypeScript (Strict)
-   **Validation:** Zod

---

## 2. API Endpoint Plan

The backend follows a feature-based modular architecture. The full list of epics, tickets, and endpoints to be built is tracked in **`backend_tracker.md`**.

---

## 3. High-Level Folder Structure

The definitive, exhaustive folder structure blueprint is maintained in **`system_patterns.md`**.

---

## 4. Database Schema Notes

-   We will retain the existing Supabase database schema, tables, and RLS policies where possible.
-   All new schema changes **must** be managed via migration files in the `supabase/migrations/` directory. The `INV-MOD-001` ticket for inventory tables serves as the template for this process.

---

## 5. Frontend Refactoring Master Plan

**Guiding Principle:** To systematically replace the `carepop-web` frontend's data layer to use the new Hono backend, without altering the existing UI/UX. This eliminates the legacy data-fetching logic and ensures a clean, maintainable architecture.

The refactoring will be executed using a phased, module-by-module approach.

### Phase 1: Audit & Mapping
-   **Analyze:** Systematically audit the `carepop-web` application, module by module (e.g., Profiles, Appointments).
-   **Identify:** For each module, locate all files responsible for data fetching or mutation (Server Actions, client-side hooks, etc.).
-   **Map & Analyze Gap:** Map each identified data interaction to a required API endpoint in the Hono backend. This process creates a "Gap Analysis" that defines the list of backend endpoints that must be built or verified for each frontend module.

### Phase 2: Implementation (Module-by-Module)
-   **Backend-First:** For each module, the backend API endpoints are implemented and fully tested *before* any frontend code is changed.
-   **Frontend Refactor:** Once the backend API is stable, the corresponding frontend data-fetching logic is refactored to use the centralized `apiClient.ts` to call the new endpoints.

### Phase 3: Verification & Documentation
-   **Verify:** After a module is refactored, it is manually tested to ensure it functions identically to the user as it did before the change.
-   **Document:** The `backend_tracker.md` is updated to reflect the completion of the refactoring ticket for that module.

The `carepop-backend-new` project, built on Hono.js, has been successfully developed, tested, and deployed to a staging environment on Vercel.

**Current Status:**
-   **Deployment**: The backend is LIVE on Vercel.
-   **CI/CD**: A continuous integration and deployment pipeline is fully operational using GitHub Actions. Any push to the `main` branch will automatically run tests and deploy the latest version of the `carepop-backend-new` service.
-   **Authentication**: The core authentication module (`/register`, `/login`) and the user profile module (`/profiles`) are complete and have been tested.
-   **Frontend Integration**: The `carepop-web` application's login flow has been successfully pointed to the new live backend endpoints.

**Immediate Next Steps:**
The primary focus is now to continue the "Frontend Refactoring Master Plan". This involves methodically refactoring each module within the `carepop-web` application to replace direct Supabase SDK calls with API calls to our newly deployed backend service.

The next module to be refactored is **User Profiles**, followed by the remaining modules as outlined in the `backend_tracker.md`.
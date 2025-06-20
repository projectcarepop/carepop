# Backend Rebuild Initiative: Epics & Tickets

This tracker follows the plan outlined in `backend_rebuild_context.md`.

## Epic: B-REBUILD - Phased Backend Transition
*As the development team, we need to incrementally replace the old backend with the new `carepop-backend-new` (Hono) service and connect the `carepop-web` frontend to it, ensuring no loss of functionality.*

### [x] B-REBUILD-01: Setup New Hono Project
-   **Status**: `Done`
-   **Notes**: Initial project structure, dependencies, and local development server are created.

### [x] B-REBUILD-02: Implement Auth Module (Backend)
-   **Status**: `Done`
-   **Notes**: Register, login, and secure middleware are complete and fully tested.

### [x] B-REBUILD-03: Setup CI/CD for Backend
-   **Status**: `Done`
-   **Notes**: Successfully deployed to Vercel via a new GitHub Actions workflow. Automated tests are running in the pipeline.

### [x] B-REBUILD-04: Refactor Web: Auth Flow
-   **Status**: `Done`
-   **Notes**: `LoginClientPage` and `auth.actions` in `carepop-web` now use the new backend API for authentication. The end-to-end flow is working.

### [x] B-REBUILD-05: Implement Profile Module (Backend)
-   **Status**: `Done`
-   **Notes**: `GET /api/v1/profiles/me` and `PATCH /api/v1/profiles/me` are complete and tested.

### [ ] B-REBUILD-06: Refactor Web: Profile Flow
-   **Status**: `Not Started`
-   **Notes**: Next step is to point the frontend profile creation and dashboard pages to the new API endpoints.

### [ ] B-REBUILD-07: Implement X Module (Backend)
-   **Status**: `Not Started`
-   **Notes**: This is a placeholder for the next module in the refactoring plan (e.g., Clinics, Appointments).

### [ ] B-REBUILD-08: Refactor Web: X Flow
-   **Status**: `Not Started`
-   **Notes**: This is a placeholder for the frontend integration of the next module.

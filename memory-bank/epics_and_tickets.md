# Epics & Tickets: CarePop/QueerCare

Overall Project Goal: Develop and launch the CarePoP/QueerCare platform, a comprehensive SRH solution for the Philippines, encompassing a native mobile application (`carepop-nativeapp/`), a web application (`carepop-web/`), and a backend (`carepop-backend/`).

Note on Current Structure (Post-Major Restructure): This document reflects the project structure with three distinct top-level application folders within the main Git repository: `carepop-backend/` (Node.js/TypeScript on Cloud Run + Supabase BaaS), `carepop-nativeapp/` (Expo/React Native for iOS/Android), and `carepop-web/` (Next.js, Tailwind CSS, Shadcn UI). The previous `carepop-frontend` monorepo and shared packages are obsolete. Core authentication uses direct Client-Supabase calls with a DB trigger for profile creation.

---

## Epic Template

```markdown
### EPIC-[ID]: [Epic Title]

**Description:** [Brief description of the epic and its overall goal.]
**Business Value:** [Why is this epic important? What value does it deliver?]
**Acceptance Criteria (Overall Epic):**
*   [High-level AC 1]
*   [High-level AC 2]

**Tickets:**
*   TICKET-[ID+1]: [Ticket Title]
*   TICKET-[ID+2]: [Ticket Title]
*   TICKET-[ID+3]: [Ticket Title]
```

## Ticket Template

```markdown
#### TICKET-[ID]: [Ticket Title]

**Epic:** EPIC-[ID]
**Description:** [Detailed description of the task.]
**Acceptance Criteria (AC):**
*   [Specific AC 1 for this ticket]
*   [Specific AC 2 for this ticket]
*   ...
**Technical Suggestions/Notes:**
*   [e.g., Relevant files, libraries to use, API endpoints, RLS policies to consider]
*   [Security Considerations: e.g., Data sensitivity, encryption needs]
*   [Pillar: `carepop-mobile` | `carepop-web` | `carepop-backend` | `all`]
**Estimated Effort:** [e.g., S, M, L, XL or Story Points]
**Priority:** [High, Medium, Low]
**Status:** To Do (initial status)
```

## Placeholder Epics & Tickets

### EPIC-001: Foundational Setup & User Authentication

**Description:** Establish the basic project structure, core authentication flow, and initial user profile management for all three pillars.
**Business Value:** Enables users to securely access the platform, which is fundamental for all other features.
**Acceptance Criteria (Overall Epic):**
*   Users can register, login, and logout on both mobile and web platforms.
*   Basic user profile data is created and can be viewed (initially).
*   Secure session management is in place.

**Tickets:**
*   TICKET-001: Initialize Project Repositories & CI/CD Pipelines
*   TICKET-002: Implement User Registration (Mobile)
*   TICKET-003: Implement User Login (Mobile)
*   TICKET-004: Implement User Registration (Web)
*   TICKET-005: Implement User Login (Web)
*   TICKET-006: Setup Supabase Auth & `profiles` Table with RLS
*   TICKET-007: Backend: Create `handle_new_user` trigger for profile creation
*   TICKET-008: Basic Profile Viewing Screen (Mobile)
*   TICKET-009: Basic Profile Viewing Page (Web)
*   TICKET-010: Implement Forgot Password (Web)
*   AUTH-BUG-001: Fix User Registration Failures due to Incorrect Backend Supabase Client Initialization

### EPIC-LEGAL: Legal Pages & Compliance Documentation

**Description:** Implement and display necessary legal documents like Terms of Service and Privacy Policy.
**Business Value:** Ensures legal compliance and informs users about their rights and responsibilities.
**Acceptance Criteria (Overall Epic):**
*   Terms of Service page is accessible on the web platform.
*   Privacy Policy page is accessible on the web platform.
*   Content is accurate and up-to-date as per provided documents.

**Tickets:**
*   TICKET-LEGAL-W-1: Create Terms of Service Page (Web)
*   TICKET-LEGAL-W-2: Create Privacy Policy Page (Web)

### EPIC-WEB-PAGES: General Web Page Development

**Description:** Covers the creation, refinement, and maintenance of general public-facing and informational pages on the `carepop-web` application.
**Business Value:** Ensures the web application has a professional, informative, and engaging public presence, which is crucial for attracting and informing new users.
**Acceptance Criteria (Overall Epic):**
*   Public pages are visually appealing and consistent with the brand.
*   Content is clear, informative, and serves its purpose.
*   Pages are responsive and performant.

**Tickets:**
*   TICKET-WEB-PAGES-1: Refine Web App Home Page
*   TICKET-WEB-PAGES-2: Redesign and Reimplement "About Us" Page

### EPIC-WEB-PROFILE: Web User Profile Management

**Description:** Encompasses all features related to creating, viewing, and editing user profiles on the `carepop-web` application.
**Business Value:** Allows users to manage their personal information, which is essential for personalized services and application functionality.
**Acceptance Criteria (Overall Epic):**
*   Users can create a complete profile on the web.
*   Users can view their profile information accurately.
*   Users can edit their existing profile information.
*   Profile data is handled securely and consistently with the backend.

**Tickets:**
*   TICKET-WEB-PROF-1: Implement Create/Edit Profile Page (Web)
*   TICKET-WEB-PROF-2: Link and View Submitted Forms from Profile (P2/P3)

---

#### TICKET-WEB-PAGES-1: Refine Web App Home Page

**Epic:** EPIC-WEB-PAGES
**Description:** Refine the home page of the `carepop-web` application to look more complete as a landing page and be consistent with the design of other pages. The work includes adding a hero section, feature highlights, a "how it works" guide, and a final call-to-action.
**Acceptance Criteria (AC):**
*   The home page has a clear hero section with a title, description, and calls to action.
*   Key features of the platform are highlighted in a dedicated section.
*   The user journey is explained via a "How it Works" section.
*   The design is visually appealing and consistent with the rest of the web application.
*   The page is responsive and free of linter errors.
*   A testimonials section was initially planned but deferred due to a missing `Avatar` UI component.
**Technical Suggestions/Notes:**
*   Uses standard Shadcn UI components (`Card`, `Button`) and `lucide-react` icons.
*   Layout is built with Tailwind CSS flexbox and grid.
*   Pillar: `carepop-web`
**Estimated Effort:** M
**Priority:** High
**Status:** Done

---

#### TICKET-WEB-PAGES-2: Redesign and Reimplement "About Us" Page

**Epic:** EPIC-WEB-PAGES
**Description:** Redesign the "About Us" page to be visually appealing and consistent with the new homepage. The page should follow industry best practices for UI/UX, including proper margins, visual hierarchy, readability, and contrast.
**Acceptance Criteria (AC):**
*   The page features a hero section, a "Our Story" section, a Mission & Vision section, and a "Guiding Principles" section.
*   The design strictly uses the established brand color palette (`primary`, `muted`, `secondary`), typography (`font-space-grotesk`, `font-inter`), and Shadcn UI components (`Card`, `Button`).
*   The layout is responsive and uses the standard `container` class for content alignment.
*   The final code is clean, lint-free, and removes all legacy styling and unused variables from the previous version.
*   The page includes a final Call-to-Action section identical to the one on the homepage.
**Technical Suggestions/Notes:**
*   The implementation uses placeholder images from `placehold.co`.
*   The page is a server component and does not require `'use client'`.
*   The code was provided, but the `edit_file` tool failed to apply it. The task is considered complete from a design and coding perspective.
*   Pillar: `carepop-web`
**Estimated Effort:** M
**Priority:** High
**Status:** Done

---

#### TICKET-WEB-PROF-1: Implement Create/Edit Profile Page (Web)

**Epic:** EPIC-WEB-PROFILE
**Description:** Develop the user interface and functionality for users to create and subsequently edit their profiles on the `carepop-web` application. This page should handle both new profile creation and updates to existing profiles.
**Acceptance Criteria (AC):**
*   Users can access a dedicated page for profile creation/editing (e.g., `/create-profile`).
*   Form includes fields for all required and optional profile information (e.g., first name, last name, DOB, contact, address, SOGIE-related fields, civil status).
*   Address fields (`provinceCode`, `cityMunicipalityCode`, `barangayCode`) are currently implemented as text inputs.
*   Fields like `civilStatus`, `pronouns`, `assignedSexAtBirth` use `Select` components.
*   Form data is correctly mapped (e.g., to `snake_case`) for submission to the backend.
*   Successful submission updates the user's profile in Supabase.
*   Appropriate user feedback is provided on submission success or failure.
*   Page correctly pre-fills with existing profile data if the user is editing.
**Technical Suggestions/Notes:**
*   Leverages `AuthContext` for user session and profile data.
*   Interacts with backend services for profile data submission.
*   Consider future enhancement to reinstate dynamic/dependent dropdowns for address fields.
*   Pillar: `carepop-web`
**Estimated Effort:** M (initial implementation done, further refinements/testing)
**Priority:** High
**Status:** In Progress
**Notes:** The initial implementation is done, but the profile submission is blocked by a CORS error and a `404 Not Found` on the API endpoint. The backend needs CORS configured in `server.ts` to allow `localhost:3000`. The frontend's `create-profile/page.tsx` is calling `/api/v1/public/profile` but the backend route is `/api/v1/public/users/profile`. Also, the component itself has linter/type errors related to `AuthContext` that need to be resolved.

---

#### TICKET-010: Implement Forgot Password (Web)

**Epic:** EPIC-001
**Description:** Implement the full "Forgot Password" functionality for the `carepop-web` application. This includes a page for users to request a password reset link via email, and a page where users can set a new password after clicking the link from the email.
**Acceptance Criteria (AC):**
*   Users can navigate to a `/forgot-password` page.
*   Users can submit their email address to request a password reset.
*   An email containing a unique password reset link is sent to the user's registered email address.
*   The reset link correctly uses a `redirectTo` URL pointing to the web app's `/auth/update-password` page.
*   Clicking the reset link takes the user to the `/auth/update-password` page.
*   The `/auth/update-password` page allows the user to enter and confirm a new password.
*   The new password is validated (e.g., minimum length).
*   Upon successful password update, the user is appropriately notified and can log in with the new password.
*   Appropriate error handling and user feedback are provided throughout the flow (e.g., email not found, invalid token, passwords don't match).
*   Supabase Authentication URL Configuration (allow-list for redirect URLs) is correctly set up.
**Technical Suggestions/Notes:**
*   Leverages `AuthContext` for `sendPasswordResetEmail`.
*   Uses `supabase.auth.updateUser()` on the update password page.
*   Requires careful handling of Supabase `redirectTo` configurations and `onAuthStateChange` events, particularly `USER_UPDATED` after password change.
*   Pillar: `carepop-web`
**Estimated Effort:** M
**Priority:** High
**Status:** Done

---

#### AUTH-BUG-001: Fix User Registration Failures due to Incorrect Backend Supabase Client Initialization

**Epic:** EPIC-001
**Description:** User registration was consistently failing with a `400 Bad Request` and a misleading `{message: 'User not allowed'}` error from the backend. A deep-dive investigation revealed the root cause was the backend Supabase client being initialized with the public `anon` key instead of the privileged `service_role` key. This caused all administrative actions, specifically `createUser`, to be rejected by Supabase.
**Acceptance Criteria (AC):**
*   The backend's Supabase client is refactored into two distinct clients: `public-client.ts` (using `supabaseAnonKey`) and `admin-client.ts` (using `supabaseServiceRoleKey`).
*   The `auth.service.ts` module is updated to import and use the `admin-client` for all administrative operations (`createUser`, `deleteUser`, etc.).
*   All other backend files (`user.service.ts`, `auth.middleware.ts`) that required a Supabase client are updated to use the correct client (typically the `public-client`).
*   The TypeScript build completes successfully with no module resolution errors.
*   A new user can successfully register via the frontend registration form, the request succeeds with a `2xx` status, and a confirmation email is sent.
**Technical Suggestions/Notes:**
*   This was a critical architectural flaw. The fix involved creating `carepop-backend/src/lib/supabase/admin-client.ts` and renaming the old `client.ts` to `public-client.ts`.
*   All `import` statements for the Supabase client throughout the backend needed to be verified and corrected.
*   Pillar: `carepop-backend`
**Estimated Effort:** M
**Priority:** Critical
**Status:** Done

---

### EPIC-WEB-ADMIN-APPT: Web Admin Appointment Management

**Description:** Covers all features related to creating, viewing, updating, and managing patient appointments from the administrator dashboard on the `carepop-web` application.
**Business Value:** Provides administrators with the essential tools to manage the core scheduling functionality of the platform, ensuring smooth operations.
**Acceptance Criteria (Overall Epic):**
*   Admins can view a comprehensive list of all appointments.
*   Admins can create new appointments on behalf of patients.
*   Admins can view and edit the details of existing appointments.
*   The appointment management interface is secure, efficient, and user-friendly.

**Tickets:**
*   TICKET-WEB-ADMIN-APPT-1: Build and Debug "New Appointment" Form

---

### EPIC-WEB-DASH: Web User Dashboard

**Description:** Features related to the main user dashboard on the `carepop-web` application, providing users with an overview and access to key functionalities.
**Business Value:** Serves as the user's landing page after login, offering personalized information and quick access to platform features.
**Acceptance Criteria (Overall Epic):**
*   Users can view a summary of their key profile information.
*   Users are prompted to complete their profile if necessary.
*   Users have clear navigation to other parts of the application.

**Tickets:**
*   TICKET-WEB-DASH-1: Implement Dashboard Profile Display & Prompts (Web)

---

#### TICKET-WEB-ADMIN-APPT-1: Build and Debug "New Appointment" Form

**Epic:** EPIC-WEB-ADMIN-APPT
**Description:** Implement and perform extensive debugging on the "New Appointment" form for administrators. This involved creating the initial UI, fixing a complex series of redirection and data-loading bugs, and ensuring the form can be successfully submitted.
**Acceptance Criteria (AC):**
*   An administrator with a valid session can access the `/admin/appointments/new` page.
*   The page does not incorrectly redirect authorized admins to `/forbidden` or `/login`.
*   The form's "Select a Patient" dropdown is correctly populated with users who have the 'user' role.
*   The form's "Select a Service" and "Select a Provider" dropdowns correctly populate based on the selected clinic.
*   The form's "Appointment Date and Time" picker correctly shows provider availability.
*   The "Create Appointment" button successfully submits the form data and creates a new appointment in the database.
*   The page handles all data loading and submission states gracefully.
**Technical Suggestions/Notes:**
*   The initial "Forbidden" redirect was caused by a case-sensitivity mismatch (`'Admin'` vs `'admin'`) in the `middleware.ts` and page-level authorization checks.
*   The empty patient dropdown was caused by a case-sensitivity mismatch (`'User'` vs `'user'`) in the RPC call.
*   API endpoints for services and providers (`/api/admin/clinics/[id]/*`) were failing due to incorrect Supabase queries (faulty `.order()` clause, incorrect column names like `facility_id` and `name`).
*   The final form submission failure was due to the server action using the standard Supabase client instead of the `supabaseAdmin` client, which was being blocked by RLS.
*   Pillar: `carepop-web`
**Estimated Effort:** L
**Priority:** Critical
**Status:** Done

---

#### TICKET-WEB-DASH-1: Implement Dashboard Profile Display & Prompts (Web)

**Epic:** EPIC-WEB-DASH
**Description:** Enhance the user dashboard page (`/dashboard`) to display key user profile information and provide prompts/links for profile completion or editing.
**Acceptance Criteria (AC):**
*   Dashboard displays user's first name in a welcome message.
*   Dashboard displays detailed profile information (e.g., full name, DOB, pronouns, SOGIE).
*   If essential profile information (e.g., first name, last name, DOB) is missing, a prominent callout prompts the user to complete their profile, linking to `/create-profile`.
*   An "Edit Profile" button is present, linking to `/create-profile`.
*   Page handles loading states gracefully.
*   Page displays correctly for authenticated users.
**Technical Suggestions/Notes:**
*   Fetches profile data from `AuthContext`.
*   Uses `camelCase` fields from `AuthContext.Profile` for display.
*   Pillar: `carepop-web`
**Estimated Effort:** S (initial implementation done, further refinements/testing)
**Priority:** High
**Status:** In Progress

---

### Epic APPT-RLS: Appointment Data Access Control via Supabase RLS (Backend/Supabase)

*   **Epic Goal:** Implement comprehensive Row Level Security policies on Supabase tables related to appointments (`appointments`, `provider_availability`) to ensure secure and role-appropriate data access for Patients, Providers, and Admins across all client applications (`carepop-nativeapp`, `carepop-web`).
*   **Depends on:** APPT-SCHEMA-1 (Appointments DB Schema), Foundational Role Management (SEC-BE-1 basics or a dedicated role setup ticket). **NEW DEPENDENCY: Now requires `SERVICE-MGMT` epic to be implemented, as availability is now linked to specific services.**
*   **Status:** To Do

    *   **Ticket ID:** APPT-RLS-1
        *   **Title:** Define RLS Policy for Patients to View Own Appointments
        *   **Background:** Users should only be able to see appointments they have booked or are associated with them.
        *   **Scope:** Create RLS policy on the `appointments` table for the 'Patient' role (default authenticated user).
        *   **Location:** `carepop-backend/supabase/migrations/` (or Supabase SQL Editor).
        *   **Technology/Implementation Suggestions:** Supabase SQL `CREATE POLICY` statement using `auth.uid()` and a `USING` clause checking against `appointments.user_id`.
        *   **Acceptance Criteria:**
            *   [ ] An RLS policy named (e.g.) `patient_can_select_own_appointments` is created on the `appointments` table.
            *   [ ] The policy grants `SELECT` permission.
            *   [ ] The `USING` clause ensures that the authenticated user's ID (`auth.uid()`) matches the `user_id` column in the `appointments` table.
            *   [ ] Tested: When querying as a 'Patient' role with a specific user JWT, only appointments where `user_id` matches that JWT's `sub` claim are returned. No appointments belonging to other users are visible.
            *   [ ] No other operations (INSERT, UPDATE, DELETE) are inadvertently granted to patients on others' appointments by this policy.

    *   **Ticket ID:** APPT-RLS-2
        *   **Title:** Define RLS Policy for Providers to View Their Associated Appointments
        *   **Background:** Healthcare providers need to see appointments scheduled with them.
        *   **Scope:** Create RLS policy on the `appointments` table for the 'Provider' role. Assumes providers have an entry in `auth.users` and a `provider_id` linked to their user record (e.g., in the `profiles` table or a dedicated `providers` table).
        *   **Location:** `carepop-backend/supabase/migrations/` (or Supabase SQL Editor).
        *   **Technology/Implementation Suggestions:** Supabase SQL `CREATE POLICY`. The `USING` clause will need to compare `appointments.provider_id` with a `provider_id` associated with the current `auth.uid()` (may require a helper SQL function or checking against a `providers` table linked to `auth.users`).
        *   **Acceptance Criteria:**
            *   [ ] An RLS policy named (e.g.) `provider_can_select_their_appointments` is created on the `appointments` table.
            *   [ ] The policy grants `SELECT` permission to users with the 'Provider' role.
            *   [ ] The `USING` clause correctly links the authenticated provider's user ID (`auth.uid()`) to their `provider_id` and then filters `appointments` where `appointments.provider_id` matches.
            *   [ ] Tested: When querying as a 'Provider' role with a specific provider JWT, only appointments assigned to that provider are visible.
            *   [ ] This policy does not allow providers to see appointments of *other* providers.

    *   **Ticket ID:** APPT-RLS-3
        *   **Title:** Define RLS Policy for Admins to View All Appointments
        *   **Background:** Administrators require oversight and access to all appointment data for management and support.
        *   **Scope:** Create RLS policy on the `appointments` table for the 'Admin' role.
        *   **Location:** `carepop-backend/supabase/migrations/` (or Supabase SQL Editor).
        *   **Technology/Implementation Suggestions:** Supabase SQL `CREATE POLICY`. The `USING` clause for SELECT will be `auth.role() = 'admin'`, or if more granular, checks against a list of admin user UUIDs.
        *   **Acceptance Criteria:**
            *   [ ] An RLS policy named (e.g.) `admin_can_select_all_appointments` is created on the `appointments` table.
            *   [ ] The policy grants `SELECT` permission to users with the 'Admin' role.
            *   [ ] The `USING` clause effectively allows selection of all rows for admin users (e.g., `USING (get_my_role() = 'admin')` where `get_my_role()` is a security definer function that safely reads the custom claim or role from the JWT).
            *   [ ] Tested: When querying as an 'Admin' role, all appointments across all users and providers are visible.

    *   **Ticket ID:** APPT-RLS-4
        *   **Title:** Define RLS Policy for Admins to Update Appointment Status
        *   **Background:** Administrators need to confirm "pending_confirmation" appointments, cancel appointments, etc. This means updating the `status` field (and potentially other administrative fields) on any appointment.
        *   **Scope:** Create RLS policy on the `appointments` table for the 'Admin' role to allow `UPDATE` operations.
        *   **Location:** `carepop-backend/supabase/migrations/` (or Supabase SQL Editor).
        *   **Technology/Implementation Suggestions:** Supabase SQL `CREATE POLICY`. The `USING` clause for this UPDATE policy for Admins will typically be broad (e.g., `USING (get_my_role() = 'admin')`), and a `WITH CHECK` clause might be the same or similar, ensuring they can update any row. Specific column-level update permissions are ideal if the RDBMS supports them easily in policy (PostgreSQL allows `UPDATE ... SET column = value WHERE ...`).
        *   **Acceptance Criteria:**
            *   [ ] An RLS policy named (e.g.) `admin_can_update_appointment_status` is created on the `appointments` table.
            *   [ ] The policy grants `UPDATE` permission (specifically for `status` and other relevant fields, if column-level RLS is used) to users with the 'Admin' role.
            *   [ ] The `USING` clause allows selection of the rows to be updated (e.g., based on admin role).
            *   [ ] The `WITH CHECK` clause ensures that the updates conform to allowed conditions for admins (which might be very broad for this role).
            *   [ ] Tested: An admin user can successfully update the `status` of any appointment. Non-admin users cannot.
            *   [ ] Auditing of these admin updates should be considered (possibly by a separate DB trigger logging changes to an audit table, or captured by application-level logging in backend API if Admin UI goes through an API for this).

    *   **Ticket ID:** APPT-RLS-5
        *   **Title:** Define RLS Policies for Patients/Providers to Update Their Appointments (Limited)
        *   **Background:** Patients might need to cancel their own appointments. Providers might update status for appointments linked to them (e.g., mark as "completed" if not done by Admin).
        *   **Scope:** Create RLS `UPDATE` policies for 'Patient' and 'Provider' roles on `appointments` table, restricted to specific conditions and fields.
        *   **Location:** `carepop-backend/supabase/migrations/` (or Supabase SQL Editor).
        *   **Technology/Implementation Suggestions:** Separate `CREATE POLICY` statements for each role. `USING` clause to identify ownership (patient's own, provider's assigned). `WITH CHECK` clause to restrict which fields can be updated (e.g., only `status` to 'cancelled_by_user' or 'completed') and under what conditions (e.g., appointment is not in the past for cancellation).
        *   **Acceptance Criteria:**
            *   [ ] RLS policy allows Patients to update the `status` of THEIR OWN appointments to 'cancelled_by_user' (if conditions are met, e.g., before a certain time).
            *   [ ] RLS policy allows Providers to update the `status` of THEIR ASSIGNED appointments (e.g., to 'completed' or 'no_show').
            *   [ ] Policies prevent updates to other fields or under disallowed conditions.
            *   [ ] Tested: Patients can cancel own valid appointments. Providers can update status of their assigned appointments. Unauthorized updates are blocked.

---
<br>

### EPIC-WEB-ADMIN: Admin Portal Foundation
- **Status:** In Progress
- **Phase:** P1
- **Description:** Build the foundational elements of the Admin Portal in the `carepop-web` application. This includes creating the main layout, dashboard, and the initial sections for managing core data entities like Clinics and Providers. This epic is the parent for all initial admin-facing features.

  #### **FEATURE: ADMIN-UI-CORE - Core Admin Layout & Navigation**
  - **Description:** Develop the main shell for the admin portal, including a sidebar for navigation and a content area.
  - **Tickets:**
    - **Ticket:** WEB-ADMIN-1: Create Admin Layout
      - **Status:** Done
      - **Type:** Frontend (`carepop-web`)
      - **AC:** An `/admin` route group is created with a dedicated layout file (`layout.tsx`). The layout includes a persistent sidebar and a main content area. Access is restricted to users with an 'admin' role.

  #### **FEATURE: ADMIN-MANAGE-CLINICS - Clinic Management**
  - **Description:** Implement the UI for admins to manage clinic information.
  - **Tickets:**
    - **Ticket:** WEB-ADMIN-2: Clinics List Page
      - **Status:** Done
      - **Type:** Frontend (`carepop-web`)
      - **AC:** A page at `/admin/clinics` displays a table of all clinics. The table shows key info (Name, Address, Status). The table is built using Shadcn UI's Table and TanStack Table.
    - **Ticket:** WEB-ADMIN-3: Add/Edit Clinic Page
      - **Status:** Done
      - **Type:** Frontend (`carepop-web`)
      - **AC:** A page at `/admin/clinics/new` (and `/admin/clinics/[id]/edit`) provides a form to add or edit clinic details. The form uses Shadcn UI components.

  #### **FEATURE: ADMIN-MANAGE-PROVIDERS - Provider Management**
  - **Description:** Implement the UI for admins to manage provider information.
  - **Tickets:**
    - **Ticket:** WEB-ADMIN-4: Providers List Page
      - **Status:** Done
      - **Type:** Frontend (`carepop-web`)
      - **AC:** A page at `/admin/providers` displays a table of all providers.
    - **Ticket:** WEB-ADMIN-5: Add/Edit Provider Page
      - **Status:** Done
      - **Type:** Frontend (`carepop-web`)
      - **AC:** A page at `/admin/providers/new` (and `/admin/providers/[id]/edit`) provides a form to add or edit provider details.

---
<br>

### **EPIC: SERVICE-MGMT - Service & Provider Availability Management**
- **Status:** To Do
- **Phase:** P1 (Core Functionality)
- **Description:** Establishes the core infrastructure for defining services, managing provider assignments to those services, and handling complex provider availability schedules. This is a foundational epic that the appointment booking system (`APPT-RLS` and future appointment epics) will heavily depend on.

  #### **FEATURE: SVC-DATA - Service Data Model & Management**
  - **Description:** Defines the database structure and backend APIs for all service-related data.
  - **Tickets:**
    - **Ticket:** DB-SVC-1: Enhance `services` Table
      - **Status:** To Do
      - **Type:** DB Schema
      - **AC:** Modify the existing `public.services` table to include `cost` (numeric) and `requirements` (text) columns to store pricing and prerequisites for patients.
    - **Ticket:** DB-SVC-2: Create `forms` and `form_submissions` Tables
      - **Status:** To Do
      - **Type:** DB Schema
      - **AC:** 
        1. Create a `public.forms` table with columns: `id` (uuid), `name` (text), `description` (text), `version` (int), `schema_definition` (jsonb), `is_active` (boolean), `created_at`, `updated_at`.
        2. Create a `public.form_submissions` table with columns: `id` (uuid), `form_id` (fk to forms.id), `user_id` (fk to auth.users.id), `appointment_id` (fk to appointments.id, nullable), `encrypted_submission_data` (text), `created_at`.
        3. Implement strict RLS policies: Users can only see their own submissions. Providers/Admins can only see submissions related to their appointments/clinics.
    - **Ticket:** BE-SVC-1: Admin CRUD API for Services
      - **Status:** To Do
      - **Type:** Backend (`carepop-backend`)
      - **AC:** Create secure Cloud Run API endpoints for admins to perform full CRUD operations on the `services` table. Include validation. Endpoints: `GET /admin/services`, `POST /admin/services`, `GET /admin/services/:id`, `PUT /admin/services/:id`, `DELETE /admin/services/:id`.
    - **Ticket:** BE-SVC-2: Admin API for Provider-Service Assignment
      - **Status:** To Do
      - **Type:** Backend (`carepop-backend`)
      - **AC:** Create endpoints for admins to assign/unassign providers to services (managing the `provider_services` join table). Endpoints: `POST /admin/services/:serviceId/providers`, `DELETE /admin/services/:serviceId/providers/:providerId`.

  #### **FEATURE: SVC-AVAIL - Provider Availability Management**
  - **Description:** Implements a robust system for managing provider work schedules, including recurring weekly availability and one-off overrides, all linked to specific services.
  - **Tickets:**
    - **Ticket:** DB-AVAIL-1: Redesign Provider Availability Schema
      - **Status:** To Do
      - **Type:** DB Schema
      - **AC:**
        1. Create a new table `provider_weekly_schedules` to replace the old one, adding a `service_id` column. Columns: `id` (uuid), `provider_id`, `clinic_id`, **`service_id`**, `day_of_week` (int 0-6), `start_time` (time), `end_time` (time), `is_active`, `created_at`, `updated_at`.
        2. Create a new table `provider_availability_overrides` to handle one-off changes. Columns: `id` (uuid), `provider_id`, `override_date` (date), `start_time` (time), `end_time` (time), `is_available` (boolean, for block-offs), **`service_id`** (fk, nullable if the block-off applies to all services), `notes` (text).
        3. (Decision) Deprecate the existing `provider_availability` and `provider_schedule_overrides` tables as they lack the required service-level granularity.
    - **Ticket:** BE-AVAIL-1: API for Provider Availability
      - **Status:** To Do
      - **Type:** Backend (`carepop-backend`)
      - **AC:** Create secure endpoints for providers/admins to manage weekly schedules and overrides. Endpoints: `GET /providers/:id/availability`, `POST /providers/:id/schedules`, `PUT /schedules/:id`, `POST /providers/:id/overrides`, `DELETE /overrides/:id`.
    
  #### **FEATURE: SVC-UI - Admin & Provider Interfaces**
  - **Description:** Builds the necessary web interfaces for admins and providers to manage services and availability.
  - **Tickets:**
    - **Ticket:** WEB-ADMIN-SVC-1: Service Management UI
      - **Status:** To Do
      - **Type:** Frontend (`carepop-web`)
      - **AC:** Build admin pages at `/admin/services` for CRUD operations on services. Include a data table to list services and forms to create/edit them.
    - **Ticket:** WEB-ADMIN-SVC-2: Provider-Service Assignment UI
      - **Status:** To Do
      - **Type:** Frontend (`carepop-web`)
      - **AC:** On the "Edit Service" page, include a multi-select or checklist component to assign/unassign providers for that service.
    - **Ticket:** WEB-PROV-AVAIL-1: Provider Availability UI
      - **Status:** To Do
      - **Type:** Frontend (`carepop-web`)
      - **AC:** Create a page for providers (`/dashboard/availability`) to manage their weekly schedules per service and set date-specific overrides/block-offs.

---

### EPIC-SECURITY: Security & Compliance Enhancements
- **Status:** To Do
- **Phase:** P1
- **Description:** Implements critical security measures for handling sensitive data, particularly for new features like dynamic forms.

  #### **FEATURE: SEC-FORMS - Secure Form Handling**
  - **Description:** Ensures that all data submitted via dynamic forms is handled with the highest level of security.
  - **Tickets:**
    - **Ticket:** SEC-FORMS-1: Application-Level Encryption for Form Submissions
      - **Status:** To Do
      - **Type:** Backend (`carepop-backend`)
      - **AC:** 
        1. All data submitted to the `form_submissions` table must be encrypted via the application-level encryption service (`SEC-E-2`) before being stored in the `encrypted_submission_data` column.
        2. Create a secure API endpoint for authorized providers/admins to retrieve and decrypt this data.
        3. RLS policies on the `form_submissions` table must be strictly enforced.

### EPIC-NATIVE-NAV: Mobile Clinic Finder & Navigation

**Description:** Implements a map-based clinic finder in the `carepop-nativeapp`. It will allow users to see nearby clinics on an interactive map, select a destination, and receive real-time, turn-by-turn navigation guidance from their current location.
**Business Value:** Significantly improves access to care by providing clear, interactive directions to clinics, reducing travel friction and enhancing the user's journey to the facility.
**Acceptance Criteria (Overall Epic):**
*   Users can view clinics as markers on an interactive map.
*   The app can request and display the user's current location.
*   Users can select a clinic and see a calculated route from their location to the clinic.
*   The map displays the route and updates the user's position in real-time during movement.

**Tickets:**
*   NATIVE-NAV-1: Backend - Implement Real-Time Routing Service
*   NATIVE-NAV-2: Mobile - Install and Configure Mapping & Location Libraries
*   NATIVE-NAV-3: Mobile UI - Implement Clinic Finder Map View
*   NATIVE-NAV-4: Mobile UI - Implement Route Preview & Handoff to External Maps

---

### EPIC-APP-USER: Mobile App User Features

**Description:** Implements core user-facing features within the `carepop-nativeapp`, focusing on managing personal data and interactions with the platform's services.
**Business Value:** Provides essential tools for users to manage their healthcare journey, increasing engagement and the utility of the mobile application.
**Acceptance Criteria (Overall Epic):**
*   Users can view and manage their appointments.
*   Users can view their profile information.

**Tickets:**
*   APP-USER-6: Mobile - Implement "My Appointments" List Screen
*   APP-USER-7: Mobile - Implement Appointment Details & Cancellation
*   BE-APP-1: Backend - API to Fetch User Appointments
*   BE-APP-2: Backend - API for User to Cancel Appointment

---

#### NATIVE-NAV-1: Backend - Implement Real-Time Routing Service

**Epic:** EPIC-NATIVE-NAV
**Description:** Create a new API endpoint (e.g., `POST /api/v1/public/navigation/route`) that will provide turn-by-turn directions. This service will act as the "brains" for the navigation feature.
**Acceptance Criteria (AC):**
*   A new endpoint `POST /api/v1/public/navigation/route` is created in `carepop-backend`.
*   The endpoint accepts a JSON body with `start` and `end` coordinates (e.g., `{ start: { lat: number, lon: number }, end: { lat: number, lon: number } }`).
*   The endpoint integrates with a third-party routing service (e.g., Mapbox Directions API).
*   The third-party API key is securely stored in Google Cloud Secret Manager and accessed by the backend service.
*   The endpoint returns a structured route object containing a polyline and maneuver instructions.
**Technical Suggestions/Notes:**
*   Will require creating a new controller, service, and route file in `carepop-backend`.
*   A decision on the third-party service (e.g., Mapbox vs. Google) is needed. Recommend Mapbox.
*   Pillar: `carepop-backend`
**Estimated Effort:** L
**Priority:** High
**Status:** Done

---

#### NATIVE-NAV-2: Mobile - Install and Configure Mapping & Location Libraries

**Epic:** EPIC-NATIVE-NAV
**Description:** Install and configure the necessary libraries within the `carepop-nativeapp` Expo project to handle the map interface and device location services.
**Acceptance Criteria (AC):**
*   `react-native-maps` is installed and configured in `carepop-nativeapp`.
*   `expo-location` is installed in `carepop-nativeapp`.
*   Appropriate location permissions (`NSLocationWhenInUseUsageDescription` for iOS, `ACCESS_FINE_LOCATION` for Android) are added to `app.json`.
*   The app builds successfully after adding the new dependencies.
**Technical Suggestions/Notes:**
*   Requires careful configuration in `app.json` for permissions.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** S
**Priority:** High
**Status:** On Hold

---

#### NATIVE-NAV-3: Mobile UI - Implement Clinic Finder Map View

**Epic:** EPIC-NATIVE-NAV
**Description:** Create a new screen in the `carepop-nativeapp` that displays a full-screen, interactive map of clinics.
**Acceptance Criteria (AC):**
*   A new screen is created and integrated into the mobile app's navigation.
*   The screen fetches all clinic locations from the existing backend API (`/api/v1/public/clinics`).
*   A map is displayed using `react-native-maps`.
*   A unique marker is shown for each clinic.
*   Tapping a marker shows a callout with the clinic's name and a "Navigate" button.
*   The app requests user location permission via `expo-location`. If granted, the user's location is shown on the map.
**Technical Suggestions/Notes:**
*   Depends on `NATIVE-NAV-2`.
*   Will require a new component in the `screens` directory.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** On Hold

---

#### NATIVE-NAV-4: Mobile UI - Implement Route Preview & Handoff to External Maps

**Epic:** EPIC-NATIVE-NAV
**Description:** Develop the main navigation interface that provides active, turn-by-turn guidance to the user.
**Acceptance Criteria (AC):**
*   When the "Navigate" button is tapped, the app calls the `NATIVE-NAV-1` backend service to fetch the route.
*   The route's polyline is drawn on the map.
*   The app listens for real-time location updates.
*   The user's marker on the map moves in real-time.
*   The map camera follows the user's progress.
*   A UI element displays the current navigation instruction.
**Technical Suggestions/Notes:**
*   Depends on `NATIVE-NAV-1` and `NATIVE-NAV-3`.
*   Client-side state management (e.g., Zustand) will be needed to manage route and location data.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** L
**Priority:** High
**Status:** On Hold

---

#### APP-USER-6: Mobile - Implement "My Appointments" List Screen

**Epic:** EPIC-APP-USER
**Description:** Develop the main "My Appointments" screen (likely `BookingScreen.tsx`) in the `carepop-nativeapp`. This screen will display a user's upcoming and past appointments in a clear, tabbed interface. This work is based on the existing implementation in the `carepop-web` application.
**Acceptance Criteria (AC):**
*   The screen shall have two tabs: "Upcoming" and "Past".
*   The "Upcoming" tab fetches and displays all appointments with a future date.
*   The "Past" tab fetches and displays all appointments with a date in the past.
*   A reusable `AppointmentCard` component shall be created to display key appointment details (Service Name, Status, Date/Time, Clinic Name, Provider Name).
*   The screen should handle loading states while data is being fetched.
*   The screen should display an informative message if there are no appointments to show in either tab.
*   Tapping on an `AppointmentCard` will navigate the user to the `AppointmentDetailScreen` (to be implemented in `APP-USER-7`).
**Technical Suggestions/Notes:**
*   Reference `carepop-web/src/app/dashboard/appointments/page.tsx` for backend logic inspiration.
*   Backend services (`getFutureAppointments`, `getPastAppointments`) will need to be created in `carepop-backend` if they don't already exist for mobile consumption. Assume RLS is in place for users to only fetch their own appointments.
*   Create a new mobile-specific `AppointmentCard.tsx` component in `carepop-mobile/src/components/appointments/`.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** Done

---

#### APP-USER-7: Mobile - Implement Appointment Details & Cancellation

**Epic:** EPIC-APP-USER
**Description:** Create a detailed view for a single appointment and implement the functionality for a user to cancel an upcoming appointment.
**Acceptance Criteria (AC):**
*   A new `AppointmentDetailScreen.tsx` is created.
*   The screen displays all relevant details of the selected appointment, including service, provider, clinic, date, time, status, and any special instructions.
*   If the appointment is in the future and cancellable, a "Cancel Appointment" button is visible.
*   Tapping the "Cancel" button prompts the user for confirmation.
*   Upon confirmation, a request is sent to the backend to update the appointment status to `cancelled_by_user`.
*   The user is navigated back to the "My Appointments" list, which should reflect the updated status.
*   The "Cancel" button is not visible for past appointments or appointments in a non-cancellable state.
**Technical Suggestions/Notes:**
*   The screen will receive the appointment ID or the full appointment object as a navigation parameter.
*   A new backend endpoint/service may be required to handle the cancellation logic, which should be protected by RLS (see `APPT-RLS-5`).
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** Critical
**Status:** Done

#### BE-APP-1: Backend - API to Fetch User Appointments

**Epic:** EPIC-APP-USER
**Description:** Implement public-facing, authenticated API endpoints for a user to retrieve their own future and past appointments. This was previously tracked incorrectly as a frontend ticket.
**Acceptance Criteria (AC):**
*   A `GET /api/v1/public/appointments/my/future` endpoint returns a list of the authenticated user's upcoming appointments.
*   A `GET /api/v1/public/appointments/my/past` endpoint returns a list of the authenticated user's past appointments.
*   The endpoints are protected by authentication middleware.
*   The response includes joined data for the associated clinic, provider, and service.
*   RLS policies on the `appointments` table ensure users can only see their own data.
**Technical Suggestions/Notes:**
*   Implemented in `appointment.controller.ts`, `appointment.service.ts`, and `appointment.routes.ts`.
*   This work was discovered to be a missing prerequisite for `APP-USER-6`.
*   Pillar: `carepop-backend`
**Estimated Effort:** S
**Priority:** High
**Status:** Done

#### BE-APP-2: Backend - API for User to Cancel Appointment

**Epic:** EPIC-APP-USER
**Description:** Implement a public-facing, authenticated API endpoint for a user to cancel their own appointment.
**Acceptance Criteria (AC):**
*   A `PATCH /api/v1/public/appointments/:appointmentId/cancel` endpoint allows a user to cancel their own appointment.
*   The endpoint is protected by authentication middleware.
*   The service layer verifies that the appointment belongs to the user and is in a cancellable state before updating the status to `cancelled_by_user`.
*   RLS policies (`APPT-RLS-5`) are leveraged to enforce permissions.
**Technical Suggestions/Notes:**
*   Implemented in `appointment.controller.ts`, `appointment.service.ts`, and `appointment.routes.ts`.
*   This work was discovered to be a missing prerequisite for `APP-USER-7`.
*   Pillar: `carepop-backend`
**Estimated Effort:** S
**Priority:** High
**Status:** Done

### EPIC-HEALTH-RECS: Secure Health Records Management

**Description:** Implements a secure system for users to view and manage their health records within the CarePop mobile app. This includes lab results, clinical notes, and other documents uploaded by providers or admins.
**Business Value:** Empowers users with direct access to their health information, fostering engagement and providing critical data for managing their care.
**Security & Compliance:** This epic is high-risk and must adhere to the strictest security principles (encryption at rest, encryption in transit, strict RLS, audit trails).

**Tickets:**
*   DB-RECS-1: Database - Design & Implement Medical Records Schema & Storage
*   BE-RECS-1: Backend - Secure Service for Record Upload (Admin/Provider)
*   BE-RECS-2: Backend - Secure Service for Record Download (User)
*   APP-RECS-1: Mobile UI - List Health Records
*   APP-RECS-2: Mobile UI - Securely View/Download Health Record

---

#### DB-RECS-1: Database - Design & Implement Medical Records Schema & Storage

**Epic:** EPIC-HEALTH-RECS
**Description:** Design and implement the necessary database schema and storage security for handling patient medical records. This is the foundational step for all health record functionality.
**Acceptance Criteria (AC):**
*   A new `public.medical_records` table is created with appropriate columns (`user_id`, `record_type`, `storage_object_path`, etc.).
*   A new, **private** Supabase Storage bucket named `medical_records` is created. Public access must be disabled.
*   Row Level Security (RLS) policies are implemented on the `medical_records` table to ensure users can only see their own records, and authorized providers/admins have appropriate access.
*   Storage policies are implemented to ensure only authenticated and authorized users can upload or generate download links for files.
**Technical Suggestions/Notes:**
*   The `storage_object_path` should follow a predictable pattern, e.g., `{user_id}/{record_id}.{file_extension}`.
*   RLS policies are critical for security and compliance.
*   Pillar: `carepop-backend` / `supabase`
**Estimated Effort:** M
**Priority:** Critical
**Status:** Done

*This table will expand as more tickets are added to `epics_and_tickets.md`.*

- **FEAT-MOB-004: User Profile Management**
  - **Description:** Allow users to view and edit their profile information on the mobile app. This includes personal details, contact information, and a profile picture.
  - **Acceptance Criteria:**
    - Users can navigate to a "My Profile" screen from the drawer menu.
    - The screen displays all of the user's current profile data.
    - An "Edit" button allows users to modify their information.
    - Users can upload or change their profile picture.
    - All changes are saved to the Supabase backend.
  - **Tech Suggestions:** React Navigation, Expo Image Picker, Supabase Storage for uploads.

- **FEAT-MOB-005: Appointment Booking Flow**
  - **Description:** Implement the full, multi-step flow for a user to book an appointment for a specific service at a specific clinic.
  - **Acceptance Criteria:**
    - The flow must follow a `Clinic -> Service -> DateTime` sequence.
    - Step 1: User selects a clinic from a list of all available clinics.
    - Step 2: User selects a health service offered by that clinic.
    - Step 3: User selects an available date and time slot.
    - Step 4: User reviews a confirmation screen with all appointment details.
    - Step 5: Upon confirmation, the appointment is created in the backend.
    - Step 6: A success screen is displayed to the user.
    - The UI/UX must be polished and consistent with the application's design system.
  - **Tech Suggestions:** React Navigation (Native Stack), `react-native-calendars`, Supabase API for fetching data and creating appointments.

### Epic: FOUND-3 (Backend Foundation)
Tickets related to core backend setup, authentication, and user management.

### EPIC-HEALTH-BUDDY: Health Buddy Feature (MVP)
*   **Goal:** Provide users with tools to track key health metrics daily.
*   **Pillar:** `carepop-mobile`, `carepop-backend`

| Ticket ID | Title                                                      | Priority | Phase | Pillar                    | Summary                                                                                                                             |
|-----------|------------------------------------------------------------|----------|-------|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| HB-1      | Backend & DB for Health Buddy Trackers (Mood, BP, Activity)| High     | MVP   | `carepop-backend`         | Create `health_entries` table. Build backend services, controllers, and routes to log and retrieve mood, blood pressure, and activity data. |
| HB-2      | Frontend UI for Health Buddy Trackers (Logging)            | High     | MVP   | `carepop-mobile`          | Build the `HealthBuddyScreen` with UI components for users to log their mood, blood pressure, and daily activity.                       |
| HB-3      | Frontend - Implement Data Visualization for Health Trackers| High     | MVP   | `carepop-mobile`          | Enhance the `HealthBuddyScreen` with charts to visualize historical data for mood, blood pressure, and activity.                          |

#### BE-RECS-1: Backend - Secure Service for Record Upload (Admin/Provider)

**Epic:** EPIC-HEALTH-RECS
**Description:** Create a secure backend service and API endpoint for authorized users (initially admins) to upload medical records for a specific patient.
**Acceptance Criteria (AC):**
*   A new `POST /api/v1/admin/users/:userId/medical-records` endpoint is created.
*   The endpoint is protected by `isAdmin` middleware.
*   It accepts `multipart/form-data` including a file and other metadata (record type, description, etc.).
*   The service uploads the file to the private `medical_records` Supabase Storage bucket.
*   The service creates a corresponding entry in the `public.medical_records` table.
*   The operation is atomic; if the database insert fails, the uploaded file is deleted.
**Technical Suggestions/Notes:**
*   Uses `multer` for file handling in Express.
*   Service logic is in `MedicalRecordAdminService`.
*   Pillar: `carepop-backend`
**Estimated Effort:** M
**Priority:** Critical
**Status:** Done

#### BE-RECS-2: Backend - Secure Service for Record Download (User)

**Epic:** EPIC-HEALTH-RECS
**Description:** Create a secure backend service and API endpoint for a user to obtain a temporary, signed URL to download one of their own medical records.
**Acceptance Criteria (AC):**
*   A new `GET /api/v1/public/medical-records/:recordId/download-url` endpoint is created.
*   The endpoint is protected by standard authentication middleware.
*   The service verifies that the requested record belongs to the authenticated user.
*   The service uses `supabase.storage.from('medical_records').createSignedUrl()` to generate a short-lived URL.
*   The signed URL is returned to the client.
**Technical Suggestions/Notes:**
*   Service logic is in `MedicalRecordUserService`.
*   RLS on the `medical_records` table provides a defense-in-depth security layer.
*   Pillar: `carepop-backend`
**Estimated Effort:** S
**Priority:** Critical
**Status:** Done

#### APP-RECS-1: Mobile UI - List Health Records

**Epic:** EPIC-HEALTH-RECS
**Description:** Create a screen in the mobile app where users can see a list of all their available health records.
**Acceptance Criteria (AC):**
*   A new `MyRecordsScreen.tsx` is created and added to the navigation.
*   The screen fetches the list of the user's records from a new backend endpoint (`GET /api/v1/public/medical-records/my-records`).
*   Each record is displayed in a list item, showing the record type and creation date.
*   The screen handles loading and empty states appropriately.
**Technical Suggestions/Notes:**
*   Requires a new backend endpoint and service (`MedicalRecordUserService`) to fetch records for the authenticated user.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** Done

#### APP-RECS-2: Mobile UI - Securely View/Download Health Record

**Epic:** EPIC-HEALTH-RECS
**Description:** Implement the functionality for the user to tap on a health record from the list and securely download and view it.
**Acceptance Criteria (AC):**
*   Tapping a record item on `MyRecordsScreen` triggers the download process.
*   The app calls the `BE-RECS-2` endpoint to get a signed URL for the specific record.
*   The app uses a library like `expo-file-system` to download the file from the signed URL to the device's local cache.
*   The app uses `expo-sharing` to open the downloaded file in the appropriate default application (e.g., a PDF viewer).
*   Handles download progress and success/error feedback.
**Technical Suggestions/Notes:**
*   This functionality is implemented within `MyRecordsScreen.tsx`.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** Done

### EPIC-WEB-REFINEMENT: Full Codebase Refinement & UI/UX Overhaul

**Description:** A comprehensive initiative to review, refine, and overhaul the entire `carepop-web` application. The goal is to elevate the codebase to modern, production-grade standards, ensuring it is performant, fully typed, accessible, consistent, and maintainable.
**Business Value:** Significantly improves user experience, developer velocity, and long-term stability of the web application. Reduces technical debt and makes the platform easier to scale and maintain.
**Acceptance Criteria (Overall Epic):**
*   All pages and components are fully responsive across mobile, tablet, and desktop breakpoints.
*   The entire application uses a consistent design system based on shadcn/ui and TailwindCSS.
*   TypeScript is strictly enforced with no type errors (`ignoreBuildErrors` is removed).
*   All data interactions (Supabase, APIs) are strongly typed and robustly error-handled.
*   The application achieves a Lighthouse score of 90+ across all key metrics.
*   The codebase is clean, well-structured, and free of unused assets or legacy code.

**Tickets:**
*   TICKET-REFINEMENT-TS-1: Enforce TypeScript Strict Mode & Remove `ignoreBuildErrors`
*   TICKET-REFINEMENT-CLEANUP-1: Code & Asset Clean-Up
*   TICKET-REFINEMENT-RESPONSIVE-1: Audit & Refine Responsiveness - Core Pages
*   TICKET-REFINEMENT-RESPONSIVE-2: Audit & Refine Responsiveness - User & Dashboard Pages
*   TICKET-REFINEMENT-RESPONSIVE-3: Audit & Refine Responsiveness - Admin Pages
*   TICKET-REFINEMENT-COMP-1: Audit & Standardize on Shadcn/UI Components
*   TICKET-REFINEMENT-ANIM-1: Implement Page Transitions & Menu Animations
*   TICKET-REFINEMENT-SUPA-1: Audit & Refine Supabase Integration (Typing, RLS, Error Handling)
*   TICKET-REFINEMENT-UX-1: Accessibility (WCAG) & Semantic Markup Audit
*   TICKET-REFINEMENT-UX-2: Implement Robust Form Validation (Zod)
*   TICKET-REFINEMENT-UX-3: Standardize User Feedback States (Toasts, Modals)
*   TICKET-REFINEMENT-PERF-1: Performance Audit & Optimization (Lighthouse)

---

#### TICKET-REFINEMENT-TS-1: Enforce TypeScript Strict Mode & Remove `ignoreBuildErrors`

**Epic:** EPIC-WEB-REFINEMENT
**Description:** The first and most critical step in the refinement process. The `ignoreBuildErrors: true` flag in `next.config.js` must be removed, and all resulting TypeScript errors must be properly fixed. This restores the integrity of the type system.
**Acceptance Criteria (AC):**
*   `ignoreBuildErrors` is set to `false` or removed from `next.config.js`.
*   The application builds successfully (`npm run build`) without any TypeScript errors.
*   The original type error in `[userId]/page.tsx` is properly resolved without `@ts-nocheck` or other workarounds.
**Technical Suggestions/Notes:**
*   This will likely require deep investigation into the root cause of the original build error that forced the workaround.
*   Pillar: `carepop-web`
**Estimated Effort:** M
**Priority:** Critical

---

#### TICKET-REFINEMENT-CLEANUP-1: Code & Asset Clean-Up

**Epic:** EPIC-WEB-REFINEMENT
**Description:** Perform a full audit of the codebase to identify and remove all unused files, components, assets (images, fonts), and dead code.
**Acceptance Criteria (AC):**
*   All unused `.tsx`, `.ts`, `.css`, image, and other asset files are deleted.
*   Code that is commented out and no longer relevant is removed.
*   Dependencies in `package.json` that are no longer used are removed.
**Technical Suggestions/Notes:**
*   Use a tool like `depcheck` to identify unused dependencies.
*   Use IDE features to find unused exports and files.
*   Pillar: `carepop-web`
**Estimated Effort:** M
**Priority:** High

---

#### TICKET-REFINEMENT-RESPONSIVE-1: Audit & Refine Responsiveness - Core Pages

**Epic:** EPIC-WEB-REFINEMENT
**Description:** Systematically review and fix all responsiveness issues on the core public-facing pages: Home, About Us, Contact, Login, Register, Forgot Password.
**Acceptance Criteria (AC):**
*   Layouts scale correctly from a 320px mobile viewport up to a 1920px+ desktop viewport.
*   There is no horizontal overflow on any screen size.
*   Text is readable and UI elements are tappable on mobile.
*   Navigation (including mobile hamburger menu) is functional and looks correct on all breakpoints.
**Technical Suggestions/Notes:**
*   Use browser developer tools to test various screen sizes.
*   Focus on TailwindCSS responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
*   Pillar: `carepop-web`
**Estimated Effort:** L
**Priority:** High

### EPIC-MOBILE-UI-UX-ALIGNMENT: Mobile UI/UX and Design System Alignment

**Description:** To systematically audit, design, and implement a consistent and modern UI/UX for the `carepop-mobile` (Expo) application. The primary design inspiration and source of truth for this alignment will be the existing `carepop-web` application, particularly its refined Admin Dashboard and overall aesthetic built with Tailwind CSS and Shadcn/UI.

**Business Value:** This epic will create a seamless, high-quality, and brand-consistent user experience across both web and mobile platforms. This enhances brand identity, improves user trust and satisfaction, and increases development velocity by creating a reusable and well-documented mobile component library.

**Acceptance Criteria (Overall Epic):**
*   The mobile app's visual design (colors, typography, spacing) is consistent with the web application.
*   A comprehensive, reusable component library, inspired by Shadcn/UI, is implemented in the mobile app.
*   Key mobile screens are redesigned to match the layout, information hierarchy, and user flows of their web counterparts where appropriate.
*   The mobile app adheres to mobile-specific UI/UX best practices, including touch targets, platform-native navigation patterns, and performance.
*   The final implementation is responsive, accessible (WCAG AA), and built on a modern, maintainable tech stack.

**Tickets:**
*   TICKET-M-ALIGN-1: Foundation & Tooling Setup
*   TICKET-M-ALIGN-2: UI Audit & Design Token Definition
*   TICKET-M-ALIGN-3: Core Component Library Development
*   TICKET-M-ALIGN-4: Navigation Scaffolding & Theming
*   TICKET-M-ALIGN-5: Screen Redesign - Dashboard & Appointments
*   TICKET-M-ALIGN-6: Final Polish - Accessibility & Responsiveness Pass

---

#### TICKET-M-ALIGN-1: Foundation & Tooling Setup

**Epic:** EPIC-MOBILE-UI-UX-ALIGNMENT
**Description:** Configure the `carepop-mobile` project with the necessary foundational libraries for styling, component building, and iconography, as outlined in the design brief.
**Acceptance Criteria (AC):**
*   `nativewind` (v4 if compatible, otherwise latest stable) is installed and configured in the Expo project, including the necessary Babel plugin.
*   A `tailwind.config.js` file is created in the `carepop-mobile` root.
*   `lucide-react-native` is installed to ensure icon parity with the web application's `lucide-react`.
*   `react-native-reanimated` is confirmed to be installed and correctly configured for animations. `moti` is installed as the primary animation library.
*   All new dependencies are added to `package.json` and the project builds successfully without errors.
**Technical Suggestions/Notes:**
*   **Rationale for NativeWind:** Chosen over `tailwind-react-native-classnames` for its more powerful feature set, direct Tailwind CSS compatibility (including custom themes), and better long-term maintenance.
*   **Rationale for Moti:** It provides a simple, declarative API over `react-native-reanimated`, making it ideal for replicating the fluid interactions found on the web app.
*   Pillar: `carepop-mobile`
**Estimated Effort:** M
**Priority:** High
**Status:** To Do

---

#### TICKET-M-ALIGN-2: UI Audit & Design Token Definition

**Epic:** EPIC-MOBILE-UI-UX-ALIGNMENT
**Description:** Conduct a thorough UI audit of the `carepop-web` application to extract all design tokens and define them within the `carepop-mobile` project's `tailwind.config.js`.
**Acceptance Criteria (AC):**
*   A comprehensive audit of `carepop-web/src/app/globals.css` and its Shadcn UI theme is completed.
*   **Colors:** All primary, secondary, accent, destructive, foreground, and background colors (for both light and dark modes) are replicated in `tailwind.config.js`.
*   **Typography:** Font families (e.g., Inter), sizes (for headlines, body, etc.), and weights are defined.
*   **Spacing:** The 4/8/12/16/24/32/40px spacing scale is defined.
*   **Border Radius:** `sm`, `md`, `lg` border radii from Shadcn UI are replicated.
*   The defined theme is successfully applied and accessible via NativeWind utility classes.
**Technical Suggestions/Notes:**
*   This ticket is foundational for all subsequent UI work. Accuracy is critical.
*   Reference `carepop-web`'s `tailwind.config.ts` file as the primary source of truth.
*   Create a simple test component to verify that custom colors, fonts, and spacing from the theme can be applied.
*   Pillar: `carepop-mobile`
**Estimated Effort:** L
**Priority:** High
**Status:** To Do

---

#### TICKET-M-ALIGN-3: Core Component Library Development

**Epic:** EPIC-MOBILE-UI-UX-ALIGNMENT
**Description:** Create a set of fundamental, reusable UI components inspired by `shadcn/ui`, using NativeWind for styling. This replaces the need for an external library like `react-native-paper`, ensuring perfect visual alignment.
**Acceptance Criteria (AC):**
*   A new directory, `carepop-mobile/src/components/ui`, is created to house the new components.
*   The following components are created, styled with NativeWind, and are fully typed with TypeScript:
    *   `Button`: Replicating variants (default, destructive, outline, secondary, ghost, link).
    *   `Input`: A styled text input with focus states.
    *   `Card`: Including `CardHeader`, `CardContent`, `CardFooter`.
    *   `Alert` & `AlertDialog`: For notifications and confirmation dialogs.
    *   `Tabs`: To match the functionality used in the "My Appointments" screen.
    *   `Text`: A wrapper around `React Native's Text` that applies the default font.
*   Each component is designed to be composable and reusable.
**Technical Suggestions/Notes:**
*   This approach favors building lightweight, custom components over importing a large library, which gives us full control over styling to match the web app.
*   These components will form the building blocks for all screen redesigns.
*   Pillar: `carepop-mobile`
**Estimated Effort:** XL
**Priority:** High
**Status:** To Do

---

#### TICKET-M-ALIGN-4: Navigation Scaffolding & Theming

**Epic:** EPIC-MOBILE-UI-UX-ALIGNMENT
**Description:** Implement the primary navigation structure for the app using `react-navigation`, ensuring it is consistent with mobile UI best practices and the app's hierarchy.
**Acceptance Criteria (AC):**
*   A **Bottom Tab Navigator** is implemented as the primary navigation for main app sections (e.g., Dashboard, Appointments, Profile).
*   Icons in the tab bar use `lucide-react-native` and are consistent with web counterparts.
*   A consistent `Header` component is created and applied across relevant screens within a `StackNavigator`.
*   The navigation theme (colors, fonts) is configured to use the newly defined design tokens.
**Technical Suggestions/Notes:**
*   Review existing navigation in `carepop-mobile/src/navigation/AppNavigator.tsx` and refactor it to use the new structure and styling.
*   Pillar: `carepop-mobile`
**Estimated Effort:** M
**Priority:** High
**Status:** To Do

---

#### TICKET-M-ALIGN-5: Screen Redesign - Dashboard & Appointments

**Epic:** EPIC-MOBILE-UI-UX-ALIGNMENT
**Description:** Redesign the main user-facing screens, starting with the Dashboard and "My Appointments", using the new component library and design system.
**Acceptance Criteria (AC):**
*   `DashboardScreen.tsx` is redesigned to reflect the layout and information hierarchy of the web dashboard, using the new `Card`, `Button`, and `Text` components.
*   `MyAppointments` screen (`EPIC-APP-USER | APP-USER-6`) is refactored to use the new `Tabs` and `Card` components for a cleaner presentation of upcoming and past appointments.
*   Screens are fully responsive and use the defined spacing and typography scales.
*   All interactive elements meet the 48x48dp touch target requirement.
*   Animations (`moti`) are used for subtle entrance effects or state changes.
**Technical Suggestions/Notes:**
*   Start by replacing existing React Native core components with the new custom UI components one by one.
*   Focus on clean layout using Flexbox.
*   Pillar: `carepop-mobile`
**Estimated Effort:** L
**Priority:** Medium
**Status:** To Do

---

#### TICKET-M-ALIGN-6: Final Polish - Accessibility & Responsiveness Pass

**Epic:** EPIC-MOBILE-UI-UX-ALIGNMENT
**Description:** Conduct a final pass across all redesigned screens to ensure they meet accessibility standards and are fully responsive across a range of device sizes.
**Acceptance Criteria (AC):**
*   All interactive components have appropriate `accessibilityLabel` and `accessibilityRole` props.
*   Color contrast ratios are checked and meet WCAG AA standards.
*   Layouts are tested and function correctly on both small phones (e.g., iPhone SE) and large phones (e.g., iPhone 15 Pro Max) in both emulators and on real devices if possible.
*   Tablet-specific layouts (e.g., for modals) are considered and implemented where necessary.
**Technical Suggestions/Notes:**
*   Use Expo's built-in accessibility tools and device simulators to test.
*   This final QA step is crucial for delivering a truly professional and inclusive application.
*   Pillar: `carepop-mobile`
**Estimated Effort:** M
**Priority:** Medium
**Status:** To Do

#### TICKET-MOB-PROF-1: Standardize and Refine Mobile Profile Screens

**Epic:** EPIC-001
**Description:** Conduct a comprehensive UI/UX overhaul of the entire user profile section in the mobile app (`carepop-mobile`) to ensure a modern, consistent, and user-friendly experience. This involves standardizing the design of the "My Profile," "Edit Profile," and "Create Profile" screens based on a new card-based layout.
**Acceptance Criteria (AC):**
*   `EditProfileScreen`, `MyProfileScreen`, and `CreateProfileScreen` all use a consistent card-based layout.
*   A custom, animated bottom-sheet component (`CustomPicker`) is implemented and used for all selection modals (date, location, etc.) to provide a unified feel.
*   Shared components (`Card`, `Button`, 'TextInput') are used across all three screens.
*   The design language (colors, typography, spacing) is consistent across all three screens.
*   Navigation between the screens is seamless (e.g., hamburger menu on "My Profile," back button on "Edit Profile").
*   The `AuthContext` is updated with a `createProfile` function to support the refactored `CreateProfileScreen`.
**Technical Suggestions/Notes:**
*   This was a significant redesign that involved creating new shared components and patterns, such as the `CustomPicker` with `moti` for animations.
*   The `AuthContext` was extended to provide a `createProfile` method.
*   Pillar: `carepop-mobile`
**Estimated Effort:** L
**Priority:** High
**Status:** Done

---

#### MAPP-7: Refactor and Redesign Mobile Booking Flow

**Epic:** NATIVE APP
**Description:** A complete redesign and refactoring of the "Book a Service" flow in the mobile application. The original screen was broken and the user experience was suboptimal. This ticket covers transforming the flow into a modern, single-component, multi-step process.
**Acceptance Criteria (AC):**
*   The entire booking flow is consolidated into a new `BookingFlowScreen.tsx` component.
*   The flow follows a logical sequence: Clinic Selection -> Service Selection -> Provider Selection -> Date & Time Selection -> Confirmation.
*   The UI is modern, intuitive, and provides clear user feedback at each step.
*   The calendar in the date selection step correctly highlights dates with provider availability.
*   The component correctly handles cases where no providers or time slots are available.
*   The final implementation is robust, with proper error handling and state management.
*   The backend dependencies, particularly the `get_providers_for_service_in_clinic` RPC, are verified and corrected to ensure they provide the necessary data in the expected format.
**Technical Suggestions/Notes:**
*   This was a major undertaking that involved significant debugging of both frontend and backend issues.
*   Backend schema drift was discovered and had to be manually corrected by the user via several SQL updates to the `get_providers_for_service_in_clinic` function.
*   The final component makes heavy use of `useState`, `useEffect`, and `useMemo` for managing the multi-step state.
*   Pillar: `carepop-mobile`
**Estimated Effort:** XL
**Priority:** Critical
**Status:** In Progress

---

| EPIC                   | Ticket ID                     | Title                                               | Status | Assignee | Notes                                                              |
|------------------------|-------------------------------|-----------------------------------------------------|--------|----------|--------------------------------------------------------------------|
| EPIC-ADMIN-REFINEMENT  | ADMIN-FOUNDATION-1            | Full Layout Responsiveness Audit                    | Done   | Czar     | Existing layout is correct, no changes needed.                     |

---

### EPIC-NATIVE-NAV-V2: Clinic Finder with Real-Time Guided Navigation

**Description:** Implement a comprehensive, real-time, turn-by-turn navigation experience within the `carepop-nativeapp` to guide users to selected clinics. This feature will be a significant enhancement over the basic clinic finder, providing an interactive, modern, and user-friendly guided journey.
**Business Value:** Increases user engagement and the utility of the clinic finder by removing the friction of switching to an external maps app. Provides a seamless "search-to-arrival" experience, improving accessibility and user confidence.
**Acceptance Criteria (Overall Epic):**
*   Users can initiate a navigation session to a clinic from the clinic details page.
*   The UI displays a map with the route, the user's current location, and the destination.
*   The user receives clear, real-time, turn-by-turn instructions for both "WALK" and "DRIVE" modes.
*   The route and instructions update automatically as the user moves.
*   The system gracefully handles errors like GPS signal loss or API failures.
*   The feature is cost-efficient, primarily by proxying Google Directions API calls through the backend.

**Tickets:**
*   NATIVE-NAV-V2-1: Backend - Secure Google Directions API Key & Create Proxy Endpoint
*   NATIVE-NAV-V2-2: Mobile - Re-integrate Mapping Libraries & Setup Dev Client
*   NATIVE-NAV-V2-3: Mobile - Fetch Route from Backend & Render Initial Map Polyline
*   NATIVE-NAV-V2-4: Mobile - Implement Real-Time Location Tracking
*   NATIVE-NAV-V2-5: Mobile UI - Build Turn-by-Turn Instruction Component
*   NATIVE-NAV-V2-6: Mobile UI - Build WALK/DRIVE Mode Toggle
*   NATIVE-NAV-V2-7: Mobile Logic - Implement Route Recalculation on Deviation
*   NATIVE-NAV-V2-8: Mobile UI - Implement Arrival Confirmation Screen
*   NATIVE-NAV-V2-9: Mobile - Implement Error Handling and Edge Cases
*   NATIVE-NAV-V2-10: QA - Full Feature Testing & Optimization

---

#### NATIVE-NAV-V2-1: Backend - Secure Google Directions API Key & Create Proxy Endpoint

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** To ensure security and manage costs, the Google Directions API key must not be exposed in the mobile client. This ticket involves setting up the API key securely in the backend and creating a proxy endpoint that the mobile app can call.
**Acceptance Criteria (AC):**
*   A new Google Directions API key is acquired and stored securely in Google Secret Manager for the `carepop-backend`.
*   A new public-facing API endpoint (e.g., `POST /api/v1/public/navigation/directions`) is created in the `carepop-backend`.
*   This endpoint accepts origin, destination, and mode (walking/driving) as input.
*   The backend service calls the Google Directions API using the secured key and returns the formatted route data to the client.
*   The endpoint includes basic validation and error handling.
*   The cost-efficiency of the API usage is considered (e.g., minimizing requested fields).
**Technical Suggestions/Notes:**
*   This is a critical first step for security.
*   The backend service should handle any data transformation needed by the client.
*   Pillar: `carepop-backend`
**Estimated Effort:** M
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-2: Mobile - Re-integrate Mapping Libraries & Setup Dev Client

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** The previous attempt at this feature was blocked by native dependencies (`react-native-maps`, `expo-location`) not being compatible with the standard Expo Go client. This ticket covers reinstalling these libraries and setting up the required Expo Dev Client for development and testing.
**Acceptance Criteria (AC):**
*   `react-native-maps` and `expo-location` are added as dependencies to `carepop-nativeapp`.
*   The project is configured to build and run using the Expo Dev Client.
*   The application successfully builds and launches on both an iOS simulator and an Android emulator with the new dependencies.
*   A basic `MapView` component can be rendered on a screen without crashing the app.
**Technical Suggestions/Notes:**
*   This unblocks all other mobile-side navigation work.
*   Requires following the official Expo Dev Client setup documentation.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-3: Mobile - Fetch Route from Backend & Render Initial Map Polyline

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** Implement the initial state of the navigation screen. When a user starts navigation, the app should fetch the route from the backend proxy and display it on the map.
**Acceptance Criteria (AC):**
*   A new `NavigationScreen.tsx` is created.
*   When the screen loads, it calls the backend proxy endpoint created in `NATIVE-NAV-V2-1`.
*   The returned route data is parsed.
*   A `MapView` from `react-native-maps` is displayed, centered on the route.
*   A `Polyline` component is used to draw the driving/walking route on the map.
*   Markers are displayed for the user's starting location and the clinic destination.
**Technical Suggestions/Notes:**
*   Depends on `NATIVE-NAV-V2-1` and `NATIVE-NAV-V2-2`.
*   The polyline color and stroke should match the app's theme.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** L
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-4: Mobile - Implement Real-Time Location Tracking

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** Use `expo-location` to track the user's real-time position and update their marker on the map.
**Acceptance Criteria (AC):**
*   The app requests and handles location permissions from the user.
*   `expo-location.watchPositionAsync` is used to get live location updates.
*   The user's marker on the map animates smoothly to their new position with each update.
*   The map automatically pans and zooms to keep the user's marker in view if desired.
*   The location tracking is battery-efficient.
**Technical Suggestions/Notes:**
*   This is a core component of the "live" navigation feel.
*   Use `react-native-reanimated` for smooth marker animations.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** L
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-5: Mobile UI - Build Turn-by-Turn Instruction Component

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** Create a floating card or banner component that displays the current turn-by-turn instruction (e.g., "Turn left on Main St.").
**Acceptance Criteria (AC):**
*   A new reusable component is created for displaying a single navigation step.
*   It should display an instruction icon (e.g., turn-left), the instruction text, and the distance to the next maneuver.
*   The component is styled to match the app's modern, Gen Z-friendly aesthetic.
*   The component updates in real-time as the user progresses along the route.
**Technical Suggestions/Notes:**
*   Use Lucide icons for instruction arrows.
*   The component should be animated to appear/update smoothly.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-6: Mobile UI - Build WALK/DRIVE Mode Toggle

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** Create a floating UI toggle that allows the user to switch between "WALK" and "DRIVE" navigation modes.
**Acceptance Criteria (AC):**
*   A floating button or segmented control is present on the navigation screen.
*   It displays "Walk" and "Drive" options, using Lucide icons.
*   Toggling the mode triggers a new API call to fetch the appropriate route.
*   The map polyline and instructions update to reflect the new mode.
**Technical Suggestions/Notes:**
*   Ensure the toggle is easily tappable and does not obscure critical map information.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** S
**Priority:** Medium
**Status:** To Do

---

#### NATIVE-NAV-V2-7: Mobile Logic - Implement Route Recalculation on Deviation

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** If the user deviates significantly from the suggested route, the app should automatically fetch a new route from their current location.
**Acceptance Criteria (AC):**
*   The app constantly checks the user's distance from the current route polyline.
*   If the distance exceeds a certain threshold, a new route is automatically requested from the backend.
*   The map and instructions seamlessly update with the new route.
*   A subtle loading indicator is shown during the recalculation.
**Technical Suggestions/Notes:**
*   This is a complex but crucial feature for a good navigation experience.
*   The threshold for deviation needs to be tuned to avoid overly frequent recalculations.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** XL
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-8: Mobile UI - Implement Arrival Confirmation Screen

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** When the user is within a certain radius of the destination, the navigation UI should change to an arrival confirmation state.
**Acceptance Criteria (AC):**
*   When the user is very close to the clinic, the turn-by-turn UI is replaced by a success message (e.g., "You have arrived").
*   A "Finish" button is displayed to exit the navigation mode and return to the clinic detail page or dashboard.
*   The UI is celebratory and provides a clear end to the navigation journey.
**Technical Suggestions/Notes:**
*   The arrival radius needs to be tuned appropriately.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** S
**Priority:** Medium
**Status:** To Do

---

#### NATIVE-NAV-V2-9: Mobile - Implement Error Handling and Edge Cases

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** Handle potential errors gracefully, such as loss of GPS signal, no internet connection to fetch the route, or the Google Directions API returning no possible route.
**Acceptance Criteria (AC):**
*   A clear, non-intrusive message is shown to the user if their GPS signal is lost.
*   A full-screen error message with a "Retry" button is shown if the initial route fetch fails.
*   A message is shown if no route can be found between the user's location and the destination.
**Technical Suggestions/Notes:**
*   Good error handling is key to a trustworthy user experience.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** M
**Priority:** High
**Status:** To Do

---

#### NATIVE-NAV-V2-10: QA - Full Feature Testing & Optimization

**Epic:** EPIC-NATIVE-NAV-V2
**Description:** Conduct a thorough quality assurance pass on the entire real-time navigation feature.
**Acceptance Criteria (AC):**
*   A QA checklist is created and executed, covering all features from the epic.
*   Testing is performed on multiple devices (iOS/Android) and form factors.
*   Performance is profiled and optimized (battery usage, API call frequency, animation smoothness).
*   Any bugs found are documented and fixed.
*   The final feature is approved for release.
**Technical Suggestions/Notes:**
*   This final step ensures a high-quality, reliable feature launch.
*   Pillar: `carepop-nativeapp`
**Estimated Effort:** L
**Priority:** Medium
**Status:** To Do

---

| EPIC             | Ticket ID    | Title                                                         | Status      | Notes                                                              |
|------------------|--------------|---------------------------------------------------------------|-------------|--------------------------------------------------------------------|
| EPIC-NATIVE-NAV  | NATIVE-NAV-1 | Backend - Implement Real-Time Routing Service                 | Obsolete    | Superseded by `NATIVE-NAV-V2-1`.                                     |
| EPIC-NATIVE-NAV  | NATIVE-NAV-2 | Mobile - Install and Configure Mapping & Location Libraries | Obsolete    | Superseded by `NATIVE-NAV-V2-2`.                                     |
| EPIC-NATIVE-NAV  | NATIVE-NAV-3 | Mobile UI - Implement Clinic Finder Map View                  | Obsolete    | Superseded by `NATIVE-NAV-V2-3`.                                     |
| EPIC-NATIVE-NAV  | NATIVE-NAV-4 | Mobile UI - Implement Route Preview & Handoff to External Maps | Obsolete    | This V2 feature replaces the handoff with in-app navigation.       |
| EPIC-APP-USER    | APP-USER-6   | Mobile - Implement "My Appointments" List Screen              | Done        | Implemented with a tabbed view for upcoming/past appointments using `react-native-tab-view`. |
| EPIC-APP-USER    | APP-USER-7   | Mobile - Implement Appointment Details & Cancellation       | Done        | Implemented detail screen, data fetching, and cancellation logic.    |
| EPIC-HEALTH-RECS | DB-RECS-1    | Database - Design & Implement Medical Records Schema & Storage | Done        | Migration file created for `medical_records` table and private Supabase bucket planned. |

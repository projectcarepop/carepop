# Epic & Ticket Tracker

**CRITICAL NOTE ON CURRENT STATUS (As of <YYYY-MM-DDTHH:MM:SSZ_PLACEHOLDER>):**
**The project is undergoing a major architectural and structural refactor.**
-   The old `carepop-frontend` monorepo is being dismantled.
-   The project will now consist of three top-level directories: `carepop-backend/`, `carepop-nativeapp/`, and `carepop-web/` within the main `https://github.com/projectcarepop/carepop.git` repository.
-   A **force push to the `main` branch is imminent** to reflect this new structure, which will reset the commit history on `main`.
-   `epics_and_tickets.md` is being updated, and this `tracker.md` will require a full review and update of individual ticket statuses *after* the restructure is complete and `epics_and_tickets.md` is finalized.
-   **Assume all current ticket statuses below are potentially outdated until this review is complete.**

**Note on Current Status (Post-Architectural Pivot):** This tracker reflects the project state after a major architectural shift to a **dual-frontend system**.
1.  **Native Mobile App:** Expo (React Native) for iOS & Android (`apps/nativeapp`).
2.  **Separate Web Application:** New project (Next.js, Tailwind CSS, Shadcn UI - development pending).
Backend (Supabase + Cloud Run) serves both. Ticket IDs, scopes, statuses, and **Acceptance Criteria (AC)** have been updated accordingly. Many UI feature tickets are "To Do" or "In Progress" (UI scaffolding complete, functional integration pending ACs).

**Previous Deviation Note (<Current Date Placeholder>):** Significant deviation occurred. Instead of proceeding with AUTH-3 (Google Login) or AUTH-4 (Login UI), focus shifted entirely to scaffolding numerous placeholder UI screens and refining navigation patterns within the Expo `nativeapp`. This involved creating screens beyond the initial MVP scope (Trackers, detailed Profile) and implementing an authentication bypass. The original goal of having a functional authentication flow is now blocked by potential Metro/API issues and the bypass itself.

---

## Epic 1: Core Setup, Authentication & Deployment Foundation (Supabase & GCP)

*   **Epic Goal:** Establish essential infrastructure (Supabase Project, GCP resources), code repositories (native mobile frontend & backend), CI/CD (native mobile & backend), core security utilities (Supabase Auth, RLS), foundational User DB schema (Supabase PostgreSQL), and the critical Register/Login backend APIs (Cloud Run Functions serving both native mobile and web clients) with functional native mobile frontend (iOS/Android via Expo) UI – making this core authentication flow immediately deployable to staging and verifiable via the native mobile user interface. A separate web application will be developed in a new repository.

### Ticket: FOUND-1: Setup Code Repositories & Initial Project Structure (Native Mobile App & Backend)
*   **Status:** Done
*   **Notes:** `carepop-frontend` (for native mobile) and `carepop-backend` repositories created. Basic structures in place.
*   **Acceptance Criteria:**
    *   [x] `carepop-frontend` (for native mobile app and shared packages) and `carepop-backend` repositories created in source control (e.g., GitHub/GitLab).
    *   [x] Standard folder structures for **React Native (Expo) + TypeScript native mobile frontend** and Node.js + TypeScript backend defined. Backend structure considers deployment units for **Cloud Run**.
    *   [x] Basic placeholder code and `.gitignore` files checked into main branches.
    *   [x] Note: A separate repository will be created for the new web application (Next.js, Tailwind CSS, Shadcn UI).

### Ticket: FOUND-2: Configure Native Mobile App (Expo) & Node.js Backend Development Environment with TypeScript & Supabase SDK
*   **Status:** Done
*   **Notes:** Local development environments for Expo native app and Node.js backend configured with TypeScript and Supabase SDK.
*   **Acceptance Criteria:**
    *   [x] Project dependencies installed (e.g., Expo CLI, core RN packages, Node.js packages, **Supabase JS SDK**).
    *   [x] TypeScript compiler configured for both **native mobile frontend** and backend projects.
    *   [x] Scripts defined to start local development servers for **native mobile FE (iOS/Android via Expo)** and BE (**Node.js server simulating Cloud Run environment**).
    *   [x] Local builds of both **native mobile frontend** and backend projects are successful.
    *   [x] **Basic connection setup for Supabase JS SDK in backend.**

### Ticket: FOUND-3: Select, Provision, & Configure Core Cloud Infrastructure (Google Cloud Platform & Supabase) (Staging)
*   **Status:** Done
*   **Notes:** Supabase project and GCP resources (Cloud Run, Secret Manager, Logging) provisioned for staging.
*   **Acceptance Criteria:**
    *   [x] Chosen Cloud Provider account/project ready (**Google Cloud Platform**).
    *   [x] **Supabase Project provisioned for staging environment, including PostgreSQL database instance.**
    *   [x] Minimum necessary compute resources (**Google Cloud Run services** for backend APIs) provisioned for staging.
    *   [x] **Supabase PostgreSQL database** is securely accessible from **Google Cloud Run services** (e.g., using VPC connector if needed, or private IP if available).
    *   [x] Network access configured for staging environment (secure ingress to **Cloud Run**, secure connections from **Cloud Run** to **Supabase**).
    *   [x] **Google Cloud Secret Manager** provisioned for staging secrets.
    *   [x] **Google Cloud Logging** configured for log sinks.
    *   [x] All staging URLs/IPs (**Cloud Run endpoints, Supabase project URL**) documented.

### Ticket: FOUND-4: Implement Structured Logging and Configuration Management (Cloud Logging & Secret Manager for Backend)
*   **Status:** Done
*   **Notes:** Structured logging (Winston to Cloud Logging) and config management (GCP Secret Manager / .env fallback) implemented for backend.
*   **Acceptance Criteria:**
        *   [x] Logging library (e.g., Winston/Pino) integrated into BE (**Cloud Run services**) projects, configured for different levels.
        *   [x] Logs formatted in a structured way (e.g., JSON lines) when running outside local dev, directed to **Google Cloud Logging**.
        *   [x] Configuration management setup loads secrets/config from **Google Cloud Secret Manager** (for Cloud Run) and **Supabase Project Settings/Secrets** (for Supabase JS SDK keys used by the backend).
        *   [x] Example usage in startup code (**Cloud Run**) and one BE endpoint confirms logging/config retrieved from **Secret Manager**.
        *   [x] **Supabase built-in logging is reviewed.**

### Ticket: FOUND-5: Configure CI/CD Pipeline (Build, Test, Deploy Backend & Native Mobile App to Staging)
*   **Status:** In Progress
*   **Notes:** Backend CI/CD to Cloud Run staging via GitHub Actions is functional. Native mobile CI/CD with EAS Build planned and needs full testing.
*   **Acceptance Criteria:**
    *   [x] CI/CD pipeline configured using chosen service (GitHub Actions, GitLab CI, etc.).
    *   [x] Pipeline triggers on push to main branches of backend and native mobile app code. (Backend verified)
    *   [x] Pipeline runs code linting and basic unit tests (once testing framework is setup - FOUND-6) for backend and native mobile app. (Backend verified)
    *   [ ] Pipeline successfully builds **native mobile FE (iOS/Android via Expo)** and BE (**Cloud Run container images, Supabase Function code**). (BE build done, Native FE build via EAS TBD)
    *   [ ] Pipeline deploys the artifacts to the configured staging environment infrastructure (**Google Cloud Run services, Supabase project, EAS Build for native app**). (BE deploy done, Native FE deploy via EAS TBD)
    *   [ ] Notifications for pipeline success/failure configured (e.g., to team chat).

### Ticket: FOUND-6: Set up Basic Testing Frameworks & Initial Unit Tests (Backend & Native Mobile App)
*   **Status:** Done
*   **Notes:** Jest testing framework integrated for backend (ts-jest) and native mobile frontend (react-native-testing-library with Expo support). Basic tests created.
*   **Acceptance Criteria:**
    *   [x] Testing framework integrated for BE (**Cloud Run Node.js code**) (e.g., Jest, Mocha).
    *   [x] Testing framework integrated for **native mobile FE (iOS/Android via Expo)** (e.g., Jest, React Native Testing Library with Expo support).
    *   [x] A simple BE unit test (e.g., math function).
    *   [x] A simple **native mobile FE** unit test (e.g., component renders without crashing).
    *   [x] Test commands integrated into `package.json` scripts for backend and native mobile app.
    *   [x] Confirm these tests run successfully in the CI pipeline (FOUND-5) (Backend verified).

### Ticket: FOUND-7 (REPLACED by Supabase Auth): Configure Supabase Authentication (For Backend and All Client Applications)
*   **Status:** Done (Initial Configuration)
*   **Goal:** Set up Supabase's built-in authentication system.
*   **Notes:** Supabase Authentication enabled. Email/Password provider configured. SDK initialized. Corresponds to general Supabase Auth setup.
*   **Acceptance Criteria:**
    *   [x] **Supabase Authentication enabled and configured in the Supabase project.**
    *   [x] **Email/Password authentication provider enabled.**
    *   [ ] **Basic email confirmation setup configured (if required by product/security).** (Status TBD)
    *   [x] Users can be created via the **Supabase Auth API (typically called via backend - FOUND-9)**.
    *   [x] Users can log in via the **Supabase Auth API (typically called via backend - FOUND-10)** and receive tokens (JWT).
    *   [x] **Supabase client JS SDK initialized with project URL and Anon key in backend and client application templates.**

### Ticket: FOUND-8 (UPDATED for Supabase): Design & Implement Foundational User Database Schema (Supabase) (Authentication Focus for All Clients)
*   **Status:** Done
*   **Notes:** `profiles` table created in Supabase, linked to Supabase Auth users. Basic RLS for own profile access implemented and verified. Migrations created.
*   **Acceptance Criteria:**
    *   [x] **`users` table schema verified (managed by Supabase Auth).**
    *   [x] **Additional `profiles` table created in Supabase PostgreSQL for basic user-specific data (linked via `user_id` to Supabase Auth `users.id` with appropriate foreign key/constraints).**
    *   [x] Basic `created_at`, `updated_at` timestamps added to `profiles` table.
    *   [x] **Row Level Security (RLS) enabled on the `profiles` table.**
    *   [x] **Initial RLS policies defined and implemented on `profiles`** to allow authenticated users to view and edit *only their own* profile (`user_id = auth.uid()`).
    *   [x] **Supabase JS SDK configured in backend services to interact with the `profiles` table.**
    *   [x] Ensure appropriate indexing (e.g., on email in Auth, on `user_id` in `profiles`).
    *   [x] **Supabase migrations created to apply the schema.**

### Ticket: FOUND-9 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API (Cloud Run Function): Secure User Registration (Serving Native Mobile & Web Apps)
*   **Status:** Done
*   **Notes:** `/api/auth/register` Cloud Run endpoint implemented, uses Supabase Auth, creates profile entry.
*   **Acceptance Criteria:**
    *   [x] **POST `/api/auth/register` endpoint implemented as a Google Cloud Run function.**
    *   [x] API accepts email and password.
    *   [x] Implement initial input validation (basic checks) within the **Cloud Run function**.
    *   [x] **Utilize Supabase JS SDK within the Cloud Run function to call `supabase.auth.signUp()` with email and password.**
    *   [x] **If Supabase Auth signup is successful, automatically create a corresponding entry in the `profiles` table (FOUND-8) linked to the new `auth.uid()`. This might require using the `service_role` key or listening to Supabase Auth webhooks from Cloud Run.**
    *   [x] Handles email uniqueness constraint gracefully (managed by **Supabase Auth**).
    *   [x] API returns 201 Created on success or 400/409 on failure.

### Ticket: FOUND-10 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API (Cloud Run Function): Secure User Login & Token Generation (Serving Native Mobile & Web Apps)
*   **Status:** Done
*   **Notes:** `/api/auth/login` Cloud Run endpoint implemented, uses Supabase Auth, returns JWT. Basic rate limiting is a future enhancement.
*   **Acceptance Criteria:**
    *   [x] **POST `/api/auth/login` endpoint implemented as a Google Cloud Run function.**
    *   [x] API accepts email and password.
    *   [x] Implement input validation within the **Cloud Run function**.
    *   [x] **Utilize Supabase JS SDK within the Cloud Run function to call `supabase.auth.signInWithPassword()` with email and password.**
    *   [x] **If verification succeeds, Supabase Auth returns an authentication token (JWT). The Cloud Run function returns this token to the client (native mobile or web).**
    *   [x] **API returns 200 OK with token on success, 401 Unauthorized on failure (or 400 if input invalid). Avoid leaking "user exists" info on failure.**
    *   [ ] Basic rate limiting added for this endpoint (potentially via middleware on **Cloud Run** or **GCP Load Balancer/Cloud Armor**).

---
### Task ID: FE-SETUP-1 (REVISED for Expo & New Web App Context): Establish Native Mobile App Frontend Monorepo Structure & Dev Environment (Expo)
*   **Status:** Done
*   **Notes:** `carepop-frontend` monorepo (Turborepo/pnpm) stable for native mobile app (`apps/nativeapp` via Expo). Shared `packages/ui` created. Dev environment functional.
*   **Acceptance Criteria:**
    *   [x] `carepop-frontend` monorepo (Turborepo/pnpm) confirmed for native mobile app development.
    *   [x] `apps/nativeapp` (Expo CLI) initialized and configured.
    *   [x] Shared `packages/ui` placeholder created (for native mobile components).
    *   [x] `.npmrc` configured for pnpm.
    *   [x] Metro config (`metro.config.js`) adjusted for monorepo (if necessary beyond Expo defaults).
    *   [x] `pnpm run dev` (or equivalent Expo start script) successfully starts the native mobile development server.
    *   [x] Expo Go or development build successfully runs the native app.
    *   [x] Note: The existing `apps/web` (Next.js) within this monorepo is secondary. The primary web application (Next.js, Tailwind CSS, Shadcn UI) will be developed in a new, separate repository.

---

## Epic 2: UI/UX Design System & Core Components (Native Mobile App MVP Kickoff)

*   **Epic Goal:** Define the initial visual design language and build the absolute core reusable UI components for the native mobile app (iOS/Android via Expo) using React Native `StyleSheet` and shared theme tokens from `packages/ui`, allowing feature Epics to immediately consume them for a consistent look and feel on mobile. The new web application will use its own design system (Tailwind CSS, Shadcn UI).

### Ticket: UI-1 (REVISED for Native Mobile App): Define & Implement Shared Theme (For Native Mobile App)
    *   **Status:** Done
*   **Notes:** `packages/ui/src/theme.ts` created with design tokens for native app.
*   **Acceptance Criteria:**
    *   [x] `theme.ts` file created with initial color palette, spacing scale, font sizes, and border radii, suitable for the native mobile app.
    *   [x] Theme tokens are easily importable and usable within `StyleSheet.create` calls in `packages/ui`.
    *   [x] Theme structure is extensible for future additions (e.g., shadows, typography weights).

### Ticket: UI-2 (REVISED for Native Mobile App): Build Core Reusable Components - Buttons (For Native Mobile App)
    *   **Status:** Done
*   **Notes:** Reusable `Button` component in `packages/ui` for native app, using StyleSheet and theme. Variants implemented.
*   **Acceptance Criteria:**
    *   [x] `Button.tsx` component created in `packages/ui`.
    *   [x] Component accepts necessary props (`title`, `onPress`, `variant`, `disabled`, `style`, `titleStyle`).
    *   [x] Component uses `StyleSheet` for styling.
    *   [x] Styles utilize tokens defined in `packages/ui/src/theme.ts`.
    *   [x] Supports at least 'primary' and 'secondary' variants, plus a disabled state for the native mobile app.
    *   [x] Component renders correctly and is functional in `apps/nativeapp` (Expo).
    *   [-] (Web rendering via RNW in the current monorepo's `apps/web` is secondary and not a primary requirement for this ticket).

### Ticket: UI-3 (REVISED for Native Mobile App): Build Core Reusable Components - Form Inputs (For Native Mobile App)
    *   **Status:** Done
*   **Notes:** `TextInput` component in `packages/ui` for native app, with theme styling, icons, and states.
*   **Acceptance Criteria:**
    *   [x] Basic `TextInput` component created in `packages/ui`.
    *   [x] Uses `StyleSheet` and theme tokens for styling (border, padding, text color, etc.) for the native mobile app.
    *   [x] Handles basic props (`value`, `onChangeText`, `placeholder`, `secureTextEntry`, etc.).
    *   [x] Includes styling for focus states (if applicable) for the native mobile app.
    *   [x] Renders correctly in `apps/nativeapp` (Expo).
    *   [-] (Web rendering via RNW in the current monorepo's `apps/web` is secondary).

### Ticket: UI-4 (REVISED for Native Mobile App): Build Core Reusable Components - Layout (Card, Container) (For Native Mobile App)
    *   **Status:** Done
*   **Notes:** `Card` component and other layout primitives in `packages/ui` for native app.
*   **Acceptance Criteria:**
    *   [x] `Card.tsx` (or similar) component created in `packages/ui`.
    *   [x] Uses `StyleSheet` and theme tokens (e.g., background color, border radius, padding, shadows if defined) for the native mobile app.
    *   [x] Accepts `children` prop.
    *   [x] Renders correctly in `apps/nativeapp` (Expo).
    *   [-] (Web rendering via RNW in the current monorepo's `apps/web` is secondary).

### Ticket: UI-5: Implement Native Mobile Frontend UI: User Registration Screen (Functional)
*   **Status:** In Progress (UI Scaffolding Done, Backend Connection Pending)
*   **Notes:** Registration screen UI built in `apps/nativeapp`. Backend connection via `/api/auth/register` (FOUND-9) needs to be integrated (auth bypass currently active).
*   **Acceptance Criteria:**
    *   [x] Registration screen exists in the **native mobile app (`apps/nativeapp`)**.
    *   [x] Form includes fields for email, password, confirm password.
    *   [ ] Client-side validation for input fields (e.g., non-empty, email format, password match).
    *   [ ] "Register" button calls the backend API (`/api/auth/register`).
    *   [ ] Handles API success (e.g., navigate to login or dashboard) and error responses (display messages).
    *   [x] Uses UI components from `packages/ui` and `theme.ts`.

### Ticket: UI-6: Implement Native Mobile Frontend UI: User Login Screen (Functional)
*   **Status:** In Progress (UI Scaffolding Done, Backend Connection Pending)
*   **Notes:** Login screen UI built in `apps/nativeapp`. Backend connection via `/api/auth/login` (FOUND-10) needs to be integrated (auth bypass currently active). Token storage (SEC-FE-1) also pending.
*   **Acceptance Criteria:**
    *   [x] Login screen exists in the **native mobile app (`apps/nativeapp`)**.
    *   [x] Form includes fields for email and password.
    *   [ ] Client-side validation for input fields.
    *   [ ] "Login" button calls the backend API (`/api/auth/login`).
    *   [ ] Handles API success (store token, navigate to dashboard) and error responses (display messages).
    *   [x] Includes "Forgot Password" link (navigation to placeholder screen for now).
    *   [x] Includes "Sign Up" link (navigation to registration screen).
    *   [x] Uses UI components from `packages/ui` and `theme.ts`.

---

## Epic 3: Secure Client Handling (Native Mobile & Web), Supabase RLS & Foundational DPA Consent

*   **Epic Goal:** Ensure Supabase Auth tokens are handled securely on both native mobile and web clients, apply foundational RBAC logic to control API access via Supabase RLS and backend checks (serving both client types), and integrate the DPA consent flow into user management (Supabase DB, via backend serving both client types).

### Ticket: SEC-BE-1 (UPDATED for Supabase RLS - Serving All Clients): Implement RBAC Roles, Permission Concepts, and Foundational Supabase RLS
*   **Status:** In Progress
*   **Notes:** Conceptual roles defined. `profiles` RLS for self-access is done (FOUND-8). Broader role-based RLS and `user_roles` table or `app_metadata` usage pending.
*   **Acceptance Criteria:**
    *   [x] Conceptual roles (Patient, Provider, Admin) and basic permissions defined and documented.
    *   [ ] Database tables created in **Supabase PostgreSQL** for `roles` and potentially `user_roles` (or leverage **Supabase Auth `app_metadata`**).
    *   [x] **Row Level Security (RLS) enabled on key tables including `profiles` (FOUND-8) and any other initial tables containing user data.**
    *   [x] **Initial RLS policies defined and implemented** to allow users to access their *own* data (`user_id = auth.uid()`) for relevant tables.
    *   [x] **Supabase JS SDK configured to interact with tables respecting RLS.**
    *   [ ] Basic unit tests for schema relationships and **initial RLS policies (using Supabase testing capabilities or helper scripts)**.

### Ticket: SEC-BE-2 (UPDATED for Cloud Run/Supabase Auth - Serving All Clients): Implement Backend Authentication Middleware
*   **Status:** To Do
*   **Notes:** Middleware for Cloud Run to verify Supabase JWT and fetch user context.
*   **Acceptance Criteria:**
    *   [ ] Middleware function created (**for Google Cloud Run, or utilize Supabase Edge Function auth helper**) that intercepts requests to protected routes.
    *   [ ] Middleware checks for a valid authentication token (JWT) in the request headers (`Authorization: Bearer ...`).
    *   [ ] **Utilizes Supabase JS SDK (or built-in Edge Function helpers) to verify token validity (`supabase.auth.getUser(token)` or similar logic) and retrieve the authenticated user's object/ID from Supabase Auth.**
    *   [ ] Looks up the corresponding user's roles (**from Supabase Auth `app_metadata` or related tables in Supabase**) and attaches user object/ID and roles to the request context (e.g., `req.user`).
    *   [ ] Allows valid requests to proceed, sends 401 Unauthorized for invalid/missing tokens.
    *   [ ] Apply this middleware to a non-auth endpoint to confirm functionality.

### Ticket: SEC-BE-3 (UPDATED for Supabase RLS & Backend Checks - Serving All Clients): Implement Core RBAC Enforcement
*   **Status:** To Do
*   **Notes:** Requires SEC-BE-1 and SEC-BE-2. Will involve more complex RLS and application-level checks in Cloud Run.
*   **Acceptance Criteria:**
    *   [ ] **Supabase RLS policies** designed and implemented for core data access scenarios based on user roles (`auth.role()`) and user ID (`auth.uid()`) on relevant tables.
    *   [ ] **Backend code (Cloud Run functions/services)** implements explicit authorization checks for complex scenarios or actions requiring elevated privileges.
    *   [ ] **Logic in backend code uses a Supabase `service_role` key *only when necessary***, but *always* performs application-level authorization *after* obtaining the user context.
    *   [ ] Implement **Deny by Default** principle via **Supabase RLS** and application code.
    *   [ ] Integrate this logic into at least one authenticated API endpoint to verify enforcement.
    *   [ ] Admin actions and sensitive data access attempts logged (SEC-A-1).

### Ticket: SEC-FE-1 (UPDATED for Supabase Token - Native Mobile & New Web App): Implement Secure Client-Side Authentication Token Storage & Retrieval
*   **Status:** To Do
*   **Notes:** Secure storage for Supabase JWT on native (`expo-secure-store`) and web (HttpOnly cookies or other).
*   **Acceptance Criteria:**
    *   [ ] **Native Mobile App:** A secure client-side storage solution integrated (e.g., `expo-secure-store` or `@react-native-community/keychain`).
    *   [ ] **New Web Application (Next.js):** Secure token handling (e.g., HttpOnly cookies if using Next.js backend features for auth proxying, or other secure browser storage if calling APIs directly from client-side Next.js).
    *   [ ] **Supabase Auth token** from successful login is stored using the secure solution appropriate for each client.
    *   [ ] Stored token can be securely retrieved when needed for authenticated API calls.
    *   [ ] Logout functionality removes the token securely from storage on each client.
    *   [ ] Tested on both native mobile platforms and web browsers regarding storage location validity and security implications.

### Ticket: SEC-BE-4 (UPDATED for Supabase - Backend Serving All Clients): Update User Schema (Supabase) & Backend Registration to Store Consent
*   **Status:** To Do
*   **Notes:** Add consent fields to `profiles` table. Update FOUND-9 to store consent.
*   **Acceptance Criteria:**
    *   [ ] **`profiles` table schema (FOUND-8) updated in Supabase PostgreSQL to include field(s) for consent status.**
    *   [ ] Migration script created to update the database schema (**Supabase migrations**).
    *   [ ] Backend registration API (**FOUND-9 Cloud Run function**) modified to receive the user's consent selection and store it in the **Supabase `profiles` table**.
    *   [ ] Consent recording happens transactionally with user creation.
    *   [ ] **Supabase RLS policies reviewed/updated** to potentially restrict access to certain data based on consent status.

### Ticket: SEC-FE-2: Implement Native Mobile Frontend UI: Integrate DPA Consent into Registration
*   **Status:** To Do
*   **Notes:** Add consent UI to native registration screen (UI-5) and submit to SEC-BE-4.
*   **Acceptance Criteria:**
    *   [ ] User Registration screen (UI-5) in the **native mobile app** modified to display privacy notice text (or link) and the explicit consent checkbox(es).
    *   [ ] Consent field data sent to the backend registration API (**SEC-BE-4 Cloud Run function**) upon form submission from the native mobile app.
    *   [ ] Client-side validation in the native mobile app enforces that consent is given (at least for required items) before submission.
    *   [ ] UI styling uses established components (`packages/ui`) and tokens for the native mobile app.

### Ticket: SEC-BE-5 (UPDATED for GCP & Supabase - Protecting All Clients): Configure Secure HTTPS/TLS for Staging Environment
*   **Status:** Done (Implicitly by GCP/Supabase defaults)
*   **Notes:** Cloud Run and Supabase provide HTTPS by default. Review for specific configurations if needed.
*   **Acceptance Criteria:**
    *   [x] TLS certificates obtained and configured for the staging environment domain/IP. (Managed by GCP/Supabase)
    *   [x] **Google Cloud Run service(s) configured to accept only HTTPS traffic.** (Default)
    *   [x] **Supabase project configured for secure connections (HTTPS/TLS).** (Default)
    *   [x] Verify that all frontend communication with the staging backend uses HTTPS. (Assumed with default settings)
    *   [ ] Configuration enforces recommended TLS versions (TLS 1.2+) and excludes weak ciphers. (Needs review)

---

## Epic WEB: Dedicated Web Application (Next.js, Tailwind CSS, Shadcn UI) [NEW EPIC]

*   **Epic Goal:** Develop a separate, comprehensive web application using Next.js, Tailwind CSS, and Shadcn UI. This application will mirror all relevant user-facing functional modules of the native app and include public-facing informational pages and potentially web-specific admin interfaces.

### Ticket: WEB-SETUP-1 (NEW): Initialize Separate Web Application Project (Next.js, Tailwind CSS, Shadcn UI)
*   **Status:** To Do
*   **Notes:** Create new repo, init Next.js, Tailwind, Shadcn UI.
*   **Acceptance Criteria:**
    *   [ ] New Git repository created for the web application.
    *   [ ] Next.js project initialized using the App Router.
    *   [ ] Tailwind CSS configured.
    *   [ ] Shadcn UI installed and basic components (e.g., Button, Input) are usable.
    *   [ ] Basic project structure established.
    *   [ ] Placeholder homepage created.
    *   [ ] Development server runs successfully.

### Ticket: WEB-DIR-8 (Formerly DIR-8, MOVED & REVISED): Implement Web App SSR/SSG for Public Directory Pages & Canonical Tags (Next.js)
*   **Status:** To Do
*   **Notes:** For public directory pages in the new web app.
    *   **Acceptance Criteria:**
    *   [ ] All intended public directory routes in the Next.js app deliver complete HTML content on the initial server response or build phase.
    *   [ ] This includes search result pages and individual provider/facility detail pages.
    *   [ ] Client-side React hydration occurs correctly after the initial render.
    *   [ ] Implement dynamic `<link rel="canonical">` tags on detail pages and potentially parameterized search result pages.

### Ticket: WEB-DIR-9 (Formerly DIR-9, MOVED & REVISED): Implement Detailed Schema.org Markup for Directory Entries (Next.js Web App)
    *   **Status:** To Do
*   **Notes:** For provider/facility detail pages in the new web app.
    *   **Acceptance Criteria:**
    *   [ ] Schema.org markup implemented for provider and facility detail pages in the Next.js app.
    *   [ ] Markup dynamically generated using JSON-LD script tags within Next.js components.
    *   [ ] Includes comprehensive details based on data from the backend.
    *   [ ] Markup validates against schema testing tools.

### Ticket: WEB-DIR-10 (Formerly DIR-10, MOVED & REVISED): Optimize Web App Performance & Technical SEO for Directory Pages (Next.js)
    *   **Status:** To Do
*   **Notes:** Core Web Vitals, sitemap, robots.txt for the new web app's directory.
    *   **Acceptance Criteria:**
    *   [ ] Review Core Web Vitals for key directory pages of the Next.js app.
    *   [ ] Identify and fix major performance bottlenecks using Next.js best practices.
    *   [ ] Ensure clean URLs.
    *   [ ] Generate and maintain an XML sitemap covering all public directory pages in the Next.js app.
    *   [ ] Configure a robust `robots.txt` file for the Next.js app.
    *   [ ] Set up basic web analytics to track page views and user behavior on the web app.

---

## Epic Y: Healthcare Provider Directory (Full Features & SEO for Native Mobile App, Backend serving All Clients)

*   **Epic Goal:** Fully implement the Provider and Facility directory features in the native mobile app (iOS/Android via Expo) and ensure backend APIs serve both native mobile and the new web application. SEO aspects are now handled by Epic WEB.

### Ticket: DIR-1 (UPDATED for Supabase - Serving All Clients): Refine Provider/Facility Database Schema (Supabase) & Add Indexing for Advanced Search
*   **Status:** To Do
*   **Notes:** Enhance directory schemas in Supabase, add indexing. RLS for public read.
*   **Acceptance Criteria:**
    *   [ ] Existing Facilities and Providers schemas updated with necessary fields.
    *   [ ] Add indexing (e.g., GiST for geo queries, full-text search indexes) in **Supabase PostgreSQL**.
    *   [ ] Database migrations scripts created and tested.
    *   [ ] **Supabase RLS policies defined** to allow public read access to directory data while restricting write access to admin roles.

### Ticket: DIR-2 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API (Cloud Run Function): Advanced Directory Search with Filters & Location
*   **Status:** To Do
*   **Notes:** `/api/directory/search` Cloud Run endpoint using Supabase search.
*   **Acceptance Criteria:**
    *   [ ] `/api/directory/search` endpoint implemented as a **Google Cloud Run function**.
    *   [ ] API accepts filter parameters and optional location coordinates/radius.
    *   [ ] Backend logic constructs efficient database queries in **Supabase**.
    *   [ ] Results ordered by relevance or proximity if location is used.
    *   [ ] API returns paginated results.
    *   [ ] **RBAC: Ensure public read access to this endpoint. Supabase RLS policies (DIR-1) handle data access.**

### Ticket: DIR-3 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API (Cloud Run Functions): Admin Management (Full CRUD for Providers/Facilities)
*   **Status:** To Do
*   **Notes:** Cloud Run CRUD APIs for admins, using service_role key with caution after RBAC checks.
*   **Acceptance Criteria:**
    *   [ ] GET, POST, PUT, DELETE endpoints implemented as **Google Cloud Run functions** for `/api/admin/providers` and `/api/admin/facilities`.
    *   [ ] **RBAC Enforcement via application-level checks in the Cloud Run function:** Access granted only to users with Admin roles.
    *   [ ] Robust input validation applied within the **Cloud Run function**.
    *   [ ] Admin actions logged.
    *   [ ] Includes logic for Geocoding address on create/update.

### Ticket: DIR-4 (Native Mobile App): Implement Native Mobile App UI: Advanced Directory Search Filters & Location Input
*   **Status:** To Do (Placeholder UI might exist, functional integration pending)
*   **Notes:** Native UI for search filters, location input, connected to DIR-2.
*   **Acceptance Criteria:**
    *   [ ] Search screen in the **native mobile app** updated with expandable filter options.
    *   [ ] UI element for entering/detecting user location in the native mobile app.
    *   [ ] Filter and location data sent to the backend advanced search API.
    *   [ ] Search results display visually incorporates filtered criteria in the native mobile app.
    *   [ ] UI uses established components from `packages/ui` and design system for native mobile.

### Ticket: DIR-5 (Native Mobile App): Implement Native Mobile App UI: Display Search Results on Map & List View Toggle
*   **Status:** To Do (Placeholder UI might exist, functional integration pending)
*   **Notes:** Native UI for map and list display of search results from DIR-2.
*   **Acceptance Criteria:**
    *   [ ] Native mobile app screen to display search results.
    *   [ ] Integrates a map view to show provider locations as markers.
    *   [ ] Provides a toggle or separate view to display results as a scrollable list.
    *   [ ] Markers/list items are selectable to view details.
    *   [ ] Uses data from **DIR-2 Cloud Run function**.

### Ticket: DIR-6 (Native Mobile App): Implement Native Mobile App UI: Deep-Linking for Navigation to External Map Apps
*   **Status:** To Do
*   **Notes:** "Get Directions" button in native app to open external map apps.
*   **Acceptance Criteria:**
    *   [ ] On provider detail screen in native mobile app, a "Get Directions" button or similar.
    *   [ ] Action uses device's deep-linking capabilities to open the selected provider's address in the default map application.
    *   [ ] Requires destination coordinates from backend.

### Ticket: DIR-7 (Native Mobile App Admin UI - If Applicable): Implement Native Mobile App Admin UI: Provider/Facility Management Screens
*   **Status:** To Do (Likely deferred/descoped in favor of web admin UI)
*   **Notes:** Native admin UI for directory management, if prioritized.
*   **Acceptance Criteria:**
    *   [ ] Screens developed for Admin roles in the native mobile app to list, add new, and edit existing providers and facilities.
    *   [ ] Screens utilize core UI components from `packages/ui`.
    *   [ ] Add/Edit forms correspond to the updated database schema and send data to backend Admin APIs.
    *   [ ] Input validation presentation client-side.
    *   [ ] Access to these screens is protected client-side based on user role.

---
## Epic APPT-USER: Appointment Scheduling (Completing User Flows for Native Mobile App, Backend serving All Clients)
*   **Status:** To Do (Overall Epic)
*   **Notes:** UI Scaffolding for booking flows exists in native app; backend APIs and full integration are pending. All tickets below are "To Do" unless specified. *Individual ticket ACs to be detailed when work commences.*

### Ticket: APP-USER-1 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: Fetch User's Future Appointments
*   **Status:** To Do
### Ticket: APP-USER-2 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: Fetch User's Past/Cancelled Appointments
*   **Status:** To Do
### Ticket: APP-USER-3 (Native Mobile App): Implement Native Mobile App UI: Interactive Availability Calendar View
*   **Status:** To Do (Placeholder UI might exist)
### Ticket: APP-USER-4 (Native Mobile App): Implement Native Mobile App UI: Display & Select Available Time Slots
*   **Status:** To Do (Placeholder UI might exist)
### Ticket: APP-USER-5 (Native Mobile App): Implement Native Mobile App UI: Appointment Booking Confirmation Flow
*   **Status:** To Do (Placeholder UI might exist)
### Ticket: APP-USER-6 (Native Mobile App): Implement Native Mobile App UI: My Appointments Screen (List & Filter)
*   **Status:** To Do (Placeholder UI might exist)
### Ticket: APP-USER-7 (Native Mobile App): Implement Native Mobile App UI: My Appointment Detail View & Cancellation Action
*   **Status:** To Do (Placeholder UI might exist)

---
## Epic APPT-ADMIN/NOTIF: Appointment Scheduling (Admin/Provider & Notifications - Backend serving All Clients, Admin UI primarily Web)
*   **Status:** To Do (Overall Epic)
*   **Notes:** All tickets below are "To Do". Admin UI primarily web. *Individual ticket ACs to be detailed when work commences.*

### Ticket: APP-ADMIN-1 (UPDATED for Supabase - Serving All Clients): Refine Provider Availability Schema (Supabase)
*   **Status:** To Do
### Ticket: APP-ADMIN-2 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: Admin/Provider Manage Availability
*   **Status:** To Do
### Ticket: APP-ADMIN-3 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: Admin/Provider View Appointment Requests
*   **Status:** To Do
### Ticket: APP-ADMIN-4 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: Admin/Provider Confirm/Cancel Appointment Request
*   **Status:** To Do
### Ticket: APP-ADMIN-5 (Admin UI - Primarily Web, potential for Native Mobile): Implement Admin/Provider UI: Schedule & Appointment Management
*   **Status:** To Do
### Ticket: APP-ADMIN-6 (UPDATED for Cloud Run - Backend Serving All Clients): Integrate Backend with Notification Service (Appointment Triggers)
*   **Status:** To Do
### Ticket: APP-ADMIN-7 (UPDATED for Cloud Scheduler/Cloud Run - Backend Serving All Clients): Build Backend Service: Scheduled Appointment Reminders
*   **Status:** To Do
### Ticket: APP-ADMIN-8 (Native Mobile App): Implement Native Mobile App Background Task Listener & Local Notification Trigger
*   **Status:** To Do

---
## Epic PROFILE: Secure User Profile & Linked Data Views (Native Mobile App UI, Backend serving All Clients, Admin UI primarily Web)
*   **Status:** To Do (Overall Epic - beyond foundational profile in FOUND-8)
*   **Notes:** Detailed profile fields, admin management, and linked data framework are pending. Placeholder UI for profile exists in native app. All tickets below "To Do" unless specified. *Individual ticket ACs to be detailed when work commences.*

### Ticket: PROF-1 (UPDATED for Supabase - Serving All Clients): Enhance User Profile Database Schema (Supabase) (Detailed Fields)
*   **Status:** To Do
### Ticket: PROF-2 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: User View/Edit Detailed Profile
*   **Status:** To Do
### Ticket: PROF-3 (UPDATED for Cloud Run/Supabase - Serving All Clients): Build Backend API: Admin View/Manage Any User Profile
*   **Status:** To Do
### Ticket: PROF-4 (Native Mobile App): Implement Native Mobile App UI: Detailed User Profile Screens (User View/Edit)
*   **Status:** To Do (Placeholder UI exists, needs connection to PROF-2)
### Ticket: PROF-5 (Admin UI - Primarily Web, potential for Native Mobile): Implement Admin UI: User Management Screens
*   **Status:** To Do
### Ticket: PROF-6 (UPDATED for Supabase/Cloud Run - Backend Serving All Clients): Design Backend Framework for Secure Linked Data Retrieval (Placeholder)
*   **Status:** To Do
### Ticket: PROF-7 (Native Mobile App): Implement Native Mobile App UI: Placeholder Linked Data Sections on Profile
*   **Status:** In Progress (Placeholder UI for sections like Trackers exists)

---
## Epic TRANSACTIONS: Transaction History (User Focused - Native Mobile App UI, Backend serving All Clients)
*   **Status:** To Do (Overall Epic)
*   **Notes:** All tickets "To Do". *Individual ticket ACs to be detailed when work commences.*

### Ticket: TRN-1 (UPDATED for Supabase - Serving All Clients): Design & Implement Transaction History Database Schema (Supabase)
*   **Status:** To Do
### Ticket: TRN-2 (UPDATED for Cloud Run - Backend Serving All Clients): Build Backend API: Record New Transaction (Internal)
*   **Status:** To Do
### Ticket: TRN-3 (UPDATED for Cloud Run/Supabase - Backend Serving All Clients): Build Backend API: User View Own Transaction History
*   **Status:** To Do
### Ticket: TRN-4 (Native Mobile App): Implement Native Mobile App UI: User View Transaction History Screen
*   **Status:** To Do

---
## Epic INVENTORY: Medicine Inventory Management (Admin Focused - Admin UI primarily Web, Backend serving All Clients)
*   **Status:** To Do (Overall Epic)
*   **Notes:** All tickets "To Do". Admin UI primarily web. *Individual ticket ACs to be detailed when work commences.*

### Ticket: INV-1 (UPDATED for Supabase - Serving All Clients): Design & Implement Inventory Database Schema (Supabase)
*   **Status:** To Do
### Ticket: INV-2 (UPDATED for Cloud Run/Supabase - Backend Serving All Clients): Build Backend API: Admin Manage Inventory (Full CRUD)
*   **Status:** To Do
### Ticket: INV-3 (UPDATED for Cloud Run/Supabase - Backend Serving All Clients): Build Backend API: Admin View Inventory List with Filters
*   **Status:** To Do
### Ticket: INV-4 (Admin UI - Primarily Web, potential for Native Mobile): Implement Admin UI: Inventory Management Screens
*   **Status:** To Do

---
## Epic REPORTING: Admin Reporting (Aggregated Data - Admin UI primarily Web, Backend serving All Clients)
*   **Status:** To Do (Overall Epic)
*   **Notes:** All tickets "To Do". Admin UI primarily web. *Individual ticket ACs to be detailed when work commences.*

### Ticket: REP-1 (UPDATED for Supabase/Cloud Run - Backend Logic): Design Data Aggregation Strategy for Reporting
*   **Status:** To Do
### Ticket: REP-2 (UPDATED for Cloud Run/Supabase - Backend Logic & API): Build Backend Logic & API for Basic Aggregation & Reporting (Non-Sensitive Data)
*   **Status:** To Do
### Ticket: REP-3 (UPDATED for Cloud Run/Supabase - Backend Logic & API): Build Backend Logic & API for Aggregating & Anonymizing Sensitive Data Summaries
*   **Status:** To Do
### Ticket: REP-4 (Admin UI - Primarily Web): Implement Admin UI: Reporting Dashboard & Export
*   **Status:** To Do
### Ticket: REP-5 (UPDATED for Cloud Run - Backend API): Build Backend API: Report Data Export (CSV/JSON)
*   **Status:** To Do

---
## Epic TRACKING-DATA: Secure Health Tracking Modules (Pill & Menstrual - Native Mobile App UI, Backend serving All Clients)
*   **Status:** To Do (Overall Epic)
*   **Notes:** Placeholder UIs for trackers exist in native app. Backend, encryption, and full integration are "To Do". *Individual ticket ACs to be detailed when work commences.*

### Ticket: TRK-1 (UPDATED for Supabase - Backend Schema for All Clients): Design & Implement Pill & Menstrual Tracker Database Schemas (Supabase, Highly Sensitive)
*   **Status:** To Do
### Ticket: TRK-2 (UPDATED for Cloud Run/Secret Manager - Backend Utility): Implement Backend Cryptography Utility (Cloud Run Function) for Encrypting Sensitive Tracker Data
*   **Status:** To Do
### Ticket: TRK-3 (UPDATED for Cloud Run/Supabase/Encryption - Backend API for All Clients): Build Backend API: User Manage Pill Tracker Data
*   **Status:** To Do
### Ticket: TRK-4 (UPDATED for Cloud Run/Supabase/Encryption - Backend API for All Clients): Build Backend API: User Manage Menstrual Tracker Data
*   **Status:** To Do
### Ticket: TRK-5 (UPDATED for Cloud Run/Supabase/Decryption - Backend API for All Clients): Build Backend API: User View Own Tracker Data (Decrypted Retrieval)
*   **Status:** To Do
### Ticket: TRK-6 (UPDATED for Cloud Scheduler/Cloud Run - Backend Logic for All Clients): Build Backend Logic: Schedule Tracking Reminders
*   **Status:** To Do
### Ticket: TRK-7 (UPDATED for Cloud Run/Supabase - Backend API for All Clients, Admin UI primarily Web): Build Backend API: Provider View Assigned Patient Tracking Data (Strict Consent Required)
*   **Status:** To Do
### Ticket: TRK-8 (Native Mobile App): Implement Native Mobile App UI: Pill Tracker Screens
*   **Status:** To Do (Placeholder UI exists, needs connection to TRK-3, TRK-5)
### Ticket: TRK-9 (Native Mobile App): Implement Native Mobile App UI: Menstrual Tracker Screens
*   **Status:** To Do (Placeholder UI exists, needs connection to TRK-4, TRK-5)

---
## Epic AI-HEALTH-ASSESS: AI-Assisted Health Assessment (Initial Scope - Native Mobile App UI, Backend serving All Clients)
*   **Status:** To Do (Overall Epic)
*   **Notes:** All tickets "To Do". *Individual ticket ACs to be detailed when work commences.*

### Ticket: AI-1 (UPDATED for Cloud Run/Secret Manager - Backend Service): Build Backend Service: Integration for AI/NLP Processing
*   **Status:** To Do
### Ticket: AI-2 (UPDATED for Cloud Run - Backend API for All Clients): Build Backend API: Process User Assessment Input (Low-Risk Scope)
*   **Status:** To Do
### Ticket: AI-3 (Native Mobile App): Implement Native Mobile App UI: AI Health Assessment Input Screen
*   **Status:** To Do (Placeholder UI might exist)
### Ticket: AI-4 (Native Mobile App): Implement Native Mobile App UI: Display AI Health Assessment Results (Low-Risk Scope)
*   **Status:** To Do (Placeholder UI might exist)

---
## Epic SECURITY-DEEP-DIVE: Comprehensive Technical Security (Backend & Infrastructure)
*   **Status:** To Do (Overall Epic)
*   **Notes:** Some foundational aspects covered in Epic 1. Deeper security measures are "To Do". *Individual ticket ACs to be detailed when work commences for many tickets.*

### Ticket: SEC-E-1 (UPDATED for Supabase/Cloud Run - Backend Strategy): Design & Implement At Rest Encryption Integration Strategy
*   **Status:** To Do (Related to TRK-2)
*   **Acceptance Criteria:**
    *   [ ] Document which **Supabase PostgreSQL** database fields/tables are designated for At Rest Encryption.
    *   [ ] Outline the process of applying encryption **within the backend code (Cloud Run functions/services)**.
    *   [ ] Detail how IVs and authentication tags are managed.
    *   [ ] Plan how data migration of existing non-encrypted data to encrypted format will be handled.
    *   [ ] **Document how encryption keys will be loaded by Cloud Run functions/services from Google Cloud Secret Manager.**

### Ticket: SEC-E-2 (UPDATED for Cloud Run/Secret Manager - Backend Utility): Implement Backend Cryptography Utility (AES-256-GCM)
*   **Status:** To Do (Same as TRK-2)
*   **Acceptance Criteria:**
    *   [ ] Backend utility functions created to perform AES-256-GCM encrypt/decrypt.
    *   [ ] Utilities handle random IV generation and correctly use IV and authentication tag.
    *   [ ] Unit tests are comprehensive.
    *   [ ] Utilize a Cryptographically Secure Random Number Generator (CSPRNG) for IVs.
    *   [ ] Code review by at least one other team member.
    *   [ ] **Utilities securely load encryption keys from Google Cloud Secret Manager at runtime.**
    *   [ ] **Deployed as a Google Cloud Run function or Supabase Edge Function.**

### Ticket: SEC-S-1 (UPDATED for Google Cloud Secret Manager - Backend & Infrastructure): Select & Implement Secure Secrets Management System
*   **Status:** Done
*   **Notes:** GCP Secret Manager selected and used in FOUND-3, FOUND-4.
*   **Acceptance Criteria:**
    *   [x] A secure secrets management solution (**Google Cloud Secret Manager**) selected and provisioned in GCP.
    *   [x] System provisioned and configured in staging and production infrastructure.
    *   [x] All sensitive configuration are moved from environment variables for staging and production into **Google Cloud Secret Manager**.
    *   [x] Application code (**Cloud Run functions/services**) modified to securely retrieve secrets from the management system at runtime.
    *   [x] Access to the secrets manager is strictly controlled via IAM roles/policies.

### Ticket: SEC-A-1 (UPDATED for Supabase/Cloud Logging - Backend & Infrastructure): Design & Implement Comprehensive Auditing Strategy
*   **Status:** To Do
*   **Notes:** Basic logging in FOUND-4, comprehensive strategy pending.
*   **Acceptance Criteria:**
    *   [ ] Document audit requirements based on DPA/HIPAA needs.
    *   [ ] Plan log aggregation solution (**Google Cloud Logging**).
    *   [ ] Design how audit logs are protected from tampering or unauthorized deletion.
    *   [ ] Plan log retention policy.
    *   [ ] Implement audit logging within authentication, RBAC, Admin actions, Sensitive data access, Patient consent actions.
    *   [ ] Include details like authenticated user ID, action type, timestamp, target resource/user ID, success/failure status, origin IP in application logs.

### Ticket: SEC-A-2 (UPDATED for Cloud Run/GCP - Backend & Infrastructure): Refine Rate Limiting & Implement Bot Protection
*   **Status:** To Do
*   **Notes:** Basic login rate limiting mentioned for FOUND-10, comprehensive pending.
*   **Acceptance Criteria:**
    *   [ ] Comprehensive rate limiting implemented applying policies to sensitive/costly endpoints.
    *   [ ] Policies based on IP address, user ID, or other relevant factors.
    *   [ ] Mechanism for handling rate limits.
    *   [ ] Consider basic bot detection mechanisms.
    *   [ ] Configuration is manageable.

### Ticket: SEC-TEST-1 (UPDATED for Cloud Run - Backend CI): Integrate Automated Security Static Analysis (SAST) into Backend CI
*   **Status:** To Do
*   **Acceptance Criteria:**
    *   [ ] SAST tool(s) selected.
    *   [ ] Tool integrated into the CI/CD pipeline.
    *   [ ] Pipeline configured to fail the build or report vulnerabilities based on severity threshold.
    *   [ ] Results are accessible to the development team.
    *   [ ] Initial scan performed and high-severity findings addressed or triaged.

### Ticket: SEC-TEST-2 (UPDATED for Cloud Run - Backend CI): Integrate Automated Dependency Vulnerability Scanning into Backend CI
*   **Status:** To Do
*   **Acceptance Criteria:**
    *   [ ] Dependency scanning tool(s) selected.
    *   [ ] Tool integrated into the CI/CD pipeline.
    *   [ ] Pipeline configured to report or block builds based on vulnerability severity.
    *   [ ] Team notified of new critical/high vulnerabilities.
    *   [ ] Process established for regularly reviewing and updating dependencies.

### Ticket: SEC-TEST-3 (UPDATED for Cloud Run/GCP - Backend & API Testing): Set Up & Conduct Regular Automated Dynamic Analysis (DAST) Scans
*   **Status:** To Do
*   **Acceptance Criteria:**
    *   [ ] DAST tool/service selected.
    *   [ ] Scans configured to run regularly against a staging or dedicated test environment.
    *   [ ] Scan scope covers key application endpoints/APIs.
    *   [ ] Results reviewed regularly and critical/high findings addressed.
    *   [ ] Authentication handled for scans.

### Ticket: SEC-TEST-4 (Overall Project): Schedule & Perform Periodic Manual Penetration Testing
*   **Status:** To Do
*   **Acceptance Criteria:**
    *   [ ] Penetration testing scope defined.
    *   [ ] Testing conducted by qualified professionals.
    *   [ ] Detailed report received.
    *   [ ] Findings reviewed, prioritized, and addressed.
    *   [ ] Testing performed periodically.

### Ticket: SEC-OTHER-1 (UPDATED for GCP/Supabase - Backend & Infrastructure): Configure & Review Infrastructure Security Settings
*   **Status:** In Progress
*   **Notes:** Initial setup done (FOUND-3, Supabase defaults). Ongoing review and hardening needed.
*   **Acceptance Criteria:**
    *   [ ] Review and configure **GCP** security settings (Cloud Run, Logging, Scheduler, IAM, VPC).
    *   [ ] Review and configure **Supabase** security settings (Database, Auth, API, Platform Access).
    *   [ ] Regularly review these settings.

---
**END OF DOCUMENT**
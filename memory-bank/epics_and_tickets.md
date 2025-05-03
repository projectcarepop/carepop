**Jira Epics & Tickets - CarePoP/QueerCare Platform (Revised for Supabase/Cloud Run)**

**Epic 1: Core Setup, Authentication & Deployment Foundation (Supabase & GCP)**

*   **Epic Goal:** Establish essential infrastructure (**Supabase Project, Google Cloud Platform resources like Cloud Run, Cloud Logging, Cloud Secret Manager**), code repositories, CI/CD pipeline, core security utilities (**Supabase Auth, foundational Supabase RLS**, application encryption prep, logging), the foundational User database schema (**Supabase PostgreSQL**), and the critical Register/Login backend APIs (**Cloud Run Functions**) with functional frontend UI – making this core authentication flow immediately deployable to staging and verifiable via the user interface.

1.  **Ticket ID:** FOUND-1
    *   **Title:** Setup Code Repositories & Initial Project Structure
    *   **Background:** Create and structure the fundamental code repositories for our React Native frontend and Node.js backend, adhering to recommended architectural patterns (Modular Monolith backend components, modular frontend). The backend will be structured for deployment to **Google Cloud Run**.
    *   **Acceptance Criteria:**
        *   `carepop-frontend` and `carepop-backend` repositories created in source control (e.g., GitHub/GitLab).
        *   Standard folder structures for React Native + TypeScript frontend and Node.js + TypeScript backend defined. Backend structure considers deployment units for **Cloud Run**.
        *   Basic placeholder code and `.gitignore` files checked into main branches.
    *   **Technology/Implementation Suggestions:** Git, GitHub/GitLab.

2.  **Ticket ID:** FOUND-2
    *   **Title:** Configure React Native & Node.js Development Environment with TypeScript & Supabase SDK
    *   **Background:** Ensure all developers have a consistent local setup allowing them to build and run the FE (web & mobile) and BE code (**Node.js for Cloud Run**). Integrate necessary SDKs for the chosen backend stack.
    *   **Acceptance Criteria:**
        *   Project dependencies installed (e.g., React Native CLI, core RN packages, Node.js packages, **Supabase JS SDK**).
        *   TypeScript compiler configured for both frontend and backend projects.
        *   Scripts defined to start local development servers for FE (web, mobile) and BE (**Node.js server simulating Cloud Run environment**).
        *   Local builds of both projects are successful.
        *   **Basic connection setup for Supabase JS SDK in backend.**
    *   **Technology/Implementation Suggestions:** Node.js, npm/yarn, React Native CLI, TypeScript, **Supabase JS SDK**. Document setup clearly.

3.  **Ticket ID:** FOUND-3
    *   **Title:** Select, Provision, & Configure Core Cloud Infrastructure (**Google Cloud Platform & Supabase**) (Staging)
    *   **Background:** Provision the essential cloud resources (**Supabase Project, Google Cloud Platform resources like Cloud Run, Cloud Secret Manager, Cloud Logging, Cloud Scheduler**) for our initial staging environment, making the platform accessible outside local development for integration testing and review.
    *   **Acceptance Criteria:**
        *   Chosen Cloud Provider account/project ready (**Google Cloud Platform**).
        *   **Supabase Project provisioned for staging environment, including PostgreSQL database instance.**
        *   Minimum necessary compute resources (**Google Cloud Run services** for backend APIs) provisioned for staging.
        *   **Supabase PostgreSQL database** is securely accessible from **Google Cloud Run services** (e.g., using VPC connector if needed, or private IP if available).
        *   Network access configured for staging environment (secure ingress to **Cloud Run**, secure connections from **Cloud Run** to **Supabase**).
        *   **Google Cloud Secret Manager** provisioned for staging secrets.
        *   **Google Cloud Logging** configured for log sinks.
        *   All staging URLs/IPs (**Cloud Run endpoints, Supabase project URL**) documented.
    *   **Technology/Implementation Suggestions:** Evaluate AWS/GCP/Azure based on DPA/HIPAA potential, focusing on **GCP services (Cloud Run, Cloud SQL for backups - future Epic, Cloud Secret Manager, Cloud Logging, Cloud Scheduler)**. **Supabase Platform**. Secure configurations (VPC, Firewall Rules in GCP, Supabase network settings).

4.  **Ticket ID:** FOUND-4
    *   **Title:** Implement Structured Logging and Configuration Management (**Cloud Logging & Secret Manager**)
    *   **Background:** Implement logging with severity levels and structured output (JSON) suitable for centralized logging (**Google Cloud Logging**), and set up external configuration loading (**Google Cloud Secret Manager**).
    *   **Acceptation Criteria:**
        *   Logging library (e.g., Winston/Pino) integrated into BE (**Cloud Run services**) projects, configured for different levels.
        *   Logs formatted in a structured way (e.g., JSON lines) when running outside local dev, directed to **Google Cloud Logging**.
        *   Configuration management setup loads secrets/config from **Google Cloud Secret Manager** (for Cloud Run) and **Supabase Project Settings/Secrets** (for Supabase JS SDK keys).
        *   Example usage in startup code (**Cloud Run**) and one BE endpoint confirms logging/config retrieved from **Secret Manager**.
        *   **Supabase built-in logging is reviewed.**
    *   **Technology/Implementation Suggestions:** Winston/Pino for Node.js on **Cloud Run**. **Google Cloud Logging**. **Google Cloud Secret Manager**. **Supabase Project Settings**.

5.  **Ticket ID:** FOUND-5
    *   **Title:** Configure CI/CD Pipeline (Build, Test, Deploy to Staging) (**Cloud Run & Supabase**)
    *   **Background:** Automate the process of building, testing, and deploying code changes to our staging environment (**Google Cloud Run, Supabase Functions**) to ensure quick validation and deployment readiness.
    *   **Acceptance Criteria:**
        *   CI/CD pipeline configured using chosen service (GitHub Actions, GitLab CI, etc.).
        *   Pipeline triggers on push to main branches.
        *   Pipeline runs code linting and basic unit tests (once testing framework is setup - FOUND-6).
        *   Pipeline successfully builds FE (mobile, web) and BE (**Cloud Run container images, Supabase Function code**).
        *   Pipeline deploys the artifacts to the configured staging environment infrastructure (**Google Cloud Run services, Supabase project**).
        *   Notifications for pipeline success/failure configured (e.g., to team chat).
    *   **Technology/Implementation Suggestions:** GitHub Actions, GitLab CI, Jenkins. Integrate with **Google Cloud Run deployment mechanisms**, **Supabase CLI/API for Functions deployment**.

6.  **Ticket ID:** FOUND-6
    *   **Title:** Set up Basic Testing Frameworks & Initial Unit Tests
    *   **Background:** Implement test runners and write minimal tests to confirm CI/CD integration and establish testing practice early.
    *   **Acceptance Criteria:**
        *   Testing framework integrated for BE (**Cloud Run Node.js code**) (e.g., Jest, Mocha).
        *   Testing framework integrated for FE (e.g., Jest, React Native Testing Library).
        *   A simple BE unit test (e.g., math function).
        *   A simple FE unit test (e.g., component renders without crashing).
        *   Test commands integrated into `package.json` scripts.
        *   Confirm these tests run successfully in the CI pipeline (FOUND-5).
    *   **Technology/Implementation Suggestions:** Jest, React Native Testing Library, Mocha/Chai.

7.  **Ticket ID:** FOUND-7 (REPLACED by Supabase Auth)
    *   **Title:** Configure Supabase Authentication
    *   **Background:** Set up **Supabase's built-in authentication system** for secure user registration and login.
    *   **Acceptance Criteria:**
        *   **Supabase Authentication enabled and configured in the Supabase project.**
        *   **Email/Password authentication provider enabled.**
        *   **Basic email confirmation setup configured (if required by product/security).**
        *   Users can be created via the **Supabase Auth API**.
        *   Users can log in via the **Supabase Auth API** and receive tokens (JWT).
        *   **Supabase client JS SDK initialized with project URL and Anon key.**
    *   **Technology/Implementation Suggestions:** **Supabase Platform (Auth section), Supabase JS SDK.**

8.  **Ticket ID:** FOUND-8 (UPDATED for Supabase)
    *   **Title:** Design & Implement Foundational User Database Schema (**Supabase**) (Authentication Focus)
    *   **Background:** Define the minimum schema needed to support secure user registration and login within **Supabase PostgreSQL**, linked to its authentication, and implement basic **Row Level Security (RLS)**.
    *   **Acceptance Criteria:**
        *   **`users` table schema verified (managed by Supabase Auth).**
        *   **Additional `profiles` table created in Supabase PostgreSQL for basic user-specific data (linked via `user_id` to Supabase Auth `users.id` with appropriate foreign key/constraints).**
        *   Basic `created_at`, `updated_at` timestamps added to `profiles` table.
        *   **Row Level Security (RLS) enabled on the `profiles` table.**
        *   **Initial RLS policies defined and implemented on `profiles`** to allow authenticated users to view and edit *only their own* profile (`user_id = auth.uid()`).
        *   **Supabase JS SDK configured to interact with the `profiles` table.**
        *   Ensure appropriate indexing (e.g., on email in Auth, on `user_id` in `profiles`).
        *   **Supabase migrations created to apply the schema.**
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL, Supabase RLS, Supabase migrations, Supabase JS SDK.**

9.  **Ticket ID:** FOUND-9 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Secure User Registration
    *   **Background:** Create the backend endpoint (**Google Cloud Run function**) for new user registration, leveraging **Supabase Authentication** and storing basic profile data.
    *   **Acceptance Criteria:**
        *   **POST `/api/auth/register` endpoint implemented as a Google Cloud Run function.**
        *   API accepts email and password.
        *   Implement initial input validation (basic checks) within the **Cloud Run function**.
        *   **Utilize Supabase JS SDK within the Cloud Run function to call `supabase.auth.signUp()` with email and password.**
        *   **If Supabase Auth signup is successful, automatically create a corresponding entry in the `profiles` table (FOUND-8) linked to the new `auth.uid()`. This might require using the `service_role` key or listening to Supabase Auth webhooks from Cloud Run.**
        *   Handles email uniqueness constraint gracefully (managed by **Supabase Auth**).
        *   API returns 201 Created on success or 400/409 on failure.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Input validation library (Joi/validator.js). **Supabase JS SDK (potentially with `service_role` or webhook handling setup on Cloud Run).**

10. **Ticket ID:** FOUND-10 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Secure User Login & Token Generation
    *   **Background:** Implement the endpoint (**Google Cloud Run function**) for user authentication, using **Supabase Authentication** to issue tokens on success.
    *   **Accept criteria:**
        *   **POST `/api/auth/login` endpoint implemented as a Google Cloud Run function.**
        *   API accepts email and password.
        *   Implement input validation within the **Cloud Run function**.
        *   **Utilize Supabase JS SDK within the Cloud Run function to call `supabase.auth.signInWithPassword()` with email and password.**
        *   **If verification succeeds, Supabase Auth returns an authentication token (JWT). The Cloud Run function returns this token to the frontend.**
        *   **API returns 200 OK with token on success, 401 Unauthorized on failure (or 400 if input invalid). Avoid leaking "user exists" info on failure.**
        *   Basic rate limiting added for this endpoint (potentially via middleware on **Cloud Run** or **GCP Load Balancer/Cloud Armor**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. **Supabase JS SDK**. **Google Cloud Run rate limiting/Cloud Armor.**

---
**Task ID:** FE-SETUP-1 (NEW)
*   **Title:** Establish Frontend Monorepo Structure & Dev Environment
*   **Background:** Set up the Turborepo monorepo using pnpm, initialize Next.js (`apps/web`) and React Native CLI (`apps/nativeapp`) applications, configure shared packages (`tailwind-config`, `ui` placeholder), and ensure basic development environments (`pnpm run dev`, including Android build) are functional.
*   **Acceptance Criteria:**
    *   `carepop-monorepo` created using Turborepo/pnpm.
    *   `apps/web` (Next.js + Tailwind) initialized and configured.
    *   `apps/nativeapp` (RN CLI) initialized and configured.
    *   Shared `packages/tailwind-config` created.
    *   Shared `packages/ui` placeholder created.
    *   `.npmrc` configured for pnpm (attempted hoisting control).
    *   Android build files (`settings.gradle`, `app/build.gradle`) modified to point to root `node_modules`.
    *   Metro config (`metro.config.js`) adjusted for monorepo and `blockList` fix applied.
    *   `pnpm run dev` successfully starts both web and native development servers.
    *   `pnpm --filter nativeapp run android` successfully builds and installs the Android app.
*   **Status:** DONE
---

**Epic 2: UI/UX Design System & Core Components (MVP Kickoff)**

*   **Epic Goal:** Define the initial visual design language and build the absolute core reusable UI components using **React Native `StyleSheet` and shared theme tokens**, allowing feature Epics to immediately consume them for a consistent look and feel.

1.  **Ticket ID:** UI-1 (REVISED)
    *   **Title:** Define & Implement Shared Theme
    *   **Background:** Establish a shared theme system (`packages/ui/src/theme.ts`) containing design tokens (colors, spacing, typography, radii) to be consumed by `StyleSheet` across shared components.
    *   **Acceptance Criteria:**
        *   `theme.ts` file created with initial color palette, spacing scale, font sizes, and border radii.
        *   Theme tokens are easily importable and usable within `StyleSheet.create` calls in `packages/ui`.
        *   Theme structure is extensible for future additions (e.g., shadows, typography weights).
    *   **Technology/Implementation Suggestions:** TypeScript constants/objects in `theme.ts`. Consider platform-specific values if needed later.

2.  **Ticket ID:** UI-2 (REVISED)
    *   **Title:** Build Core Reusable Components - Buttons
    *   **Background:** Create a reusable `Button` component within `packages/ui` using `StyleSheet` and the shared theme.
    *   **Acceptance Criteria:**
        *   `Button.tsx` component created in `packages/ui`.
        *   Component accepts necessary props (`title`, `onPress`, `variant`, `disabled`, `style`, `titleStyle`).
        *   Component uses `StyleSheet` for styling.
        *   Styles utilize tokens defined in `packages/ui/src/theme.ts`.
        *   Supports at least 'primary' and 'secondary' variants, plus a disabled state.
        *   Component renders correctly and is functional in `apps/nativeapp`.
        *   Component renders and is styled appropriately in `apps/web` (requires testing).
    *   **Technology/Implementation Suggestions:** React Native `Pressable`, `Text`, `StyleSheet`. Import theme tokens.

3.  **Ticket ID:** UI-3 (REVISED)
    *   **Title:** Build Core Reusable Components - Form Inputs
    *   **Background:** Create reusable form input components (e.g., `TextInput`) using `StyleSheet` and theme tokens.
    *   **Acceptance Criteria:**
        *   Basic `TextInput` component created in `packages/ui`.
        *   Uses `StyleSheet` and theme tokens for styling (border, padding, text color, etc.).
        *   Handles basic props (`value`, `onChangeText`, `placeholder`, `secureTextEntry`, etc.).
        *   Includes styling for focus states (if applicable).
        *   Renders correctly in `nativeapp` and `web` (requires testing).
    *   **Technology/Implementation Suggestions:** React Native `TextInput`, `StyleSheet`. Import theme tokens.

4.  **Ticket ID:** UI-4 (REVISED)
    *   **Title:** Build Core Reusable Components - Layout (Card, Container)
    *   **Background:** Create basic layout components like `Card` or styled `View` containers using `StyleSheet` and theme tokens.
    *   **Acceptance Criteria:**
        *   `Card.tsx` (or similar) component created in `packages/ui`.
        *   Uses `StyleSheet` and theme tokens (e.g., background color, border radius, padding, shadows if defined).
        *   Accepts `children` prop.
        *   Renders correctly in `nativeapp` and `web` (requires testing).
    *   **Technology/Implementation Suggestions:** React Native `View`, `StyleSheet`. Import theme tokens.

5.  **Ticket ID:** UI-5 (No change needed here, depends on UI-1 to UI-4)
    *   **Title:** Implement Frontend UI: User Registration Screen (Functional)
    *   ...

6.  **Ticket ID:** UI-6 (No change needed here, depends on UI-1 to UI-4)
    *   **Title:** Implement Frontend UI: User Login Screen (Functional)
    *   ...

**Epic 3: Secure Client Handling, Supabase RLS & Foundational DPA Consent**

*   **Epic Goal:** Ensure **Supabase Auth tokens** are handled securely client-side, apply foundational RBAC logic to control API access via **Supabase RLS** and backend checks, and integrate the DPA consent flow into user management (**Supabase DB**). This ensures the base authentication layer meets security/compliance needs and prepares for data access controls.

1.  **Ticket ID:** SEC-BE-1 (UPDATED for Supabase RLS)
    *   **Title:** Implement RBAC Roles, Permission Concepts, and Foundational Supabase RLS
    *   **Background:** Design the conceptual roles and permissions. Implement the necessary database structures (**in Supabase**) and foundational **Row Level Security (RLS) policies** to enforce these permissions directly at the database level, forming the primary basis of our access control system.
    *   **Acceptance Criteria:**
        *   Conceptual roles (Patient, Provider, Admin) and basic permissions (e.g., `view_own_profile`, `view_any_user_profile`, `manage_inventory`) defined and documented.
        *   Database tables created in **Supabase PostgreSQL** for `roles` and potentially `user_roles` (or leverage **Supabase Auth `app_metadata`**).
        *   **Row Level Security (RLS) enabled on key tables including `profiles` (FOUND-8) and any other initial tables containing user data.**
        *   **Initial RLS policies defined and implemented** to allow users to access their *own* data (`user_id = auth.uid()`) for relevant tables.
        *   **Supabase JS SDK configured to interact with tables respecting RLS.**
        *   Basic unit tests for schema relationships and **initial RLS policies (using Supabase testing capabilities or helper scripts)**.
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL, Supabase RLS**, Prisma/TypeORM (optional, within Cloud Run functions). **Supabase migrations**.

2.  **Ticket ID:** SEC-BE-2 (UPDATED for Cloud Run/Supabase Auth)
    *   **Title:** Implement Backend Authentication Middleware (**Cloud Run/Supabase Auth Integration**)
    *   **Background:** Create reusable middleware (**for Google Cloud Run services** or utilize **Supabase Edge Function auth features**) to protect backend endpoints, ensuring only authenticated users can access them and fetching the user's identity/roles (**from Supabase Auth**) for subsequent checks.
    *   **Acceptance Criteria:**
        *   Middleware function created (**for Google Cloud Run, or utilize Supabase Edge Function auth helper**) that intercepts requests to protected routes.
        *   Middleware checks for a valid authentication token (JWT) in the request headers (`Authorization: Bearer ...`).
        *   **Utilizes Supabase JS SDK (or built-in Edge Function helpers) to verify token validity (`supabase.auth.getUser(token)` or similar logic) and retrieve the authenticated user's object/ID from Supabase Auth.**
        *   Looks up the corresponding user's roles (**from Supabase Auth `app_metadata` or related tables in Supabase**) and attaches user object/ID and roles to the request context (e.g., `req.user`).
        *   Allows valid requests to proceed, sends 401 Unauthorized for invalid/missing tokens.
        *   Apply this middleware to a non-auth endpoint to confirm functionality.
    *   **Technology/Implementation Suggestions:** Node.js/TypeScript middleware (**for Cloud Run**). **Supabase JS SDK Auth helpers**, **Supabase Edge Functions built-in auth helpers**.

3.  **Ticket ID:** SEC-BE-3 (UPDATED for Supabase RLS & Backend Checks)
    *   **Title:** Implement Core RBAC Enforcement (**Supabase RLS & Backend Checks**)
    *   **Background:** Build logic to enforce permissions based on user roles and data ownership, primarily leveraging **Supabase RLS**, supplemented by checks within backend code (**Cloud Run Functions/Services**) where RLS is insufficient (e.g., admin actions, complex data relationships).
    *   **Acceptance Criteria:**
        *   **Supabase RLS policies** designed and implemented for core data access scenarios based on user roles (`auth.role()`) and user ID (`auth.uid()`) on relevant tables.
        *   **Backend code (Cloud Run functions/services)** implements explicit authorization checks for complex scenarios or actions requiring elevated privileges (e.g., admin actions like managing any user profile, or processes needing to read potentially all sensitive data for aggregation/anonymization). These checks use user/role info from authenticated context (SEC-BE-2) and might involve querying `roles` or `user_roles` tables in **Supabase**.
        *   **Logic in backend code uses a Supabase `service_role` key *only when necessary* (e.g., for admin actions or data aggregation before anonymization)**, but *always* performs application-level authorization *after* obtaining the user context. Access using `service_role` is logged (SEC-A-1).
        *   Implement **Deny by Default** principle via **Supabase RLS** (it's deny by default unless `ALLOW` policies exist) and application code.
        *   Integrate this logic into at least one authenticated API endpoint (e.g., PROF-2, PROF-3) to verify enforcement.
        *   Admin actions and sensitive data access attempts logged (SEC-A-1).
    *   **Technology/Implementation Suggestions:** **Supabase RLS**, **Supabase JS SDK (`service_role` key usage)**, Node.js/TypeScript application logic (**in Cloud Run functions/services**).

4.  **Ticket ID:** SEC-FE-1 (UPDATED for Supabase Token)
    *   **Title:** Implement Secure Client-Side Authentication Token Storage & Retrieval (**Supabase Token**)
    *   **Background:** Store and retrieve the **Supabase Authentication token (JWT)** received from the backend (**FOUND-10 Cloud Run function**) securely on the user's device.
    *   **Acceptance Criteria:**
        *   A secure client-side storage solution integrated (@react-native-community/keychain for native, potentially HttpOnly Secure cookies or similar for web).
        *   **Supabase Auth token** from successful login is stored using the secure solution.
        *   Stored token can be securely retrieved when needed for authenticated API calls (**to Supabase auto-generated APIs or Cloud Run functions**).
        *   Logout functionality removes the token securely from storage.
        *   Tested on both web and mobile platforms regarding storage location validity and security implications (OWASP Mobile Top 10, OWASP Web Security Testing Guide).
    *   **Technology/Implementation Suggestions:** `@react-native-community/keychain` for native. For web, prioritize HttpOnly Secure cookies over localStorage for JWTs; session IDs managed backend are also viable (if moving away from stateless Supabase JWTs). Node.js OWASP cheatsheet guidance. **Supabase JS SDK methods for session management.**

5.  **Ticket ID:** SEC-BE-4 (UPDATED for Supabase)
    *   **Title:** Update User Schema (**Supabase**) & Backend Registration to Store Consent
    *   **Background:** Modify the user database schema (**Supabase PostgreSQL `profiles` table**) and registration API (**FOUND-9 Cloud Run function**) to record that a user has given their explicit DPA consent.
    *   **Acceptance Criteria:**
        *   **`profiles` table schema (FOUND-8) updated in Supabase PostgreSQL to include field(s) for consent status (e.g., `consent_given` boolean, or a JSONB field for granular consent).**
        *   Migration script created to update the database schema (**Supabase migrations**).
        *   Backend registration API (**FOUND-9 Cloud Run function**) modified to receive the user's consent selection and store it in the **Supabase `profiles` table**.
        *   Consent recording happens transactionally with user creation.
        *   **Supabase RLS policies reviewed/updated** to potentially restrict access to certain data based on consent status (implemented in later Epics like TRACKING).
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL schema alterations, Supabase migrations**. Node.js/TypeScript logic (**in FOUND-9 Cloud Run function**).

6.  **Ticket ID:** SEC-FE-2 (UPDATED for Cloud Run endpoint)
    *   **Title:** Implement Frontend UI: Integrate DPA Consent into Registration
    *   **Background:** Modify the registration UI to include the necessary consent mechanisms as defined by DPA requirements, submitting data to the updated backend (**Cloud Run function**).
    *   **Acceptance Criteria:**
        *   User Registration screen (UI-5) modified to display privacy notice text (or link) and the explicit consent checkbox(es).
        *   Consent field data sent to the backend registration API (**SEC-BE-4 Cloud Run function**) upon form submission.
        *   Client-side validation enforces that consent is given (at least for required items) before submission.
        *   UI styling uses established components and tokens.
    *   **Technology/Implementation Suggestions:** React Native UI components (CheckBox, Text, Linking API). Integrate with form data handling in UI-5, calling the **Cloud Run endpoint** (`/api/auth/register`). Requires text/content input from FPOP/Legal.

7.  **Ticket ID:** SEC-BE-5 (UPDATED for GCP & Supabase)
    *   **Title:** Configure Secure HTTPS/TLS for Staging Environment (**GCP & Supabase**)
    *   **Background:** Ensure all traffic to and from our staging environment (**Google Cloud Run endpoints, Supabase project**) is encrypted.
    *   **Acceptance Criteria:**
        *   TLS certificates obtained and configured for the staging environment domain/IP.
        *   **Google Cloud Run service(s) configured to accept only HTTPS traffic.**
        *   **Supabase project configured for secure connections (HTTPS/TLS).**
        *   Verify that all frontend communication with the staging backend (**Cloud Run, Supabase**) uses HTTPS.
        *   Configuration enforces recommended TLS versions (TLS 1.2+) and excludes weak ciphers.
    *   **Technology/Implementation Suggestions:** **Google Cloud Load Balancer/Cloud Run SSL config**, **Supabase SSL configuration**.

**Epic Y: Healthcare Provider Directory (Full Features & SEO)**

*   **Epic Goal:** Fully implement the Provider and Facility directory, adding advanced search capabilities (filters, location-based), map integration with navigation linking, comprehensive backend admin management, and crucial search engine optimization (SEO) for web visibility. This builds directly on the foundation laid in Epic 3 tickets DR-1 through DR-7. Data stored in **Supabase**. Backend logic in **Cloud Run Functions**.

1.  **Ticket ID:** DIR-1 (UPDATED for Supabase)
    *   **Title:** Refine Provider/Facility Database Schema (**Supabase**) & Add Indexing for Advanced Search
    *   **Background:** Enhance the directory schemas in **Supabase PostgreSQL** to include all planned attributes (languages, services, LGBTQ+-affirming flag, detailed consultation hours, accessibility) and ensure indexing supports complex search queries including location.
    *   **Acceptance Criteria:**
        *   Existing Facilities and Providers schemas (**in Supabase PostgreSQL**) updated with necessary fields.
        *   Add indexing (e.g., GiST for geo queries, full-text search indexes for names/specialties if needed) in **Supabase PostgreSQL** to support filtering and location-based searches efficiently.
        *   Database migrations scripts created and tested (**Supabase migrations**).
        *   **Supabase RLS policies defined** to allow public read access to directory data while restricting write access to admin roles.
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL schema design, PostGIS extension enabled in Supabase**. **Supabase migrations**. Use **Supabase SDK** for interactions or direct SQL.

2.  **Ticket ID:** DIR-2 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Advanced Directory Search with Filters & Location
    *   **Background:** Implement the API endpoint (**Google Cloud Run function**) capable of handling search queries with multiple filters (specialty, language, services, potentially keywords) and location proximity search, calling **Supabase**.
    *   **Acceptance Criteria:**
        *   `/api/directory/search` endpoint implemented as a **Google Cloud Run function**.
        *   API accepts filter parameters and optional location coordinates/radius.
        *   Backend logic constructs efficient database queries (**in Supabase**, leveraging DIR-1 indexes) based on filter combinations and location (geo query). **Utilizes Supabase JS SDK or direct SQL from Cloud Run function.**
        *   Results ordered by relevance or proximity if location is used.
        *   API returns paginated results including necessary data for listings.
        *   **RBAC: Ensure public read access to this endpoint. Supabase RLS policies (DIR-1) handle data access.**
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. **Supabase JS SDK**, direct SQL for geo/full-text search in **Supabase**. Need to decide on search engine vs. DB search strategy here – initial is **Supabase DB search**.

3.  **Ticket ID:** DIR-3 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Functions**): Admin Management (Full CRUD for Providers/Facilities)
    *   **Background:** Create secure APIs (**Google Cloud Run functions**) allowing administrators to manage provider and facility records, interacting with **Supabase**.
    *   **Acceptance Criteria:**
        *   GET, POST, PUT, DELETE endpoints implemented as **Google Cloud Run functions** for `/api/admin/providers` and `/api/admin/facilities`.
        *   Crucially: **RBAC Enforcement via application-level checks in the Cloud Run function:** Access granted only to users with Admin roles (`admin_manage_providers`, `admin_manage_facilities` permissions) obtained via **Supabase Auth/roles**. **Cloud Run function verifies the calling user's admin role and then uses a Supabase `service_role` key to bypass RLS *for writes/deletes* on the directory tables.**
        *   Robust input validation applied within the **Cloud Run function**.
        *   Admin actions logged (**in Google Cloud Logging**).
        *   Includes logic for Geocoding address on create/update (**potentially calling Geocoding API from the Cloud Run function**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication Middleware (**Supabase Auth integration**). RBAC Middleware/logic (**SEC-BE-3 principles**). **Supabase JS SDK (`service_role` key)**. Logging calls (**Google Cloud Logging**). Geocoding API integration.

4.  **Ticket ID:** DIR-4
    *   **Title:** Implement Frontend UI: Advanced Directory Search Filters & Location Input
    *   **Background:** ... (Remains the same) ...
    *   **Acceptance Criteria:**
        *   Search screen (DR-5) updated with expandable filter options (e.g., dropdowns, checkboxes for specialty, language).
        *   UI element for entering/detecting user location (user consent needed - requires separate permission handling later).
        *   Filter and location data sent to the backend advanced search API (**DIR-2 Cloud Run function**).
        *   Search results display visually incorporates filtered criteria.
        *   UI uses established components (Epic 6) and design system.
    *   **Technology/Implementation Suggestions:** React Native UI components. React Native Geolocation library (requires user permission handling). State management for filter values and results. Connect to **Cloud Run endpoint**.

5.  **Ticket ID:** DIR-5
    *   **Title:** Implement Frontend UI: Display Search Results on Map & List View Toggle
    *   **Background:** ... (Remains the same) ...
    *   **Acceptance Criteria:** ... (Remains the same) ...
    *   **Technology/Implementation Suggestions:** React Native map library (`react-native-maps`). Optimize rendering for multiple markers. Syncing state between list and map views. Uses data from **DIR-2 Cloud Run function**.

6.  **Ticket ID:** DIR-6
    *   **Title:** Implement Frontend UI: Deep-Linking for Navigation
    *   **Background:** ... (Remains the same) ...
    *   **Acceptance Criteria:** ... (Requires destination coordinates from backend - **DIR-2 Cloud Run function**).
    *   **Technology/Implementation Suggestions:** React Native Linking API (`Linking.openURL`) with appropriate URI schemes for map apps. Requires passing destination coordinates from backend API (**DIR-2 Cloud Run function**).

7.  **Ticket ID:** DIR-7
    *   **Title:** Implement Frontend Admin UI: Provider/Facility Management Screens (List/Add/Edit)
    *   **Background:** ... (Remains the same) ...
    *   **Acceptance Criteria:**
        *   Screens developed for Admin roles to list, add new, and edit existing providers and facilities.
        *   Screens utilize core UI components (Epic 6).
        *   Add/Edit forms correspond to the updated database schema (**DIR-1 in Supabase**) and send data to backend Admin APIs (**DIR-3 Cloud Run functions**).
        *   Input validation presentation client-side (mirroring backend DIR-3).
        *   Display relevant information including coordinates and applied filters.
        *   Access to these screens is protected client-side based on user role (but primary protection is backend **Supabase RLS/Cloud Run checks**).
    *   **Technology/Implementation Suggestions:** React Native. Reusable form components, list components (FlatList/SectionList). Connect to backend Admin APIs (**DIR-3 Cloud Run functions**).

8.  **Ticket ID:** DIR-8
    *   **Title:** Refine Web SSR/SSG for Public Directory Pages & Implement Canonical Tags (**GCP/Cloud Run Hosting**)
    *   **Background:** Enhance the initial web rendering setup to ensure all relevant public directory pages (listings, maybe filtered views) are fully rendered for search engines, leveraging the chosen web hosting platform (**GCP/Cloud Run**). Implement canonical URLs.
    *   **Acceptance Criteria:**
        *   All intended public directory routes deliver complete HTML content on the initial server response or build phase (**via SSR/SSG on GCP/Cloud Run hosting**).
        *   This includes search result pages (using data from **DIR-2 Cloud Run function**) and individual provider/facility detail pages.
        *   Client-side React hydration occurs correctly after the initial render.
        *   Implement dynamic `<link rel="canonical">` tags on detail pages and potentially parameterized search result pages to avoid duplicate content issues.
    *   **Technology/Implementation Suggestions:** Refine Next.js setup or custom SSR logic (**deployed on GCP/Cloud Run**). Ensure all necessary data is fetched server-side for rendering (calling backend APIs like **DIR-2 Cloud Run function**). HTML head management library.

9.  **Ticket ID:** DIR-9
    *   **Title:** Implement Detailed Schema.org Markup for Directory Entries (Web)
    *   **Background:** Expand on basic Schema.org implementation to provide search engines with rich, structured data about providers and facilities, improving visibility and rich result potential. Markup generated based on data from backend (**DIR-2 Cloud Run function**).
    *   **Acceptance Criteria:** ... (Remains the same) ...
    *   **Technology/Implementation Suggestions:** Dynamically generate JSON-LD script tags in the server-rendered HTML based on data from the backend (**DIR-2 Cloud Run function**).

10. **Ticket ID:** DIR-10
    *   **Title:** Optimize Web Performance & Technical SEO for Directory Pages (**GCP/Cloud Run**)
    *   **Background:** Focus on speed and crawler-friendliness for the most public part of the web application, hosted on **GCP/Cloud Run**.
    *   **Acceptance Criteria:**
        *   Review Core Web Vitals for key directory pages (mobile and desktop views using web).
        *   Identify and fix major performance bottlenecks (e.g., large images, slow asset loading, excessive JavaScript on initial load).
        *   Ensure clean URLs (as set in DIR-9 and DIR-8).
        *   Generate and maintain an XML sitemap covering all public directory pages.
        *   Configure a robust `robots.txt` file.
        *   Set up basic web analytics (e.g., Google Analytics) to track page views and user behavior on the web.
    *   **Technology/Implementation Suggestions:** Use performance profiling tools (Lighthouse, WebPageTest). Image optimization libraries/services. Web hosting configuration (**GCP/Cloud Run, Cloud CDN** usage). SEO tools.

**Epic APPT-USER: Appointment Scheduling (Completing User Flows)**

*   **Epic Goal:** Finalize the user-facing side of the appointment booking and management features, allowing users to smoothly browse availability, request appointments, and view/cancel their own bookings, while ensuring secure access controls enforced by **Supabase RLS** and backend checks. This builds on the API foundations from Epic 4. Data stored in **Supabase**. Backend logic in **Cloud Run Functions**.

1.  **Ticket ID:** APP-USER-1 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Fetch User's Future Appointments (Details)
    *   **Background:** Refine the API (**Google Cloud Run function**) to fetch details of an authenticated user's upcoming appointments from **Supabase**.
    *   **Acceptance Criteria:**
        *   GET `/api/users/me/appointments` endpoint implemented as a **Google Cloud Run function**.
        *   **Ensures RBAC Enforcement via Supabase RLS**: **Supabase RLS policies on the `appointments` table** ensure only the authenticated user can access *their own* appointments (`user_id = auth.uid()`). The **Cloud Run function accesses Supabase using the user's authenticated context/token.**
        *   API queries upcoming appointments from the **Supabase `appointments` table** linked to the authenticated user.
        *   API returns list of upcoming appointments with details (date, time, linked provider name/specialty).
        *   Supports basic sorting (e.g., by date/time).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication Middleware (**Supabase Auth integration**). **Supabase JS SDK**, **Supabase RLS**. ORM queries (optional, within Cloud Run).

2.  **Ticket ID:** APP-USER-2 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Fetch User's Past/Cancelled Appointments
    *   **Background:** Add functionality to the appointments API (**Google Cloud Run function**) to allow fetching past or cancelled bookings for the logged-in user from **Supabase**.
    *   **Acceptance Criteria:**
        *   Update `/api/users/me/appointments` endpoint (implemented as **Cloud Run function**) to accept a status filter (e.g., `?status=past` or`?status=cancelled`).
        *   **RBAC Enforcement via Supabase RLS is applied.**
        *   API queries appointments linked to the user with the specified status from **Supabase `appointments` table**.
        *   API returns list of relevant appointments.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. **Supabase JS SDK**, **Supabase RLS**. ORM queries (optional, within Cloud Run) filtering by user ID and status field.

3.  **Ticket ID:** APP-USER-3
    *   **Title:** Implement Frontend UI: Interactive Availability Calendar View
    *   **Background:** ... (Remains the same) ... Uses data from backend API (**likely a new Cloud Run Function** for available slots, connecting to **Supabase** availability data).
    *   **Acceptance Criteria:** ... (Remains the same) ...
    *   **Technology/Implementation Suggestions:** React Native calendar libraries. Integrate with backend availability API (**new Cloud Run Function**). Manage frontend state for selected date.

4.  **Ticket ID:** APP-USER-4
    *   **Title:** Implement Frontend UI: Display & Select Available Time Slots
    *   **Background:** ... (Remains the same) ... Uses data from backend API (**Cloud Run Function**).
    *   **Acceptance Criteria:** ... (Remains the same) ...
    *   **Technology/Implementation Suggestions:** React Native UI components. Display list of times. Frontend state to track selected slot. Uses data from backend API (**Cloud Run Function**).

5.  **Ticket ID:** APP-USER-5
    *   **Title:** Implement Frontend UI: Appointment Booking Confirmation Flow
    *   **Background:** ... (Remains the same) ... Submits to backend booking API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   Confirmation modal or separate screen showing summary of selected appointment (provider, date, time).
        *   Clear button/action to 'Confirm Booking'.
        *   Action triggers call to backend booking API (**APP-USER-3 Cloud Run function** - *note: this ticket should call a dedicated booking creation endpoint, not the availability one*) with selected slot ID and user ID (implicitly via auth token).
        *   Visual feedback provided (loading, success/failure).
        *   Success directs user (e.g., to "My Appointments"). Failure displays error message.
        *   UI uses established UI components (Epic 6).
    *   **Technology/Implementation Suggestions:** React Native Modal, View. State management. API calls to **Cloud Run endpoint** (`/api/users/me/appointments` POST, or similar).

6.  **Ticket ID:** APP-USER-6
    *   **Title:** Implement Frontend UI: My Appointments Screen (List & Filter)
    *   **Background:** ... (Remains the same) ... Fetches data from backend API (**Cloud Run Functions**).
    *   **Acceptance Criteria:**
        *   Dedicated 'My Appointments' screen accessible from main navigation.
        *   Uses components (Epic 6) like Tabs or Filters to switch between 'Upcoming', 'Past', 'Cancelled' lists.
        *   Each list section fetches data from backend API (**APP-USER-1, APP-USER-2 Cloud Run functions**) using appropriate filters.
        *   List items display appointment details clearly (provider, time, status, date).
        *   Utilizes performant list components (FlatList/SectionList).
        *   Visual styling consistent with design system.
    *   **Technology/Implementation Suggestions:** React Native View, List components. State management for filter/tab selection and lists. Connect to backend APIs (**Cloud Run endpoints**).

7.  **Ticket ID:** APP-USER-7
    *   **Title:** Implement Frontend UI: My Appointment Detail View & Cancellation Action
    *   **Background:** ... (Remains the same) ... Calls backend cancellation API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   Accessible from 'My Appointments' list (APP-USER-6).
        *   Displays full appointment details (date, time, provider info, facility info).
        *   If appointment status allows cancellation, show a prominent 'Cancel Appointment' button.
        *   Button action presents a confirmation dialog.
        *   Confirmation dialog calls backend cancellation API (**APP-ADMIN-4 Cloud Run function**).
        *   Visual feedback on cancellation success/failure.
        *   Upon successful cancellation, refresh list or navigate back.
        *   UI uses established UI components (Epic 6).
    *   **Technology/Implementation Suggestions:** React Native screens, Button, Modal/AlertDialog. State management. API calls to **Cloud Run endpoint**. Ensure conditional display of cancel button based on appointment status logic (could be frontend or backend logic in **Cloud Run function**).

**Epic APPT-ADMIN/NOTIF: Appointment Scheduling (Admin/Provider & Notifications)**

*   **Epic Goal:** Implement the administrative and provider-facing functionalities for managing schedules and appointments, and integrate the system with a notification service for sending automated reminders. This requires specific RBAC permissions enforced via **Supabase RLS** and **Cloud Run application-level checks**. Data stored in **Supabase**. Backend logic in **Cloud Run Functions** triggered by APIs or **Cloud Scheduler**.

1.  **Ticket ID:** APP-ADMIN-1 (UPDATED for Supabase)
    *   **Title:** Refine Provider Availability Schema (**Supabase**) (Management Focus)
    *   **Background:** Ensure the schema in **Supabase PostgreSQL** accurately captures recurring patterns, exceptions, and buffer times required for administrative and provider management.
    *   **Acceptance Criteria:**
        *   **`AvailabilitySlot` schema in Supabase PostgreSQL** supports defining recurrence rules (e.g., RRule format or simpler flags like Mon-Fri), start/end times, and applying specific date overrides/exceptions.
        *   Supports defining buffer time after slots.
        *   Schema is correctly implemented and updated via **Supabase migrations**.
        *   **Supabase RLS policies defined** to allow Providers to view/manage only their own availability and Admins to manage all.
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL schema design. Supabase migrations**. Consider library for handling recurrence rules (**within a Cloud Run function/service**).

2.  **Ticket ID:** APP-ADMIN-2 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Functions**): Admin/Provider Manage Availability
    *   **Background:** Create secure APIs (**Google Cloud Run functions**) allowing authorized administrators and providers to set up and update their schedules in **Supabase**.
    *   **Acceptance Criteria:**
        *   Secured endpoints implemented as **Google Cloud Run functions** for CRUD on `/api/admin/availability` or `/api/providers/me/availability`.
        *   **RBAC Enforcement via Supabase RLS and application-level checks in Cloud Run function:** Access granted only to users with appropriate Admin or Provider roles/permissions obtained via **Supabase Auth/roles**. **Cloud Run function verifies the calling user's role/ownership (Provider managing *their own* availability) and then uses a Supabase `service_role` key to bypass RLS *for writes/deletes* if needed, but only after role verification.**
        *   Input validation for schedule data within the **Cloud Run function**.
        *   Admin actions logged (**in Google Cloud Logging**).
        *   Logic correctly updates the **Supabase database** (`APP-ADMIN-1 schema`).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication Middleware (**Supabase Auth integration**). RBAC Middleware/logic (**SEC-BE-3 principles**). **Supabase JS SDK (potentially with `service_role`)**.

3.  **Ticket ID:** APP-ADMIN-3 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Functions**): Admin/Provider View Appointment Requests
    *   **Background:** Create APIs (**Google Cloud Run functions**) for administrators to see all pending appointment requests and for providers to see requests directed to them, accessing data from **Supabase**.
    *   **Acceptance Criteria:**
        *   Secured endpoints implemented as **Google Cloud Run functions** (`/api/admin/appointments`, `/api/providers/me/appointments`).
        *   **RBAC Enforcement via Supabase RLS and application-level checks in Cloud Run function:** Admin endpoint requires `admin_view_appointments`. Provider endpoint requires `provider_view_appointments` and ownership check (Provider sees *their* patients' appointments). **Cloud Run function uses appropriate Supabase context (user's token vs service_role) and applies checks.**
        *   APIs query appointments from **Supabase** based on roles and criteria (e.g., filter by status, provider, date range).
        *   Includes relevant details for admin/provider review (patient name, requested time, contact info - controlled by data access principles and RBAC/consent).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles**). **Supabase JS SDK, Supabase RLS**. ORM queries (optional). Handle patient data access restrictions here via **Cloud Run logic and Supabase RLS**.

4.  **Ticket ID:** APP-ADMIN-4 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Functions**): Admin/Provider Confirm/Cancel Appointment Request
    *   **Background:** Create APIs (**Google Cloud Run functions**) allowing administrators and providers to change the status of a requested appointment in **Supabase**.
    *   **Acceptance Criteria:**
        *   Secured endpoints implemented as **Google Cloud Run functions** (`/api/appointments/:id/confirm`, `/api/appointments/:id/cancel-by-staff`, `/api/appointments/:id/no-show` etc.).
        *   **RBAC Enforcement via application-level checks in Cloud Run function:** Requires permissions like `admin_manage_appointments` or `provider_manage_appointments` and ownership check for providers. **Cloud Run function verifies the calling user's role/ownership and then uses a Supabase `service_role` key to update the appointment status in Supabase.**
        *   API accepts appointment ID and updates the status (**in Supabase**, APP-1 schema state machine).
        *   Transactionally safe update (**in Supabase**).
        *   Trigger notification logic related to status change (**call Notification Service from Cloud Run function, APP-ADMIN-6**).
        *   Admin actions logged (**in Google Cloud Logging**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles**). **Supabase JS SDK (`service_role`)**, transactions in **Supabase**. Integrate notification trigger calls.

5.  **Ticket ID:** APP-ADMIN-5
    *   **Title:** Implement Frontend Admin/Provider UI: Schedule & Appointment Management
    *   **Background:** ... (Remains the same) ... Connects to backend APIs (**Cloud Run Functions**).
    *   **Acceptance Criteria:**
        *   Dedicated screens/views for Admin and Provider roles accessible after login (via RBAC in frontend navigation logic or screen access).
        *   Provider view focuses on *their* appointments and availability. Admin view covers more broadly.
        *   UI to view pending appointment requests (using APP-ADMIN-3 data from **Cloud Run function**).
        *   UI to view list of all appointments with filters (using APP-ADMIN-3/other APIs from **Cloud Run function**).
        *   UI actions/buttons to Confirm, Cancel, Mark as Complete/No-Show, calling backend APIs (**APP-ADMIN-4 Cloud Run functions**).
        *   UI sections for Admin/Provider to view and edit their availability (calling **APP-ADMIN-2 Cloud Run functions**).
        *   Utilizes core UI components (Epic 6), potentially more complex schedule visualization components.
        *   Design is clear, prioritizing information density and efficient workflow for staff.
        *   Conditional rendering based on user role obtained via **Supabase Auth context** in frontend.
    *   **Technology/Implementation Suggestions:** React Native screens. Conditional rendering based on user role. Complex components for schedule management. Connect to backend Admin/Provider APIs (**Cloud Run endpoints**).

6.  **Ticket ID:** APP-ADMIN-6 (UPDATED for Cloud Run)
    *   **Title:** Integrate Backend (**Cloud Run Function**) with Notification Service (Appointment Triggers)
    *   **Background:** Connect the backend appointment logic (**Google Cloud Run function**) to a third-party Notification Service API to send push notifications, SMS, or emails based on appointment events.
    *   **Acceptance Criteria:**
        *   Third-party Notification Service selected (e.g., Twilio, AWS SNS, FCM).
        *   Backend integration logic built (**in a Google Cloud Run function**).
        *   Implement triggers for notifications based on appointment status changes:
            *   To Patient: Booking Confirmed, Booking Cancelled (by staff).
            *   To Provider: New Booking Request (optional/config), Booking Cancelled (by user).
        *   Triggers are called by other backend functions (**APP-ADMIN-4, APP-ADMIN-7 Cloud Run functions**).
        *   Implement template management for notification content (even simple ones).
        *   Ensure PII/SPI is NOT included in the notification payload directly, only basic context and prompt to open app (Security Guideline).
        *   Securely manage API keys for Notification Service (**Google Cloud Secret Manager**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. SDKs or APIs for the chosen Notification Service. Need to manage API keys securely (**Google Cloud Secret Manager**).

7.  **Ticket ID:** APP-ADMIN-7 (UPDATED for Cloud Scheduler/Cloud Run)
    *   **Title:** Build Backend Service (**Cloud Run Function triggered by Cloud Scheduler**): Scheduled Appointment Reminders
    *   **Background:** Implement backend logic (**Google Cloud Run function triggered by Cloud Scheduler**) to query for upcoming appointments from **Supabase** and schedule reminder signals for the Notification Service based on configured intervals.
    *   **Acceptance Criteria:**
        *   Backend job/service created that runs periodically (**triggered by Google Cloud Scheduler**) as a **Google Cloud Run function**.
        *   **Cloud Run function queries upcoming appointments from the Supabase database.**
        *   Logic determines if/when a reminder needs to be sent based on configured reminder schedules (e.g., 24h before, 1h before).
        *   Sends a signal/message to a message queue (optional) or calls the dedicated notification sending service (**APP-ADMIN-6 Cloud Run function**) indicating a reminder is due for a specific user/appointment.
        *   Avoids scheduling duplicate reminders.
        *   Handle different reminder types (e.g., Push, SMS, Email).
        *   **Cloud Run function uses appropriate Supabase key (service_role for broad query, user token for specific checks?) and handles RLS.**
    *   **Technology/Implementation Suggestions:** **Google Cloud Scheduler, Google Cloud Run**, Node.js, TypeScript. Job scheduling library (Agenda, Bree - optional, within Cloud Run function). **Supabase JS SDK (potentially with service_role key)**. Message queue (RabbitMQ, Kafka, SQS - optional) or direct HTTP call to **APP-ADMIN-6 Cloud Run function**.

8.  **Ticket ID:** APP-ADMIN-8
    *   **Title:** Implement Mobile Background Task Listener & Local Notification Trigger
    *   **Background:** ... (Remains the same) ... Receives scheduled reminder signals (**sent by APP-ADMIN-7 Cloud Run function** via notification payload).
    *   **Acceptance Criteria:** ... (Remains the same) ...
    *   **Technology/Implementation Suggestions:** `react-native-background-fetch` or similar libraries. `@react-native-community/push-notification` or similar for local notifications. Needs coordination with backend (**APP-ADMIN-7 Cloud Run function** signal format/payload). Requires explicit user permissions for notifications on mobile.

**Epic PROFILE: Secure User Profile & Linked Data Views**

*   **Epic Goal:** Complete the User Management module by allowing storage and viewing of more detailed user profile information and establishing the secure framework for viewing linked health/transaction data (which will be implemented in later Epics like Epic TRACKING), while ensuring strong RBAC is enforced via **Supabase RLS** and **Cloud Run application-level checks**. Data stored in **Supabase**. Backend logic in **Cloud Run Functions**.

1.  **Ticket ID:** PROF-1 (UPDATED for Supabase)
    *   **Title:** Enhance User Profile Database Schema (**Supabase**) (Detailed Fields)
    *   **Background:** Expand the user schema (**Supabase PostgreSQL `profiles` table**) ... to hold additional demographic and contact information beyond the basics needed for authentication, and update RLS.
    *   **Acceptance Criteria:**
        *   **`profiles` table schema (FOUND-8) modified in Supabase PostgreSQL** to include fields for more detailed profile information (e.g., address, phone number, date of birth, potentially relevant demographic questions if applicable).
        *   Migration script created (**Supabase migrations**).
        *   **Supabase RLS policies on `profiles` table reviewed/updated** to ensure continued secure access based on `auth.uid()`.
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL schema alteration, Supabase migrations, Supabase RLS**. Consider data sensitivity of these fields under DPA.

2.  **Ticket ID:** PROF-2 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): User View/Edit Detailed Profile
    *   **Background:** Update the existing profile API (**Google Cloud Run function**) ... to handle the extended detailed profile information in **Supabase**.
    *   **Acceptance Criteria:**
        *   GET `/api/users/me` and PUT `/api/users/me` endpoints implemented as **Google Cloud Run functions**.
        *   GET returns the extended profile details (from PROF-1 schema in **Supabase profiles table**).
        *   PUT accepts and updates the extended profile details in the **Supabase `profiles` table**.
        *   **RBAC Enforcement via Supabase RLS and application-level checks in Cloud Run function:** Ensure `view_own_profile` and `edit_own_profile` conceptual permissions are checked. Access limited strictly to the authenticated user's own profile using **Supabase Auth context (`auth.uid()`) and Supabase RLS**.
        *   Input validation for new detailed fields within the **Cloud Run function**.
        *   API logs relevant user actions (e.g., profile update) (**in Google Cloud Logging**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication Middleware (**Supabase Auth integration**). RBAC Middleware/logic (**SEC-BE-3 principles**). **Supabase JS SDK, Supabase RLS**. Validation library.

3.  **Ticket ID:** PROF-3 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Admin View/Manage Any User Profile
    *   **Background:** Create a secure API (**Google Cloud Run function**) for administrators to view and edit any user's profile data in **Supabase**, necessary for support and user management by FPOP staff.
    *   **Acceptance Criteria:**
        *   Secured endpoints implemented as **Google Cloud Run functions** like GET `/api/admin/users/:userId` and PUT `/api/admin/users/:userld`.
        *   Crucially: **RBAC Enforcement via application-level checks in Cloud Run function:** Granted access ONLY to Admin roles with appropriate permissions (`admin_view_users`, `admin_manage_users`) obtained via **Supabase Auth/roles**. **Cloud Run function verifies the calling user's admin role and then uses a Supabase `service_role` key to bypass RLS *for reading/writing other users' data* in the `profiles` table, but only after admin role verification.**
        *   Endpoints allow viewing/editing detailed profile information for any user ID.
        *   Input validation for updates within the **Cloud Run function**.
        *   Admin actions logged specifically, linking the admin user ID to the user profile being managed (**in Google Cloud Logging**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware enforcing Admin role and specific permission (**Supabase Auth integration, SEC-BE-3 principles**). **Supabase JS SDK (`service_role` key)**. Logging (**Google Cloud Logging**). Ensure internal security logs record which admin accessed/modified which user record.

4.  **Ticket ID:** PROF-4
    *   **Title:** Implement Frontend UI: Detailed User Profile Screens (User View/Edit)
    *   **Background:** ... (Remains the same) ... Connects to backend API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   Profile screens (UM-7 placeholder) updated to display all fields from PROF-1 schema.
        *   Edit functionality extended to include all editable fields.
        *   UI uses established components (Epic 6) and design system.
        *   Adheres to accessibility guidelines for forms.
        *   Connects to **PROF-2 Cloud Run function** APIs for fetching and saving data.
    *   **Technology/Implementation Suggestions:** React Native screens, form components, connect to **PROF-2 Cloud Run function** APIs. State management for form data.

5.  **Ticket ID:** PROF-5
    *   **Title:** Implement Frontend UI: Admin User Management Screens (List/View/Edit Users)
    *   **Background:** ... (Remains the same) ... Connects to backend API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   Screens for Admin role to list all users and access individual user profiles for viewing/editing.
        *   Screens use core UI components (Epic 6), likely list components (FlatList/SectionList).
        *   Display relevant user data in list and detail views.
        *   Forms for editing user profiles correspond to the backend API (**PROF-3 Cloud Run function**) and schema.
        *   Access to these screens is protected client-side based on user role (but primary protection is backend **Supabase RLS/Cloud Run checks**).
        *   UI indicates potential linked sensitive data sections (e.g., Health Records) but may require separate tickets/Epics to actually display that data based on further RBAC/consent checks.
    *   **Technology/Implementation Suggestions:** React Native screens. List components. Form components. Connect to backend APIs (**PROF-3 Cloud Run functions**). Role-based access control on navigation/screen rendering frontend (for usability, not just security).

6.  **Ticket ID:** PROF-6 (UPDATED for Supabase/Cloud Run)
    *   **Title:** Design Backend Framework for Secure Linked Data Retrieval (**Supabase RLS & Cloud Run**) (Placeholder)
    *   **Background:** Plan how different data types (Health Records, Lab Results, Transactions, Tracking data) stored in **Supabase** will be securely linked to the user profile and retrieved via APIs, considering data sensitivity and ownership.
    *   **Acceptance Criteria:**
        *   Document the conceptual approach for retrieving data linked to a user ID from various schemas/tables in **Supabase PostgreSQL**.
        *   Define a pattern for backend APIs (**Google Cloud Run functions or Supabase Edge Functions**) that serve user-specific linked data (e.g., `/api/users/me/health-records`). These functions will run with the authenticated user's context.
        *   Outline how **Supabase RLS** will handle the primary access control for user-owned data (`auth.uid()`), and how potential additional data access logic (e.g., ownership checks for provider view, explicit consent checks for tracking data) will be integrated into these APIs using application-level checks in the backend code (**Cloud Run/Supabase Functions**).
        *   No code implementation of actual data retrieval logic in this ticket, just the design of the API patterns.
    *   **Technology/Implementation Suggestions:** Documentation. Design API endpoint structures (**for Cloud Run/Supabase Functions**). Outline middleware or helper functions for checking complex access logic beyond basic **Supabase RLS** (`auth.uid()` checks).

7.  **Ticket ID:** PROF-7
    *   **Title:** Implement Frontend UI: Placeholder Linked Data Sections on Profile
    *   **Background:** On the user profile or dashboard, add placeholders or links for the different types of data that will be linked to the user, even if the detail views aren't built yet. These links will point to future screens accessing data via the framework designed in PROF-6.
    *   **Acceptance Criteria:**
        *   On the User Profile or main dashboard UI, add sections/buttons/links labelled "Health Records", "Lab Results", "Transaction History", "Tracking Data" (Pill Tracker, Menstrual Tracker).
        *   These links/sections currently navigate to placeholder screens or show empty states.
        *   Use appropriate iconography and text following the design system.
        *   Visually consistent layout across platforms.
    *   **Technology/Implementation Suggestions:** React Native screens. Navigational components. Basic layout and placeholder text/components.

**Epic TRANSACTIONS: Transaction History (User Focused)**

*   **Epic Goal:** Allow authenticated users to securely view a history of their service transactions via the platform, even if donation-based, using data stored in **Supabase**. Backend logic in **Cloud Run Functions**.

1.  **Ticket ID:** TRN-1 (UPDATED for Supabase)
    *   **Title:** Design & Implement Transaction History Database Schema (**Supabase**)
    *   **Background:** Define the structure to store records of user interactions tied to payments or donations for services in **Supabase PostgreSQL**.
    *   **Acceptance Criteria:**
        *   **Schema designed for `Transaction` in Supabase PostgreSQL** (user link, date, service description, amount/donation value, status, payment method/ref - link to Payment Gateway data if integrated later).
        *   Schema created in the database (**Supabase**).
        *   **Supabase SDK** updated.
        *   Indexing for queries by user ID, date (**in Supabase**).
        *   **Supabase RLS policies defined** to ensure users can only view their own transactions (`user_id = auth.uid()`).
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL, Supabase migrations, Supabase RLS, Supabase SDK.**

2.  **Ticket ID:** TRN-2 (UPDATED for Cloud Run)
    *   **Title:** Build Backend API (**Cloud Run Function**): Record New Transaction (Internal)
    *   **Background:** Create an internal backend mechanism (**Google Cloud Run function**) to log transactions whenever a user completes a service interaction involving payment or donation, storing data in **Supabase**.
    *   **Acceptance Criteria:**
        *   Internal utility function/**protected endpoint created as a Google Cloud Run function** (`/api/internal/transactions/create` - not directly callable by FE).
        *   Function/endpoint accepts transaction details and links to a user ID.
        *   Creates a new Transaction record in **Supabase DB** (TRN-1 schema) using **Supabase JS SDK**.
        *   Used by other backend processes (**Cloud Run functions**) upon service completion/payment confirmation (integrated in payment epic later, maybe just logging placeholder calls for now).
        *   Includes minimal input validation.
        *   **Cloud Run endpoint is secured** (e.g., with an internal API key managed in **Google Cloud Secret Manager** or restricted ingress).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. **Supabase JS SDK**. Internal function or a backend-only callable endpoint (needs robust protection, e.g., internal API key from **Secret Manager**).

3.  **Ticket ID:** TRN-3 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): User View Own Transaction History
    *   **Background:** Create a secure backend API (**Google Cloud Run function**) allowing an authenticated user to retrieve their transaction history from **Supabase**.
    *   **Acceptance Criteria:**
        *   Secured endpoint like GET `/api/users/me/transactions` implemented as a **Google Cloud Run function**.
        *   **RBAC Enforcement via Supabase RLS is applied.** **Supabase RLS on the `transactions` table** ensures only the authenticated user can access *their own* data (`user_id = auth.uid()`). The **Cloud Run function accesses Supabase using the user's authenticated context/token.**
        *   API queries transaction data (**from Supabase**, TRN-1 schema) linked to the authenticated user.
        *   Returns list of transactions, sorted by date.
        *   Includes necessary details for display.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication Middleware (**Supabase Auth integration**). **Supabase JS SDK, Supabase RLS**. ORM (optional). Filtering by user ID implicitly via RLS.

4.  **Ticket ID:** TRN-4
    *   **Title:** Implement Frontend UI: User View Transaction History Screen
    *   **Background:** ... (Remains the same) ... Connects to backend API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   Screen accessible from Profile/Dashboard (PROF-7 placeholder).
        *   Fetches data from backend API (**TRN-3 Cloud Run function**).
        *   Displays transaction list clearly (date, description, amount).
        *   Uses core UI components (Epic 6), List components.
    *   **Technology/Implementation Suggestions:** React Native screens, FlatList/SectionList. Connect to backend API (**TRN-3 Cloud Run function endpoint**). State management for list.

**Epic INVENTORY: Medicine Inventory Management (Admin Focused)**

*   **Epic Goal:** Implement the administrative interface for tracking medical supply and medication inventory within associated clinics/facilities. Data stored in **Supabase**. Requires Admin RBAC enforced via **Supabase RLS** and **Cloud Run application-level checks**. Backend logic in **Cloud Run Functions**.

1.  **Ticket ID:** INV-1 (UPDATED for Supabase)
    *   **Title:** Design & Implement Inventory Database Schema (**Supabase**)
    *   **Background:** Define the structure to track inventory items across potentially multiple locations in **Supabase PostgreSQL**.
    *   **Acceptance Criteria:**
        *   **Schema designed for `InventoryItem` in Supabase PostgreSQL** (name, description, category, location/facility link, stock level, expiry date, supplier, potentially lot number).
        *   Schema created in the database (**Supabase**).
        *   **Supabase SDK** updated.
        *   Indexing for queries by facility, category, name, expiry date (**in Supabase**).
        *   **Supabase RLS policies defined** to restrict access to Admin roles (or specific inventory roles).
        *   **Supabase migrations created.**
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL, Supabase migrations, Supabase RLS, Supabase SDK.** Ensure linkage to facilities (Directory schema DIR-1 in Supabase).

2.  **Ticket ID:** INV-2 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Functions**): Admin Manage Inventory (Full CRUD)
    *   **Background:** Create secure APIs (**Google Cloud Run functions**) allowing administrators to manage inventory items in **Supabase**.
    *   **Acceptance Criteria:**
        *   Secured endpoints implemented as **Google Cloud Run functions** for CRUD on `/api/admin/inventory`.
        *   **RBAC Enforcement via application-level checks in Cloud Run function:** Requires `admin_manage_inventory` permission obtained via **Supabase Auth/roles**. **Cloud Run function verifies the calling user's admin role and then uses a Supabase `service_role` key to bypass RLS *for writes/deletes* on the inventory table, but only after admin role verification.**
        *   Input validation for item details within the **Cloud Run function**.
        *   Admin actions logged, specifically including item and quantity changes (**in Google Cloud Logging**).
        *   API handles updates to stock levels, expiry dates, etc. (**in Supabase**) using **Supabase JS SDK**.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles**). **Supabase JS SDK (`service_role`)**. Validation. Logging (**Google Cloud Logging**).

3.  **Ticket ID:** INV-3 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Admin View Inventory List with Filters
    *   **Background:** Create a secure API (**Google Cloud Run function**) for administrators to view the inventory list from **Supabase**, supporting filtering and sorting.
    *   **Acceptance Criteria:**
        *   Secured endpoint GET `/api/admin/inventory` implemented as a **Google Cloud Run function**.
        *   **RBAC Enforcement via Supabase RLS is applied:** Requires `admin_view_inventory` permission obtained via **Supabase Auth/roles**. **Supabase RLS policies on the `inventory` table** enforce this (Admin role can view).
        *   API supports filters (e.g., by facility, category) and sorting (e.g., by expiry date) via query parameters handled by the **Cloud Run function**.
        *   Returns list of inventory items with relevant details from **Supabase** using **Supabase JS SDK**.
        *   Pagination implemented for potentially large lists.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles**). **Supabase JS SDK, Supabase RLS**. Filtering, sorting, pagination logic.

4.  **Ticket ID:** INV-4
    *   **Title:** Implement Frontend Admin UI: Inventory Management Screens (List/Add/Edit)
    *   **Background:** ... (Remains the same) ... Connects to backend APIs (**Cloud Run Functions**).
    *   **Acceptance Criteria:**
        *   Screens accessible only to Admin role via navigation or direct access (frontend role check for usability, BE is security via **Cloud Run/Supabase checks**).
        *   Main screen lists inventory items using data from backend API (**INV-3 Cloud Run function**).
        *   Filtering and sorting options implemented in the UI.
        *   Ability to view details of an item.
        *   Forms for adding new items and editing existing items, connected to backend API (**INV-2 Cloud Run function**).
        *   Input validation mirroring backend (INV-2).
        *   UI uses core UI components (Epic 6), List components, form components.
        *   Visually distinct highlighting for items nearing expiry or low stock.
    *   **Technology/Implementation Suggestions:** React Native screens, List components, Form components. Connect to backend APIs (**Cloud Run endpoints**). State management for list/filters. Data display with conditional styling.

**Epic REPORTING: Admin Reporting (Aggregated Data)**

*   **Epic Goal:** Implement the administrative module for generating and viewing aggregate reports on platform usage, appointments, and potentially anonymized summaries of tracking data for population-level insights, using data from **Supabase**. Data aggregation and anonymization logic implemented in **Cloud Run Functions** triggered by **Cloud Scheduler**. Reporting APIs in **Cloud Run Functions**.

1.  **Ticket ID:** REP-1 (UPDATED for Supabase/Cloud Run)
    *   **Title:** Design Data Aggregation Strategy for Reporting (**Supabase & Cloud Run**)
    *   **Background:** Plan how raw operational data in **Supabase** will be aggregated for reporting purposes, minimizing direct access to raw data by the reporting service itself, and design the anonymization process.
    *   **Acceptance Criteria:**
        *   Document sources of data for required reports (**in Supabase**).
        *   Outline strategy for data aggregation (e.g., database views in **Supabase**, scheduled jobs running aggregation logic as **Cloud Run functions**).
        *   Plan how aggregated data will be stored (separate schema/table in **Supabase**) or accessed (via views in **Supabase**).
        *   Crucially: Design how ANONYMIZATION techniques (**implemented in a Cloud Run function**, COMP-8) will be applied during the aggregation process for sensitive data summaries, accessing sensitive data carefully (**using Supabase service_role key with caution**).
    *   **Technology/Implementation Suggestions:** Documentation (Confluence/Markdown). **Supabase PostgreSQL views, Supabase Functions (for simple aggregation), Google Cloud Scheduler, Google Cloud Run** (for complex aggregation/anonymization). Node.js/TypeScript scripts for aggregation logic. **Supabase JS SDK (potentially with service_role).**

2.  **Ticket ID:** REP-2 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend Logic for Basic Aggregation & Reporting APIs (**Cloud Run Function**) (Non-Sensitive Data)
    *   **Background:** Build the backend logic (**Google Cloud Run function**) to aggregate data from non-sensitive sources in **Supabase** and expose via APIs.
    *   **Acceptance Criteria:**
        *   Backend jobs (**triggered by Google Cloud Scheduler running a Cloud Run function**) or database views (**in Supabase**) created to aggregate non-sensitive operational data from **Supabase**.
        *   Secured endpoint(s) like GET `/api/admin/reports/basic` implemented as a **Google Cloud Run function** to expose this aggregated data.
        *   **RBAC Enforcement via application-level checks in Cloud Run function:** Requires `admin_view_basic_reports` permission obtained via **Supabase Auth/roles**.
        *   API returns structured, aggregated data.
    *   **Technology/Implementation Suggestions:** **Google Cloud Scheduler, Google Cloud Run**, Node.js, TypeScript. **Supabase PostgreSQL views, Supabase JS SDK (using service_role for aggregation if needed)**. Authentication & RBAC Middleware/logic (**Supabase Auth integration**). Data formatting.

3.  **Ticket ID:** REP-3 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend Logic for Aggregating & Anonymizing Sensitive Data Summaries (**Cloud Run Function**)
    *   **Background:** Build the backend processes (**Google Cloud Run function triggered by Cloud Scheduler**) for aggregating data from sensitive sources (**in Supabase**), applying mandatory anonymization techniques (**in Cloud Run function**) before exposing the summaries.
    *   **Acceptation Criteria:**
        *   Backend jobs created (**Google Cloud Scheduler triggering a Cloud Run function**) to aggregate summary data from sensitive modules (**in Supabase**, once those Epics are done).
        *   Integration with ANONYMIZATION utilities/logic (**implemented in the Cloud Run function**, COMP-8) based on REP-1 design. Raw sensitive data in **Supabase** is NOT accessible to this process unless specifically allowed and tightly controlled/audited (**using Supabase `service_role` key with extreme caution**). Output data is anonymized.
        *   Secured endpoint GET `/api/admin/reports/sensitive` implemented as a **Google Cloud Run function** to expose ANONYMIZED aggregated data.
        *   **RBAC Enforcement via application-level checks in Cloud Run function:** Requires `admin_view_sensitive_aggregated_reports` permission obtained via **Supabase Auth/roles**.

4.  **Ticket ID:** REP-4
    *   **Title:** Implement Frontend Admin UI: Reporting Dashboard & Export
    *   **Background:** ... (Remains the same) ... Connects to backend APIs (**Cloud Run Functions**).
    *   **Acceptance Criteria:**
        *   Dedicated Reporting screen accessible only to Admin role (frontend/backend RBAC).
        *   Dashboard view displays key metrics from non-sensitive reports (REP-2, fetched from **Cloud Run function**).
        *   Separately, display sections for sensitive anonymized reports (REP-3, fetched from **Cloud Run function**), with clear labels indicating data is aggregated and anonymized.
        *   Optional simple visualizations (charts) for some data.
        *   UI action/button to export report data (e.g., to CSV) from both non-sensitive and anonymized sensitive sections. Calls backend APIs (**REP-5 Cloud Run function**).
        *   UI uses core components (Epic 6).
    *   **Technology/Implementation Suggestions:** React Native screens. Data display components. Charting library integration (if used). Frontend file export utilities, calling BE APIs (**REP-5 Cloud Run function endpoint**). State management for report views/filters.

5.  **Ticket ID:** REP-5 (UPDATED for Cloud Run)
    *   **Title:** Build Backend API (**Cloud Run Function**): Report Data Export (CSV/JSON)
    *   **Background:** Create backend APIs (**Google Cloud Run function**) to generate and provide exportable files of report data upon admin request, fetching aggregated data.
    *   **Acceptance Criteria:**
        *   Secured endpoints implemented as **Google Cloud Run functions** like GET `/api/admin/reports/basic/export` and GET `/api/admin/reports/sensitive/export`.
        *   **RBAC Enforcement via application-level checks in Cloud Run function** applied (requires appropriate admin report permissions).
        *   APIs fetch relevant aggregated/anonymized data (from REP-2, REP-3 logic/views in **Supabase**) using **Supabase JS SDK**.
        *   Format the data into a requested format (CSV is MVP).
        *   Serve the data as a downloadable file.
        *   Admin actions logged (**in Google Cloud Logging**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. CSV generation library. Streaming responses for large exports. Logging (**Google Cloud Logging**). **Supabase JS SDK.**

**Epic TRACKING-DATA: Secure Health Tracking Modules (Pill & Menstrual)**

*   **Epic Goal:** Implement the highly sensitive Pill Tracker and Menstrual Tracker modules for users, including robust security (**application-level AES-256-GCM encryption, Supabase RLS, Cloud Run application-level checks**), explicit consent workflows for this specific data, reminder scheduling (**Cloud Scheduler + Cloud Run Functions**), and basic UI. Data stored in **Supabase**, encrypted. Backend logic in **Cloud Run Functions**.

1.  **Ticket ID:** TRK-1 (UPDATED for Supabase)
    *   **Title:** Design & Implement Pill & Menstrual Tracker Database Schemas (**Supabase**, Highly Sensitive)
    *   **Background:** Define the data structures for Pill Intake Logs and Menstrual Cycle Logs in **Supabase PostgreSQL**. These are SPI and require maximum security considerations, including planning for data segregation and application-level encryption.
    *   **Acceptance Criteria:**
        *   **Schema designed for `PillLog` in Supabase PostgreSQL** (user link, medication ID/name, dose, timestamp, taken/missed status, fields to store encrypted data, IV, auth tag).
        *   **Schema designed for `MenstrualLog` in Supabase PostgreSQL** (user link, date, cycle start/end, flow intensity, symptoms array/tags, notes, fields to store encrypted data, IV, auth tag).
        *   CRITICALLY: **Schemas designed considering data segregation via dedicated schemas or logical separation within Supabase PostgreSQL.** Implement **Supabase RLS policies** for these tables ensuring only the owning user (`user_id = auth.uid()`) can access their data.
        *   Schemas implemented (**in Supabase**). **Supabase SDK** updated. Indexing by user ID and date (**in Supabase**).
        *   **Supabase migrations created.**
    *   **Technology/Implementation Suggestions:** **Supabase PostgreSQL, Supabase migrations, Supabase RLS, Supabase SDK.** Pay close attention to DPA SPI classification. Design schema to accommodate encrypted data binary/text fields and corresponding IV/auth tag fields.

2.  **Ticket ID:** TRK-2 (UPDATED for Cloud Run/Secret Manager)
    *   **Title:** Implement Backend Cryptography Utility (**Cloud Run Function**) for Encrypting Sensitive Tracker Data At Rest
    *   **Background:** Build the core, tested functions for AES-256-GCM encryption and decryption, deployed as a backend service and depending on secure key loading from a secrets manager.
    *   **Acceptance Criteria:**
        *   Backend utility functions created (**as a Node.js service/function deployed to Cloud Run**) to perform AES-256-GCM encrypt/decrypt.
        *   Utilities handle random IV generation using a CSPRNG and correctly use IV and authentication tag.
        *   Unit tests are comprehensive, including edge cases, incorrect IV/tag handling.
        *   Utilize a Cryptographically Secure Random Number Generator (CSPRNG) for IVs (crypto.randomBytes).
        *   Code review by at least one other team member focusing on cryptography implementation safety.
        *   **Utilities securely load encryption keys from Google Cloud Secret Manager.**
        *   **Deployed as a Google Cloud Run function or Supabase Edge Function.**
    *   **Technology/Implementation Suggestions:** Node.js crypto module. **Google Cloud Run or Supabase Edge Functions**. **Google Cloud Secret Manager**. Ensure library usage correctly applies GCM properties. Design as a service or reusable module callable by other backend functions.

3.  **Ticket ID:** TRK-3 (UPDATED for Cloud Run/Supabase/Encryption)
    *   **Title:** Build Backend API (**Cloud Run Function**): User Manage Pill Tracker Data (Log/Edit)
    *   **Background:** Create secure backend API (**Google Cloud Run function**) for users to log and edit their medication intake, storing data in **Supabase** using the encryption utility.
    *   **Acceptance Criteria:**
        *   Secured endpoints for logging/editing PillLog entries (`/api/users/me/pill-tracker`) implemented as a **Google Cloud Run function**.
        *   **RBAC Enforcement via Supabase RLS is applied.** **Supabase RLS policies on the `pill_log` table** ensure only the authenticated user can access/modify *their own* data (`user_id = auth.uid()`). The **Cloud Run function accesses Supabase using the user's authenticated context/token.**
        *   Input data is validated within the **Cloud Run function**.
        *   Data received by the API is **encrypted using TRK-2 utility *before* being sent to Supabase for storage.** IV and auth tag are stored alongside the encrypted data.
        *   User actions logged minimally (logging sensitive data value requires extra care) (**in Google Cloud Logging**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles, Supabase RLS**). **Supabase JS SDK**. Validation. Encryption integration (TRK-2 utility call from Cloud Run function).

4.  **Ticket ID:** TRK-4 (UPDATED for Cloud Run/Supabase/Encryption)
    *   **Title:** Build Backend API (**Cloud Run Function**): User Manage Menstrual Tracker Data (Log/Edit)
    *   **Background:** Create secure backend API (**Google Cloud Run function**) for users to log and edit their menstrual cycle data and symptoms, storing data in **Supabase** using the encryption utility.
    *   **Acceptance Criteria:**
        *   Secured endpoints for logging/editing MenstrualLog entries (`/api/users/me/menstrual-tracker`) implemented as a **Google Cloud Run function**.
        *   **RBAC Enforcement via Supabase RLS is applied.** **Supabase RLS policies on the `menstrual_log` table** ensure only the authenticated user can access/modify *their own* data (`user_id = auth.uid()`). The **Cloud Run function accesses Supabase using the user's authenticated context/token.**
        *   Input validation for dates, flow, symptoms within the **Cloud Run function**.
        *   Data received by the API is **encrypted using TRK-2 utility *before* being sent to Supabase for storage.** IV and auth tag are stored alongside the encrypted data.
        *   User actions logged minimally (**in Google Cloud Logging**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles, Supabase RLS**). **Supabase JS SDK**. Validation. Encryption integration (TRK-2 utility call from Cloud Run function).

5.  **Ticket ID:** TRK-5 (UPDATED for Cloud Run/Supabase/Decryption)
    *   **Title:** Build Backend API (**Cloud Run Function**): User View Own Tracker Data (**Decrypted Retrieval**)
    *   **Background:** Create APIs (**Google Cloud Run functions**) for users to retrieve their own (encrypted at rest) tracking data from **Supabase**, decrypting it for display.
    *   **Acceptance Criteria:**
        *   Secured endpoints like GET `/api/users/me/pill-tracker` and GET `/api/users/me/menstrual-tracker` implemented as **Google Cloud Run functions**.
        *   **RBAC Enforcement via Supabase RLS is applied.** **Supabase RLS policies on the relevant tables** ensure only the authenticated user can access *their own* data. The **Cloud Run function accesses Supabase using the user's authenticated context/token.**
        *   API queries relevant data from **Supabase**, **decrypting it using TRK-2 utility after retrieval** (within the **Cloud Run function**). Requires retrieving encrypted data along with its corresponding IV and auth tag.
        *   Returns lists of log entries, sorted by date/timestamp.
        *   Includes necessary details for display.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication & RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles, Supabase RLS**). **Supabase JS SDK**. Decryption integration (TRK-2 utility call from Cloud Run function). Filtering by user ID implicitly via RLS.

6.  **Ticket ID:** TRK-6 (UPDATED for Cloud Scheduler/Cloud Run)
    *   **Title:** Build Backend Logic: Schedule Tracking Reminders (Pill, Menstrual - Phase 2) (**Cloud Scheduler + Cloud Run**)
    *   **Background:** Extend the reminder scheduling system (**APP-ADMIN-7 Cloud Scheduler + Cloud Run function**) to include recurring medication dose reminders and potential cycle tracking reminders/predictions.
    *   **Acceptance Criteria:**
        *   Extend background job logic (**APP-ADMIN-7 Cloud Run function triggered by Cloud Scheduler**) to query upcoming reminder schedules defined by the user in tracking modules (stored in **Supabase**, potentially encrypted/decrypted carefully by the function).
        *   Handle complex medication schedules (e.g., specific times, relative to meals).
        *   Generate signals for the Notification Service (**APP-ADMIN-6 Cloud Run function call**) at the scheduled times.
        *   Ensure user can configure reminder schedules (needs FE ticket, schema update in TRK-1 in **Supabase**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Scheduler, Google Cloud Run**, Node.js, TypeScript job script. Update TRK-1 schemas for reminder config (**in Supabase**). Logic to calculate next reminder time based on user schedule. Integrate with Notification Service signaling (**APP-ADMIN-6 Cloud Run function**). **Supabase JS SDK (using appropriate key/RLS for querying tracker data)**.

7.  **Ticket ID:** TRK-7 (UPDATED for Cloud Run/Supabase)
    *   **Title:** Build Backend API (**Cloud Run Function**): Provider View Assigned Patient Tracking Data (Strict Consent Required)
    *   **Background:** Create secure APIs (**Google Cloud Run function**) for providers to view their patients' anonymized trends or specific data points from **Supabase**, with very explicit consent from tracking modules. This is highly sensitive and complex and requires careful handling in the backend function.
    *   **Acceptance Criteria:**
        *   Secured endpoints like GET `/api/providers/me/patients/:patientId/tracking-summary` or GET `/api/providers/me/patients/:patientId/tracking-data?dateRange=....` implemented as **Google Cloud Run functions**.
        *   HIGHLY COMPLEX AUTHORIZATION: Requires RBAC, Ownership Check, AND Granular Patient Consent specific to this data/provider. Access DENIED by default. Data potentially anonymized on retrieval even for providers unless specific consent allows raw data for care. Based on COMPLIANCE-FULL decisions. **Authorization logic implemented in the Cloud Run function:** verifies the calling user's provider role/ownership and the patient's consent status (**querying Supabase for this data**). **Cloud Run function uses a Supabase `service_role` key *with extreme caution and logging* to access the data if necessary**, decrypts it (**TRK-2 utility**), *then* applies application-level checks and potentially anonymization (**COMP-8 utility**) before returning the result.
        *   If authorized, queries relevant data (**decrypted after read in the Cloud Run function**), aggregates/anonymizes it as required by consent/policy, and returns it.
        *   This API may be deferred to Phase 3 or require a spike just to define the exact access rules and technical implementation with **Supabase RLS (for basic filtering)** and **Cloud Run interaction**.
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication/RBAC Middleware/logic (**Supabase Auth integration, SEC-BE-3 principles**). Custom complex authorization logic accessing consent data (COMPLIANCE-FULL schema in **Supabase**). **Supabase JS SDK (using `service_role` with extreme caution)**. Decryption (TRK-2 utility call). Potential aggregation/anonymization logic (COMP-8 utility call by Cloud Run function).

8.  **Ticket ID:** TRK-8
    *   **Title:** Implement Frontend UI: Pill Tracker Screens (Logging, List, Reminders)
    *   **Background:** ... (Remains the same) ... Connects to backend APIs (**Cloud Run Functions**).
    *   **Acceptance Criteria:**
        *   Dedicated Pill Tracker section accessible from Dashboard/Profile (PROF-7 placeholder).
        *   UI to log a new dose (med name, dose, time), connected to **TRK-3 Cloud Run function**.
        *   View showing list of past doses (using data from **TRK-5 Cloud Run function**).
        *   UI to configure reminder schedules for medications, connecting to backend APIs (**likely extends APP-ADMIN-2/APP-ADMIN-5 logic via Cloud Run**).
        *   Integrates with reminder notification status/management UI (might need shared UI component).
        *   UI uses core components (Epic 6). Visually clear dose logging interface.
    *   **Technology/Implementation Suggestions:** React Native screens. Form/List components. Connect to backend APIs (**Cloud Run endpoints**). Reminder config UI.

9.  **Ticket ID:** TRK-9
    *   **Title:** Implement Frontend UI: Menstrual Tracker Screens (Logging, Calendar View, Symptoms)
    *   **Background:** ... (Remains the same) ... Connects to backend APIs (**Cloud Run Functions**).
    *   **Acceptation Criteria:**
        *   Dedicated Menstrual Tracker section accessible from Dashboard/Profile (PROF-7).
        *   UI to log cycle start/end dates, flow intensity, symptoms (multi-select/tags), notes, connected to **TRK-4 Cloud Run function**.
        *   Calendar or list view showing past cycle dates and logged data summaries (using data from **TRK-5 Cloud Run function**).
        *   Optional: Basic calendar prediction based on logged data (frontend logic).
        *   UI to configure cycle reminder settings (if planned), connecting to backend APIs (**likely extends APP-ADMIN-2/APP-ADMIN-5 logic via Cloud Run**).
        *   UI uses core components (Epic 6). Sensitive and respectful design for input/display.
    *   **Technology/Implementation Suggestions:** React Native screens. Calendar component integration. Form/List components. Connect to backend APIs (**Cloud Run endpoints**). Symptom tag input. Basic calendar math for prediction.

**Epic AI-HEALTH-ASSESS: AI-Assisted Health Assessment (Initial Scope)**

*   **Epic Goal:** Implement the user interface and backend integration for the AI-assisted health assessment, limited to the low-risk scope (symptom summarization, info linking). Processing logic implemented in a dedicated **Google Cloud Run Function** to handle sensitive data securely.

1.  **Ticket ID:** AI-1 (UPDATED for Cloud Run/Secret Manager)
    *   **Title:** Build Backend Service (**Cloud Run Function**): Integration for AI/NLP Processing
    *   **Background:** Implement a service (**Google Cloud Run function**) to integrate with a chosen AI/NLP service ... to process user symptom input. This function will handle calling the external service and managing its credentials.
    *   **Acceptance Criteria:**
        *   Backend utility function/service created as a **Google Cloud Run function** to send text input (symptoms, etc.) to the AI/NLP processing service.
        *   Handles authentication/API key for the service (**managed via Google Cloud Secret Manager**).
        *   Receives structured output (e.g., extracted symptoms, identified conditions/keywords) from the service.
        *   Unit tests confirm connectivity and basic request/response handling with the external service (use mocks or test environment).
        *   Secure data transmission to/from service (TLS).
        *   Vendor Due Diligence Checkpoint: Confirm chosen service meets DPA/HIPAA criteria if health data is passed (COMPLIANCE-FULL/SECURITY-DEEP-DIVE task, referenced here).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Use external SDK or direct HTTP requests. Consider processing latency. Secure handling of AI service API keys (**Google Cloud Secret Manager**).

2.  **Ticket ID:** AI-2 (UPDATED for Cloud Run)
    *   **Title:** Build Backend API (**Cloud Run Function**): Process User Assessment Input (Low-Risk Scope)
    *   **Background:** Create the backend API endpoint (**Google Cloud Run function**) that receives user symptom input from the frontend, sends it for processing via the AI/NLP service (AI-1), handling the response within the low-risk scope, and returning safe results.
    *   **Acceptance Criteria:**
        *   Secured endpoint POST `/api/assessment/process-input` implemented as a **Google Cloud Run function**.
        *   API accepts user-provided text (symptoms, etc.).
        *   Sends text to the AI/NLP Integration Service (AI-1, potentially calling another **Cloud Run function** or external API).
        *   Receives the processed output.
        *   Formats the output for return to the frontend within the defined safe scope: e.g., summarized text of input, a list of identified keywords/potential topics, links to curated informational articles based on keywords. Does NOT return diagnosis or treatment recommendations.
        *   API returns the formatted, safe output to the frontend.
        *   Log access to this API (**in Google Cloud Logging**, review log content sensitivity).
        *   RBAC check (if restricted to authenticated users) applied using **Supabase Auth context** (SEC-BE-3 principles).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run**, Node.js, TypeScript. Authentication Middleware (**Supabase Auth integration**). RBAC check (if restricted). Call AI-1 utility (**Cloud Run function** or external API). Data formatting logic.

3.  **Ticket ID:** AI-3
    *   **Title:** Implement Frontend UI: AI Health Assessment Input Screen
    *   **Background:** ... (Remains the same) ... Connects to backend API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   Dedicated 'Health Assessment' screen accessible from dashboard/navigation.
        *   UI provides a free-text input area for users to type their symptoms/concerns.
        *   Includes clear text managing user expectations about the AI (e.g., "This is not a substitute for medical advice," explains limited functionality). Transparency requirement (Design Principle).
        *   Button/action to 'Get Assessment' or 'Analyze', calling backend API (**AI-2 Cloud Run function**).
        *   Loading state shown during processing.
        *   UI uses core components (Epic 6). Design is supportive and easy to use for sensitive descriptions.
    *   **Technology/Implementation Suggestions:** React Native screen. TextInput component. State management for input text. Connect to backend API (**AI-2 Cloud Run function endpoint**).

4.  **Ticket ID:** AI-4
    *   **Title:** Implement Frontend UI: Display AI Health Assessment Results (Low-Risk Scope)
    *   **Background:** ... (Remains the same) ... Displays processed output from the AI/NLP service, strictly within the low-risk parameters, received from a backend API (**Cloud Run Function**).
    *   **Acceptance Criteria:**
        *   On the Health Assessment screen (AI-3), display the results received from the backend API (**AI-2 Cloud Run function**) after processing is complete.
        *   Display format is clear: e.g., formatted summary of their input, a list of extracted keywords or topics, links to external trusted health information resources based on keywords.
        *   Prominent disclaimer reiterating that this is not medical advice/diagnosis.
        *   UI uses core components (Epic 6). Formatting (e.g., rendering lists of links) is user-friendly.
    *   **Technology/Implementation Suggestions:** React Native View, Text components. Handling displaying different output formats (text, lists, links). Clearly visible disclaimer text. Linking API for external links.

**Epic SECURITY-DEEP-DIVE: Comprehensive Technical Security**

*   **Epic Goal:** Implement advanced technical security measures covering data at rest encryption (**applied *before* storing in Supabase**), robust auditing (**Supabase logs, Cloud Logging**), comprehensive vulnerability testing practices, secure secret management (**Google Cloud Secret Manager**), and advanced attack prevention (e.g., refined rate limiting - **GCP/Cloud Run features**, WAF - **GCP/Supabase features**). These are cross-cutting.

1.  **Ticket ID:** SEC-E-1 (UPDATED for Supabase/Cloud Run)
    *   **Title:** Design & Implement At Rest Encryption Integration Strategy (**Supabase & Cloud Run**)
    *   **Background:** Plan the detailed technical approach for integrating At Rest Encryption using the utility built in SEC-E-2, applied to data stored in **Supabase PostgreSQL**.
    *   **Acceptance Criteria:**
        *   Document which **Supabase PostgreSQL** database fields/tables are designated for At Rest Encryption (all SPI/PHI, esp. Health Records, Lab Results, Tracking data).
        *   Outline the process of applying encryption **within the backend code (Cloud Run functions/services)** before writing to the **Supabase DB** and decryption after reading from **Supabase** within the backend application logic.
        *   Detail how IVs and authentication tags are managed (stored alongside encrypted data in **Supabase** or derivable).
        *   Plan how data migration of existing non-encrypted data to encrypted format will be handled if deploying to a system with existing data (deferred implementation if MVP starts with empty **Supabase DB**).
        *   **Document how encryption keys will be loaded by Cloud Run functions/services from Google Cloud Secret Manager.**
    *   **Technology/Implementation Suggestions:** Documentation. Integrate encryption/decryption logic into repository methods or services (**running on Cloud Run or Supabase Edge Functions**). **Supabase JS SDK** (used by the encryption/decryption functions). Store IVs next to encrypted column in **Supabase**. **Google Cloud Secret Manager SDK.**

2.  **Ticket ID:** SEC-E-2 (UPDATED for Cloud Run/Secret Manager)
    *   **Title:** Implement Backend Cryptography Utility (AES-256-GCM) (**Cloud Run Function** using Secret Manager)
    *   **Background:** Build the core, tested functions for AES-256-GCM encryption and decryption, deployed as a backend service (**Google Cloud Run function**) and depending on secure key loading from **Google Cloud Secret Manager**.
    *   **Acceptance Criteria:**
        *   Backend utility functions created (**as part of a Node.js service deployed to Cloud Run**) to perform AES-256-GCM encrypt/decrypt.
        *   Utilities handle random IV generation using a CSPRNG and correctly use IV and authentication tag during decryption/verification.
        *   Unit tests are comprehensive, including edge cases, incorrect IV/tag handling (should fail).
        *   Utilize a Cryptographically Secure Random Number Generator (CSPRNG) for IVs (crypto.randomBytes).
        *   Code review by at least one other team member focusing on cryptography implementation safety.
        *   **Utilities securely load encryption keys from Google Cloud Secret Manager at runtime.**
        *   **Deployed as a Google Cloud Run function or Supabase Edge Function.**
    *   **Technology/Implementation Suggestions:** Node.js crypto module. **Google Cloud Run or Supabase Edge Functions**. **Google Cloud Secret Manager SDK/access**. Ensure library usage correctly applies GCM properties.

3.  **Ticket ID:** SEC-S-1 (UPDATED for Google Cloud Secret Manager)
    *   **Title:** Select & Implement Secure Secrets Management System (**Google Cloud Secret Manager**)
    *   **Background:** Environment variables are insufficient for production secrets (like application encryption keys, API keys, **Supabase service_role keys**). A dedicated secrets management system is needed (**Google Cloud Secret Manager**).
    *   **Acceptance Criteria:**
        *   A secure secrets management solution (**Google Cloud Secret Manager**) selected and provisioned in GCP.
        *   System provisioned and configured in staging and production infrastructure.
        *   All sensitive configuration (DB passwords - if not using Supabase auth directly, API keys, Application Encryption Keys, **Supabase service_role key**) are moved from environment variables for staging and production into **Google Cloud Secret Manager**.
        *   Application code (**Cloud Run functions/services**) modified to securely retrieve secrets from the management system at runtime.
        *   Access to the secrets manager is strictly controlled via IAM roles/policies.
    *   **Technology/Implementation Suggestions:** **Google Cloud Secret Manager**. Node.js SDK/libraries for accessing secrets manager. GCP IAM roles and policies.

4.  **Ticket ID:** SEC-A-1 (UPDATED for Supabase/Cloud Logging)
    *   **Title:** Design & Implement Comprehensive Auditing Strategy (**Supabase Logs & Cloud Logging**)
    *   **Background:** Formalize how security-relevant events will be logged, stored, protected, and made accessible for auditing, going beyond basic logging setup, leveraging **Supabase logs** and **Google Cloud Logging**.
    *   **Acceptance Criteria:**
        *   Document audit requirements based on DPA/HIPAA needs (what events to log, what info to include).
        *   Plan log aggregation solution (**Google Cloud Logging** collecting logs from **Cloud Run** and potentially **Supabase log exports**).
        *   Design how audit logs are protected from tampering or unauthorized deletion (**leveraging Google Cloud Logging immutability features and Supabase audit logs**).
        *   Plan log retention policy compliant with regulations.
        *   Implement audit logging within authentication (**Supabase Auth logs**), RBAC (**Supabase RLS logs + application logs from Cloud Run functions**), Admin actions (**application logs from Cloud Run functions**), Sensitive data access (TRK-7, HR-4 - application logs from **Cloud Run functions** logging *access attempt* and type, not data itself), Patient consent actions (**application logs from Cloud Run functions** logging action).
        *   Include details like authenticated user ID (**from Supabase Auth context**), action type, timestamp, target resource/user ID, success/failure status, origin IP (if applicable and permissible) in application logs sent to **Cloud Logging**.
    *   **Technology/Implementation Suggestions:** Documentation. Structured logging format (JSON - from Cloud Run functions). Centralized log aggregation service (**Google Cloud Logging**). **Supabase built-in audit/PostgreSQL logs**. Implement write-once, read-many storage policy or use managed immutable log storage features in **Cloud Logging**. Integrate logging calls extensively in backend logic (**Cloud Run functions/services**).

5.  **Ticket ID:** SEC-A-2 (UPDATED for Cloud Run/GCP)
    *   **Title:** Refine Rate Limiting & Implement Bot Protection (**Cloud Run / GCP**)
    *   **Background:** Protect against brute-force attacks, denial of service, and excessive requests beyond basic login rate limiting using **GCP and Cloud Run features**.
    *   **Acceptance Criteria:**
        *   Comprehensive rate limiting implemented applying policies to sensitive/costly endpoints (**Cloud Run endpoints**) (login, password reset request, potentially directory search APIs).
        *   Policies based on IP address, user ID (**obtained via Supabase Auth if authenticated**), or other relevant factors.
        *   Mechanism for handling rate limits (e.g., blocking requests, returning 429 Too Many Requests).
        *   Consider basic bot detection mechanisms (e.g., honeypot fields in forms processed by **Cloud Run functions**).
        *   Configuration is manageable (policies defined centrally in **GCP/Cloud Run settings**).
    *   **Technology/Implementation Suggestions:** **Google Cloud Run rate limiting features, Google Cloud Load Balancer or Cloud Armor**. Node.js/TypeScript rate limiting middleware (**in Cloud Run function**). Redis or database table (**in Supabase**) for tracking request counts if needed for more complex rate limiting.

6.  **Ticket ID:** SEC-TEST-1 (UPDATED for Cloud Run)
    *   **Title:** Integrate Automated Security Static Analysis (SAST) into CI
    *   **Background:** Analyze source code for common security vulnerabilities as part of the automated build process in the CI pipeline for both frontend and backend (**Cloud Run Node.js code**).
    *   **Acceptance Criteria:**
        *   SAST tool(s) selected (e.g., Snyk Code, SonarQube, GitHub Advanced Security). Consider both frontend (React Native) and backend (**Node.js on Cloud Run**) coverage.
        *   Tool integrated into the CI/CD pipeline (**e.g., GitHub Actions, GitLab CI**) to run automatically on code commits/pull requests.
        *   Pipeline configured to fail the build or report vulnerabilities based on severity threshold.
        *   Results are accessible to the development team.
        *   Initial scan performed and high-severity findings addressed or triaged.
    *   **Technology/Implementation Suggestions:** CI/CD platform integration features (**GitHub Actions, GitLab CI**). Selected SAST tool. Configuration files for the tool.

7.  **Ticket ID:** SEC-TEST-2 (UPDATED for Cloud Run)
    *   **Title:** Integrate Automated Dependency Vulnerability Scanning into CI
    *   **Background:** Scan third-party libraries used in both frontend (React Native) and backend (**Node.js on Cloud Run**) for known vulnerabilities.
    *   **Acceptance Criteria:**
        *   Dependency scanning tool(s) selected (e.g., Snyk Open Source, Dependabot, npm audit).
        *   Tool integrated into the CI/CD pipeline (**e.g., GitHub Actions**) to run automatically.
        *   Pipeline configured to report or block builds based on vulnerability severity.
        *   Team notified of new critical/high vulnerabilities.
        *   Process established for regularly reviewing and updating dependencies.
    *   **Technology/Implementation Suggestions:** CI/CD platform integration (**GitHub Actions, GitLab CI**). Selected scanning tool. Package manager integration (npm, yarn).

8.  **Ticket ID:** SEC-TEST-3 (UPDATED for Cloud Run/GCP)
    *   **Title:** Set Up & Conduct Regular Automated Dynamic Analysis (DAST) Scans (Phase 3/Ongoing)
    *   **Background:** Perform automated scans against a running instance of the application in a test environment to identify vulnerabilities like XSS, SQL Injection, etc., targeting APIs deployed on **Cloud Run** and potentially the frontend build.
    *   **Acceptance Criteria:**
        *   DAST tool/service selected (e.g., OWASP ZAP, Burp Suite Scanner, cloud-based DAST solutions).
        *   Scans configured to run regularly against a staging or dedicated test environment (**running on GCP/Cloud Run**).
        *   Scan scope covers key application endpoints/APIs.
        *   Results reviewed regularly and critical/high findings addressed.
        *   Authentication handled for scans (e.g., providing test user credentials).
    *   **Technology/Implementation Suggestions:** DAST tool. Test environment setup (**GCP/Cloud Run**). CI/CD integration for triggering scans (optional). Vulnerability management process.

9.  **Ticket ID:** SEC-TEST-4
    *   **Title:** Schedule & Perform Periodic Manual Penetration Testing (Phase 3/Post-Launch)
    *   **Background:** Engage a third-party security firm or internal expert to conduct in-depth manual testing to find vulnerabilities missed by automated tools.
    *   **Acceptance Criteria:**
        *   Penetration testing scope defined (covering web APIs, mobile app, infrastructure).
        *   Testing conducted by qualified professionals.
        *   Detailed report received.
        *   Findings reviewed, prioritized, and addressed.
        *   Testing performed periodically (e.g., annually or after major changes).
    *   **Technology/Implementation Suggestions:** Define scope. Vendor selection (if external). Schedule testing. Remediation process.

10. **Ticket ID:** SEC-OTHER-1 (UPDATED for GCP/Supabase)
    *   **Title:** Configure & Review Infrastructure Security Settings (**GCP & Supabase**)
    *   **Background:** Ensure the underlying cloud infrastructure (**GCP for Cloud Run, Supabase managed services**) is configured securely.
    *   **Acceptance Criteria:**
        *   Review and configure **GCP** security settings:
            *   **Cloud Run:** Ensure minimum necessary permissions, network controls (ingress/egress), integrate with Secret Manager (SEC-S-1).
            *   **Cloud Logging:** Configure secure log storage, access controls (SEC-A-1).
            *   **Cloud Scheduler:** Secure job execution permissions.
            *   **Google Cloud IAM:** Apply principle of least privilege for all user and service accounts.
            *   **VPC Network:** Configure firewall rules if applicable (e.g., limiting access to **Cloud Run**).
        *   Review and configure **Supabase** security settings:
            *   **Database Settings:** RLS enabled (FOUND-6), review PostgreSQL configuration for security best practices.
            *   **Auth Settings:** Configure JWT expiry, password policies, MFA options.
            *   **API Settings:** Ensure row-level security is enforced on API views.
            *   **Platform Access:** Limit Supabase project access to necessary personnel with appropriate roles.
        *   Regularly review these settings (e.g., quarterly).
    *   **Technology/Implementation Suggestions:** **GCP Console/gcloud CLI, Supabase Dashboard/CLI**. Security best practice checklists for GCP and Supabase. IAM policies.

**END OF DOCUMENT**

``` 
</rewritten_file>
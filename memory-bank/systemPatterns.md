Okay, here is the complete \`systemPatterns.md\` file, revised and expanded to fully reflect the finalized three-pillar architecture (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`), the direct Client-Supabase Authentication pattern, and the other design decisions we've discussed.

---

**START OF FILE: systemPatterns.md (Final Version)**

```markdown  
# System Design Patterns & Architectural Blueprints

This document outlines the core architectural patterns and design principles employed in the CarePoP/QueerCare platform.

## 1. Overall Architecture Pattern: Modular Three-Pillar System

The CarePoP platform is architected as a system with three distinct top-level application pillars, each residing within the main Git repository but developed and potentially deployed independently:

1.  **`carepop-nativeapp/` (Expo/React Native):**  
    *   Responsibility: Provides the user-facing native mobile application for iOS and Android. Handles all mobile-specific user interactions and presentation logic.  
    *   Pattern: Client-Side Rendering (CSR) native application.  
    *   Interaction:  
        *   Communicates directly with Supabase Auth for core authentication tasks (signup, login, logout, session management) via the Supabase JS SDK.  
        *   Communicates directly with Supabase database via Supabase JS SDK for simple, RLS-protected data reads where appropriate.  
        *   Communicates with \`carepop-backend/\` via RESTful APIs (hosted on Cloud Run) for complex business logic, operations requiring elevated privileges, third-party integrations, application-level encrypted data operations, and potentially specific data queries.

2.  **`carepop-web/` (Next.js, Tailwind CSS, Shadcn UI):**  
    *   Responsibility: Provides all web-based interfaces, including public informational/marketing pages, comprehensive user-facing functional modules (mirroring native app features), and administrative dashboards.  
    *   Pattern: Hybrid (SSR/SSG for public/SEO-critical pages using Next.js; CSR for authenticated user dashboards and admin sections).  
    *   Interaction:  
        *   Communicates directly with Supabase Auth for core authentication tasks (signup, login, logout, session management) via the Supabase JS SDK.  
        *   Communicates directly with Supabase database via Supabase JS SDK for simple, RLS-protected data reads where appropriate (especially in client components).  
        *   Communicates with \`carepop-backend/\` via RESTful APIs (hosted on Cloud Run) for complex business logic, server-side data fetching (via Next.js Route Handlers or Server Components proxying to the backend), operations requiring elevated privileges, third-party integrations, application-level encrypted data operations, and administrative functions.

3.  **`carepop-backend/` (Node.js/TypeScript on Google Cloud Run + Supabase BaaS):**  
    *   Responsibility: Centralized backend logic, data management source (via Supabase), core authentication provider (via Supabase), application-level security enforcement, and integration points. Acts as the system's core business logic and secure data access layer beyond basic CRUD/RLS.  
    *   Pattern: Combination of BaaS (Supabase) and Backend-for-Frontend (BFF) exposing RESTful APIs via serverless functions (Cloud Run).  
    *   Interaction: Serves as the secure data and logic source for *both* \`carepop-nativeapp/\` and \`carepop-web/\`. Interacts securely with Supabase database and external services.

Rationale: This structure simplifies individual project development compared to a complex frontend monorepo handling multiple targets (RN Native + RN Web). It allows using the optimal technology stack for each platform (Expo/RN for native, Next.js/Tailwind/Shadcn for web) while maintaining a shared backend logic and data layer.

## 2. Backend Architecture Pattern: Hybrid (BaaS + Serverless Functions)

The system employs a hybrid backend architecture leveraging managed services for efficiency and custom serverless functions for flexibility:

*   Supabase (BaaS - The Foundation):  
    *   Managed PostgreSQL Database: Primary data store. Schema defined and managed via Supabase migrations.  
    *   Built-in Authentication: Core identity provider handling user registration (via client SDK call), login (via client SDK call), session management (JWTs), password reset, potentially OAuth providers. Profile creation linked via DB Trigger.  
    *   Row Level Security (RLS): Primary mechanism for granular data access control, enforcing permissions based on user ID (\`auth.uid()\`), roles (\`auth.role()\`, or custom roles table), and relationships/consent status directly within database queries originating from clients or backend services using user tokens.  
    *   Storage: Utilized for user uploads or other file storage needs, with access controlled via Supabase Storage RLS-like policies.  
    *   Database Functions & Triggers: Used for database-level automation (e.g., \`handle_new_user\` trigger to create a profile upon \`auth.users\` insertion).  
    *   Supabase JS SDK: Primary interface for interaction from clients and Cloud Run functions.

*   Google Cloud Run (Serverless Compute - For Custom Logic):  
    *   Hosts custom backend logic implemented primarily in Node.js/TypeScript.  
    *   Strategic Use Cases: Deployed for tasks where Supabase alone is insufficient or less suitable:  
        *   Complex Business Logic/Workflows: Processes involving multiple steps, data validation beyond DB constraints, or orchestration (e.g., multi-step appointment confirmation).  
        *   Application-Level Security Wrappers: Implementing application-level encryption/decryption (using SEC-E-2 utility) before/after interacting with Supabase for designated SPI/PHI.  
        *   Protected APIs Requiring Elevated Privileges: Endpoints performing actions needing the \`service_role\` key (e.g., admin user management PROF-3, anonymized report aggregation REP-3). These functions encapsulate the \`service_role\` usage and perform rigorous application-level authorization checks based on the calling user's context *before* using the elevated key.  
        *   Third-Party API Integrations: Communicating with external services (AI/NLP, Payments, complex Notifications, Geocoding).  
        *   Scheduled Background Tasks: Serving as the execution environment for jobs triggered by Google Cloud Scheduler (e.g., sending reminders TRK-6, data retention COMPLIANCE-4, reporting aggregation REP-2/REP-3).  
        *   Serving as BFF: Providing tailored API endpoints that might aggregate data from multiple Supabase tables or external sources specifically for frontend consumption, potentially simplifying client-side logic.

Rationale: Maximizes development speed by leveraging Supabase BaaS for common needs (auth, basic data access with RLS) while retaining the flexibility and control of custom serverless code (Cloud Run) for specific, complex, or security-critical backend operations. The backend serves *both* the native mobile application and the separate web application via consistent APIs where appropriate.

## 3. Frontend Architecture Pattern: Distinct Native & Web Applications

-   **`carepop-nativeapp/` (Expo/React Native for iOS & Android):**  
    *   Focus: Delivering a polished, performant, and intuitive native mobile experience. Utilizes device capabilities where beneficial via Expo SDK.  
    *   Stack: React Native, Expo (Managed Workflow), TypeScript, React Navigation.
    *   Structure: \`App.tsx\` handles initialization (fonts, splash, context providers) and the onboarding UI flow. Core application navigation (stacks, drawers, conditional routing) is managed by \`src/navigation/AppNavigator.tsx\`.
    *   UI: Native components styled with React Native \`StyleSheet\`. Reusable UI components integrated directly into \`carepop-nativeapp/src/components/\` using a defined theme (\`carepop-nativeapp/src/theme/\`).  
    *   State Management: React Context API for simple/auth state; Zustand or Redux Toolkit considered for complex global state needs if they arise.  
    *   Data Fetching: Direct Supabase JS SDK calls for auth and simple RLS-protected reads. \`fetch\` or \`axios\` for calls to custom \`carepop-backend/\` Cloud Run APIs.

-   **`carepop-web/` (Next.js, Tailwind CSS, Shadcn UI):**  
    *   Focus: Providing a comprehensive, accessible, performant, SEO-friendly, and visually appealing web experience covering public information, user application features, and administrative functions.  
    *   Stack: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI.  
    *   UI: Web components leveraging Shadcn UI and styled with Tailwind CSS utilities.  
    *   State Management: React Context API, server state management via React Query/SWR, potentially Zustand/Redux Toolkit for complex client state.  
    *   Data Fetching: Next.js data fetching patterns (Server Components, Route Handlers proxying to backend), direct Supabase JS SDK calls from client components (for auth/simple reads), React Query/SWR for client-side API interactions with \`carepop-backend/\`.

Rationale for Separation: Avoids complexities and compromises of React Native for Web, allowing each platform (native mobile vs. web) to use its optimal technology stack for better performance, developer experience, visual polish, and SEO (for web).

## 4. Data Management & Access Control Pattern: Supabase RLS + Backend Validation

Access control follows a layered approach:

1.  Supabase Authentication: Establishes user identity via JWTs. This is the foundation used by both clients.  
2.  Supabase Row Level Security (RLS): The default and primary mechanism for restricting data access directly at the database level. Policies (\`CREATE POLICY ...\`) defined on tables ensure that queries made using a standard user JWT (via client Supabase SDK or backend Cloud Run function using the user's token) can *only* see/modify rows permitted by the policy (typically based on \`auth.uid() = user_id\`, role checks, or related data like consent).  
3.  Backend Application-Level Authorization (in Cloud Run): Explicit checks implemented within \`carepop-backend/\` Cloud Run functions are used when:  
    *   RLS is insufficient for complex rules (e.g., multi-step checks, complex relationship-based access).  
    *   Operations require elevated privileges (using the \`service_role\` key). In these cases, the Cloud Run function *must* first verify the *calling user's* identity and role/permissions (from the JWT via SEC-BE-2 middleware) *before* using the \`service_role\` key to perform the action. This pattern is critical for secure admin functions or system processes interacting with protected data.  
    *   Validating input data or enforcing business logic before database operations.  
4.  Client-Side UI Controls: Frontend applications (\`carepop-nativeapp\`, \`carepop-web\`) hide or disable UI elements based on the authenticated user's role or permissions, but this is *purely for UX and not considered a security boundary*. Security is enforced by Supabase RLS and backend checks.

Principle: Enforce permissions at the lowest possible layer (database via RLS first), with backend code providing necessary validation and secure handling for more complex scenarios or elevated privilege use.

## 5. Authentication Pattern: Backend-Adapter with Client-Side Session Management

*   **Flow:**  
    1.  **Client Initiation:** Frontend apps (`nativeapp` or `web`) make a `POST` request to the custom `carepop-backend` API endpoints: `/api/v1/public/login` or `/api/v1/public/register`. They do **not** call the Supabase SDK's `signUp` or `signIn` methods for this.
    2.  **Backend Handles Auth & Profile Creation:** The backend's `AuthService` receives the request. It calls the appropriate Supabase Auth method (e.g., `supabase.auth.signInWithPassword`) using its server-side client. If registration is successful, the backend is also responsible for ensuring the user's initial profile is created (either via a service call or the `handle_new_user` DB trigger).
    3.  **Backend Returns Session:** The backend's `authController` formats a JSON response containing the `accessToken` and `refreshToken` (for login) or a success message (for registration) and sends it back to the client. The tokens are in the response body.
    4.  **Client Sets Session:** The client receives the token payload from the backend API. It then uses the Supabase JS SDK's `supabase.auth.setSession()` method to manually initialize the client-side session.
    5.  **`onAuthStateChange` Trigger:** Calling `setSession` triggers the `onAuthStateChange` listener in the client application, which proceeds with user-state updates and profile fetching as if a direct Supabase login had occurred.
    6.  **Authenticated Requests:** For all subsequent requests, the client can now:
        *   Make authenticated calls to the `carepop-backend` API by extracting the token from the session and adding it to the `Authorization` header.
        *   Make authenticated calls directly to Supabase (e.g., for RLS-protected table access) as the client-side SDK has been successfully initialized with a valid session.
*   **Rationale:** This pattern centralizes core authentication and user-creation business logic in the backend, providing a single, controlled gateway. It gives the backend authority over the process while still allowing the frontends to leverage the convenience of the Supabase JS SDK for session management and direct data access after the initial authentication is complete.

## 6. Security Architecture Pattern: Defense-in-Depth

Security is layered across the stack:

*   Infrastructure: Secure configurations for GCP (IAM, VPC Firewalls, Cloud Run security settings, Secret Manager) and Supabase (RLS enabled, Auth settings secured, Network restrictions if needed). Regular reviews (SEC-OTHER-1).  
*   Transport: TLS/HTTPS enforced everywhere (SEC-BE-5).  
*   Authentication: Handled by robust Supabase Auth, secure session management on clients (AUTH-3, SEC-FE-1).  
*   Authorization: Primarily via Supabase RLS (COMPLIANCE-2), supplemented by explicit backend application-level checks in Cloud Run (SEC-BE-3). Principle of Least Privilege.  
*   Data Encryption:  
    *   Application-level AES-256-GCM encryption for SPI/PHI applied by backend Cloud Run functions (SEC-E-2 / COMPLIANCE-1) before storing in Supabase.  
    *   Infrastructure-level encryption provided by Supabase/GCP.  
*   Input Validation: Applied at backend API boundaries (Cloud Run) and potentially client-side for UX.  
*   Secrets Management: All sensitive keys managed by Google Cloud Secret Manager (SEC-S-1).  
*   Auditing & Monitoring: Comprehensive logging (SEC-A-1, COMPLIANCE-3) and monitoring/alerting (GCP Monitoring, potential Supabase alerts) for security events.  
*   Vulnerability Management: SAST (SEC-TEST-1), Dependency Scanning (SEC-TEST-2), DAST (SEC-TEST-3), Manual Penetration Testing (SEC-TEST-4).  
*   Compliance Specific: RLS, Encryption, DSAR handling (COMPLIANCE-6), Retention (COMPLIANCE-4) aligned with DPA/HIPAA requirements.

## 7. API Design Pattern: RESTful APIs (Cloud Run)

Backend services hosted on Cloud Run will expose RESTful APIs designed to be consumed by both native and web clients. Considerations:

*   Consistency: Use consistent naming conventions, request/response structures (e.g., standard JSON format for errors and data).  
*   Statelessness: APIs should be stateless where possible, relying on the client's JWT for authentication/authorization context.  
*   Client Needs: While aiming for consistency, endpoints might need slight variations or specific parameters to cater optimally to different client needs (native vs. web).  
*   Versioning: Consider API versioning (e.g., \`/api/v1/...\`) early on if significant breaking changes are anticipated later.  
*   Documentation: Use OpenAPI/Swagger or similar tools to document API endpoints, request/response schemas, and authentication requirements.

## 8. Deployment Pattern

-   Distinct Applications: \`carepop-nativeapp\`, \`carepop-web\`, and \`carepop-backend\` are deployed independently.  
-   Infrastructure-as-Code (IaC): Recommended for managing GCP resources (Terraform, Pulumi).  
-   CI/CD: Automated pipelines (e.g., GitHub Actions) triggered by pushes to specific directories handle building, testing, and deploying each application to its respective platform (EAS, Vercel/Netlify, Cloud Run).

## 9. State Management Strategy

-   Leverage platform-specific best practices: React Context/Zustand/Redux for \`carepop-nativeapp\`; React Context/Zustand/Redux + React Query/SWR for \`carepop-web\`.  
-   Keep global state minimal; derive state where possible.

## 10. Error Handling and Logging Pattern

-   Client-Side: Graceful error display to users, specific error messages where helpful, generic messages for unexpected failures. Log errors to a monitoring service (e.g., Sentry, Bugsnag) or backend logging endpoint.  
-   **Backend-Side (`carepop-backend`)**:
    -   **Standardized Error Class:** All anticipated, operational errors within the `service` layer should be thrown using the custom `AppError` class (e.g., `throw new AppError('User not found', 404)`). This ensures consistent error structure.
    -   **Async Error Handling:** All `controller` methods are wrapped in an `asyncHandler` utility. This eliminates the need for `try/catch` blocks in controllers by automatically catching errors (both synchronous and asynchronous) and passing them to the global error handling middleware.
    -   **Global Error Middleware:** A final middleware in the Express chain (`errorHandler.ts`) is responsible for catching all errors passed via `next(error)`. It formats the error into a standardized JSON response (e.g., `{ status: 'error', message: '...', statusCode: 500 }`) and sends it to the client. It also logs the full error details to Google Cloud Logging.
-   Supabase: Handle errors returned by the Supabase JS SDK gracefully on clients and in backend Cloud Run functions. Monitor Supabase logs for database-level errors.

## 11. Shared Code Strategy (Minimalist)

-   UI Components: Independent per platform (\`carepop-nativeapp/src/components\` vs. \`carepop-web/src/components\`). No direct code sharing.  
-   Types/Interfaces/Utilities: Currently independent per project. If significant overlap arises, consider creating a dedicated \`packages/shared-types\` or \`packages/shared-utils\` directory at the root, potentially managed with pnpm workspaces *only if* the overhead is justified. For now, maintain separation.  
-   Configuration: Each project manages its own ESLint, Prettier, TypeScript config.

### User Profile Management

-   **Data Storage**: User profile data is stored in the Supabase `profiles` table, linked to `auth.users` via `user_id`.
-   **Initial Profile Creation (Trigger)**: A Supabase database trigger (`on_auth_user_created` executing `public.handle_new_user()`, defined in migration `20240815120000_create_handle_new_user_trigger.sql`) automatically creates a basic profile entry (stub with non-sensitive data like email) when a new user signs up via Supabase Auth.
-   **Detailed Profile Completion & Encryption (Client + Backend API)**: After initial signup, users are typically routed to a `CreateProfileScreen` (or similar flow) to fill in more detailed information. Data for fields requiring Application-Level Encryption (e.g., `genderIdentity`, `pronouns`, `assignedSexAtBirth`, `philhealth_no`, etc.) is sent to the backend (`updateUserProfileService`), which encrypts these fields before saving them.
-   **Profile Updates (Backend API)**: For authenticated users, profile updates (text-based fields) are handled via a dedicated backend API (`PATCH /api/users/profile` in `carepop-backend`). This API uses `authMiddleware` for authentication and `profileService` to interact with the Supabase database. Fields requiring encryption are encrypted by the service before saving.
    -   The backend API, upon successful update, returns the complete updated profile object (with sensitive fields decrypted). This response object wraps the profile data within a `data` key (e.g., `{"data": {...profile_object...}, "message": "..."}`). Frontend consumers must access `responseData.data` to get the actual profile entity.
-   **Profile Viewing (Backend API Recommended for Decryption)**: Profile data is displayed on screens like `MyProfileScreen`. To ensure sensitive fields are decrypted, fetching profile data should ideally go through a backend service (like `getUserProfileService`) that handles decryption. If direct client-Supabase reads are used for non-sensitive parts, a separate call to a backend decryption service might be needed for sensitive fields, or sensitive fields might not be displayed directly without this step.
-   **Client-Side Updates (Legacy/Specific Cases)**: Certain non-text updates (like avatar uploads, previously) might be handled directly by the client interacting with Supabase services (e.g., Storage), followed by an update to the `profiles` table (either via backend or client-side call if RLS allows).

### Native Mobile App (`carepop-mobile`)

-   **Navigation**: Managed by `react-navigation`. Core navigation logic is centralized in `src/navigation/AppNavigator.tsx`. This includes a `RootStack.Navigator` that handles the top-level flow (Loading, Auth, CreateProfile, Main App Drawer).
    -   The `RootStack.Navigator` checks `!session` first. If a session exists, it then checks `!profile || !profile.first_name` (note: `first_name` is snake_case, matching the `Profile` interface from `supabase.ts`) to determine if the user needs to complete their profile via `CreateProfileScreen` or can proceed to the `MainAppDrawer`.

## 12. Service-Driven Availability Pattern

*   **Objective:** To manage provider availability with granularity, tying schedules directly to the specific services they offer. This allows the booking system to present accurate appointment slots based on the user's selected service.
*   **Core Components:**
    1.  **`services` Table:** The master list of all services offered by the platform (e.g., "Family Planning Consultation", "HIV Testing").
    2.  **`provider_services` Table:** A join table linking providers to the services they are qualified to perform.
    3.  **`provider_weekly_schedules` Table:** Defines a provider's recurring, regular schedule. Crucially, each entry is linked to a specific `service_id`, meaning a provider can set different recurring schedules for different services (e.g., Mondays 9-12 for "SRH Checkup", Tuesdays 1-5 for "Mental Wellness Session").
    4.  **`provider_availability_overrides` Table:** Defines one-off changes to the recurring schedule. This can be used to open up new availability or to block off time (e.g., for holidays, personal leave). These overrides can also be linked to a specific service or apply to all of the provider's services for that day.
*   **Flow:**
    1.  A user selects a `service` they wish to book.
    2.  The appointment booking system queries for providers linked to that `service_id` via the `provider_services` table.
    3.  For each eligible provider, the system fetches their `provider_weekly_schedules` for that specific `service_id`.
    4.  It then consults the `provider_availability_overrides` table to apply any additions or block-offs for the relevant date range.
    5.  The final, calculated availability is presented to the user as open appointment slots.
*   **Rationale:** This pattern provides maximum flexibility for clinics and providers to manage complex schedules. It ensures users only see and book slots for the specific service they need with a provider who is actually scheduled to perform that service at that time. It replaces a simpler model where provider availability was generic and not tied to a specific clinical service.

## 13. JSON Schema-to-Form Pattern

*   **Objective:** To enable the dynamic creation and rendering of forms within the application without requiring new frontend deployments for every new form or change.
*   **Core Components:**
    1.  **`forms` Table:** A database table that stores form definitions. Key columns include `name`, `description`, and `schema_definition` (a `jsonb` column).
    2.  **`schema_definition` (JSONB):** This column contains a JSON object that defines the structure, fields, validation rules, and layout of a form. This schema can be based on a standard like JSON Schema or a custom structure tailored for the form rendering library.
    3.  **Form Rendering Engine (Frontend):** A component in the web (`carepop-web`) and native (`carepop-nativeapp`) applications responsible for fetching a form's JSON schema and dynamically rendering the appropriate UI input fields (text inputs, selects, checkboxes, etc.) based on the schema's contents.
    4.  **Validation Library (Frontend):** A library like `Zod` is used to parse the `schema_definition` and create a validation schema that can be used by a form library.
    5.  **Form Library (Frontend):** A library like `react-hook-form` manages the form state, handles user input, and integrates with the validation library to provide real-time feedback.
    6.  **`form_submissions` Table:** A table to securely store user-submitted form data. The actual data is stored in an encrypted format (`encrypted_submission_data`) and linked back to the user, the form definition, and potentially an appointment.
*   **Flow:**
    1.  An administrator creates or updates a form definition (the JSON schema) via an admin UI.
    2.  When a user needs to fill out a form (e.g., a pre-appointment questionnaire), the client application fetches the appropriate JSON schema from the `forms` table via a backend API.
    3.  The Form Rendering Engine parses the schema and displays the form to the user.
    4.  The user fills out the form. `react-hook-form` and `Zod` handle the state and validation.
    5.  Upon submission, the form data is sent to a secure backend endpoint.
    6.  The backend encrypts the entire submission payload and stores it in the `form_submissions` table.
*   **Rationale:** This pattern decouples form management from frontend code, empowering administrators to manage forms dynamically. It provides a flexible, scalable, and secure way to handle a wide variety of data collection needs (intake forms, consent forms, feedback surveys) across the platform. For the MVP, the JSON schema can be created manually by developers and inserted into the database.

## 14. Diagnostic Protocols

### Critical API Failure Diagnosis (cURL Protocol)

When high-level debugging (e.g., browser DevTools, client-side logging) fails to identify the root cause of a critical API failure, especially persistent 4xx or 5xx errors, it is mandatory to escalate to a low-level, command-line diagnostic protocol using `curl`. This approach isolates the backend API completely, providing an unbiased, ground-truth result.

**The Three-Layer Diagnostic Protocol:**

This protocol must be executed in order to methodically pinpoint the point of failure.

*   **Layer 1: Database Verification (The Ground Truth)**
    *   **Objective:** Confirm the underlying data exists and is correctly structured in the Supabase database. A flaw at this layer invalidates all other tests.
    *   **Action:**
        1.  Identify the relevant user or entity ID involved in the failing request (e.g., the User ID from a JWT `sub` claim).
        2.  Connect to the Supabase SQL Editor.
        3.  Run a direct `SELECT` query on the relevant table (e.g., `SELECT * FROM public.profiles WHERE user_id = '...';`).
    *   **Analysis:**
        *   **Row(s) Returned:** The data exists. The issue is likely in the API or client layer.
        *   **No Rows Returned:** The data does not exist. The problem is in the data creation or integrity logic (e.g., a broken Supabase trigger like `handle_new_user`, a failed backfill, or an incomplete business process). The investigation must focus on fixing the data creation process first.

*   **Layer 2: Backend API Verification (The cURL Test)**
    *   **Objective:** Test the backend API endpoint in complete isolation, removing any potential misconfiguration from frontend clients.
    *   **Action:**
        1.  Obtain a valid JWT `access_token` for the user context you are testing.
        2.  In a terminal, store the JWT in a shell variable: `JWT="<paste_your_token_here>"`
        3.  Execute the `curl` command with the `--verbose` (`-v`) flag and the `Authorization` header.
            ```bash
            # Example for fetching a user profile
            curl --verbose -H "Authorization: Bearer $JWT" http://localhost:3001/api/v1/users/profile
            ```
    *   **Analysis (of `curl -v` output):**
        *   `< HTTP/1.1 200 OK`: The backend API is working correctly. The fault lies entirely within the frontend client (Layer 3).
        *   `< HTTP/1.1 404 Not Found`: If Layer 1 confirmed the data exists, this indicates a bug in the backend service or controller logic (e.g., incorrect query, using the wrong Supabase client key like `anon` instead of `service_role`). If Layer 1 confirmed data *doesn't* exist, this is the *expected and correct* behavior of the API.
        *   `< HTTP/1.1 401 Unauthorized` or `403 Forbidden`: The JWT is likely invalid, expired, or the `authMiddleware` is rejecting it. The issue is with token generation or the auth middleware logic.
        *   `< HTTP/1.1 500 Internal Server Error`: A critical unhandled error occurred in the backend. Check backend logs immediately.

*   **Layer 3: Frontend Client Verification (The Final Link)**
    *   **Objective:** To be performed *only if* the Layer 2 cURL test returned a `200 OK`. This proves the backend is innocent and the fault lies with the client's request.
    *   **Action:**
        1.  Open the browser's DevTools Network tab (or equivalent for native).
        2.  Trigger the failing request in the application.
        3.  Inspect the failed request in detail. Compare it, header-by-header and URL-by-URL, against the successful `curl` command.
    *   **Analysis:** Look for common discrepancies: Is the `Authorization` header missing or malformed? Is the `Bearer` scheme missing? Is the URL path subtly incorrect? Is there a CORS issue? Is the client-side code improperly handling the async response?

**Conclusion:** This protocol provides a definitive path to isolating backend, frontend, or data-layer issues, preventing wasted time on incorrect assumptions.

## 15. Privileged Backend Operations Pattern

*   **Objective:** To establish a secure, standard method for backend services to perform actions that require bypassing Row-Level Security (RLS). This is essential for administrative tasks, system processes, and fetching user data (like roles) that a user's own token cannot access.
*   **Core Principle:** Never trust the client to have elevated privileges. The backend must be the sole arbiter of when and how to bypass RLS, and it must only do so after rigorously authenticating and authorizing the original user's request.
*   **Components:**
    1.  **Public Supabase Client (`public-client.ts`):** Initializes a Supabase client using the public `anon` key. This client is used for operations that do not require special privileges, such as validating a user's JWT with `supabase.auth.getUser(token)`. It is subject to all RLS policies.
    2.  **Service Role Client (`service-client.ts`):** Initializes a separate Supabase client using the powerful `SUPABASE_SERVICE_ROLE_KEY` environment variable. This client can bypass **all** RLS policies and has full database access. **It must only be used in secure, server-side environments and never exposed to the client.**
    3.  **Authentication Middleware (`auth.middleware.ts`):** This middleware acts as the secure gateway for privileged operations.
*   **Flow:**
    1.  A request with a user's JWT arrives at a protected backend endpoint.
    2.  The `auth.middleware.ts` intercepts the request.
    3.  **Step A (Authentication):** The middleware first uses the **Public Supabase Client** to validate the user's JWT. This confirms the user is who they say they are.
    4.  **Step B (Authorization & Data Fetching):** If the token is valid, the middleware then switches to using the **Service Role Client** to perform subsequent queries. It fetches the user's profile and, crucially, their roles from the `user_roles` table. Because it uses the service role key, these queries are not blocked by RLS and will succeed.
    5.  **Step C (Context Attachment):** The middleware attaches the complete, trusted user object (including roles) to the Express `req.user` object.
    6.  The request proceeds to the next middleware (e.g., `role.middleware.ts`) or the controller, which can now confidently make authorization decisions based on the roles attached to `req.user`.
*   **Rationale:** This pattern enforces a strict security boundary. The backend authenticates the user within their own limited context and only then uses its own elevated privileges to securely gather the necessary data to authorize the requested action. This prevents any possibility of a client bypassing RLS and is the standard, secure way to build a multi-tenant application with administrative functions.

## Admin Dashboard Data Fetching Pattern (RSC + Zod)

**Status:** Adopted as of [current date]

This pattern is the standard for fetching and displaying paginated, searchable, and sortable data within the Admin Dashboard. It leverages React Server Components (RSCs) for performance and security.

**Reference Implementation:** `carepop-web/src/app/admin/appointments/components/AppointmentTable.tsx`

### Core Components:

1.  **Server Component (`...Table.tsx`):**
    *   **Purpose:** The main entry point. Handles server-side logic.
    *   **Responsibilities:**
        *   Defines a `zod` schema to validate and coerce search parameters (page, per_page, sort, search, etc.).
        *   Parses the incoming props using the zod schema.
        *   Calls the data fetching function (`get...()`) with the validated parameters.
        *   Passes the fetched data and total record count to the Client Component.

2.  **Data Fetching Function (`get...()`):**
    *   **Purpose:** A dedicated `async` function to query the database.
    *   **Responsibilities:**
        *   Initializes the Supabase server client (`createSupabaseServerClient`).
        *   Constructs the Supabase query, handling:
            *   Pagination (`.range()`).
            *   Sorting (`.order()`).
            *   Filtering/Searching (`.eq()`, `.or()`, `.ilike()`).
            *   Joins (`select('relation:table(columns)')`).
        *   Includes `{ count: 'exact' }` in the select to get the total number of records for pagination.
        *   Performs graceful error handling, logging errors to the server console and returning a default state (e.g., ` { data: [], totalRecords: 0 }`).
    
3.  **Client Component (`...TableClient.tsx`):**
    *   **Purpose:** Handles all client-side interactivity and rendering.
    *   **Responsibilities:**
        *   Receives data via props from its parent Server Component.
        *   Uses `shadcn/ui`'s `<DataTable />` component (or a similar table structure).
        *   Manages UI state (e.g., row selection, button clicks).
        *   Handles user interactions that trigger navigation/refreshes (e.g., changing pages, applying sorts/filters), which will cause the parent RSC to re-render with new search params.
**END OF FILE: systemPatterns.md (Final Version)**

---

</rewritten_file>


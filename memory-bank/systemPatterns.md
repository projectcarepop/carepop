Okay, here is the complete \`systemPatterns.md\` file, revised and expanded to fully reflect the finalized three-pillar architecture (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`), the direct Client-Supabase Authentication pattern, and the other design decisions we've discussed.

\---

\*\*START OF FILE: systemPatterns.md (Final Version)\*\*

\`\`\`markdown  
\# System Design Patterns & Architectural Blueprints

This document outlines the core architectural patterns and design principles employed in the CarePoP/QueerCare platform.

\#\# 1\. Overall Architecture Pattern: Modular Three-Pillar System

The CarePoP platform is architected as a system with three distinct top-level application pillars, each residing within the main Git repository but developed and potentially deployed independently:

1\.  \*\*\`carepop-nativeapp/\` (Expo/React Native):\*\*  
    \*   \*\*Responsibility:\*\* Provides the user-facing \*\*native mobile application for iOS and Android\*\*. Handles all mobile-specific user interactions and presentation logic.  
    \*   \*\*Pattern:\*\* Client-Side Rendering (CSR) native application.  
    \*   \*\*Interaction:\*\*  
        \*   Communicates \*\*directly with Supabase Auth\*\* for core authentication tasks (signup, login, logout, session management) via the Supabase JS SDK.  
        \*   Communicates \*\*directly with Supabase database\*\* via Supabase JS SDK for simple, RLS-protected data reads where appropriate.  
        \*   Communicates with \*\*\`carepop-backend/\` via RESTful APIs\*\* (hosted on Cloud Run) for complex business logic, operations requiring elevated privileges, third-party integrations, application-level encrypted data operations, and potentially specific data queries.

2\.  \*\*\`carepop-web/\` (Next.js, Tailwind CSS, Shadcn UI):\*\*  
    \*   \*\*Responsibility:\*\* Provides \*\*all web-based interfaces\*\*, including public informational/marketing pages, comprehensive user-facing functional modules (mirroring native app features), and administrative dashboards.  
    \*   \*\*Pattern:\*\* Hybrid (SSR/SSG for public/SEO-critical pages using Next.js; CSR for authenticated user dashboards and admin sections).  
    \*   \*\*Interaction:\*\*  
        \*   Communicates \*\*directly with Supabase Auth\*\* for core authentication tasks (signup, login, logout, session management) via the Supabase JS SDK.  
        \*   Communicates \*\*directly with Supabase database\*\* via Supabase JS SDK for simple, RLS-protected data reads where appropriate (especially in client components).  
        \*   Communicates with \*\*\`carepop-backend/\` via RESTful APIs\*\* (hosted on Cloud Run) for complex business logic, server-side data fetching (via Next.js Route Handlers or Server Components proxying to the backend), operations requiring elevated privileges, third-party integrations, application-level encrypted data operations, and administrative functions.

3\.  \*\*\`carepop-backend/\` (Node.js/TypeScript on Google Cloud Run \+ Supabase BaaS):\*\*  
    \*   \*\*Responsibility:\*\* Centralized backend logic, data management source (via Supabase), core authentication provider (via Supabase), application-level security enforcement, and integration points. Acts as the system's core business logic and secure data access layer beyond basic CRUD/RLS.  
    \*   \*\*Pattern:\*\* Combination of BaaS (Supabase) and Backend-for-Frontend (BFF) exposing RESTful APIs via serverless functions (Cloud Run).  
    \*   \*\*Interaction:\*\* Serves as the secure data and logic source for \*both\* \`carepop-nativeapp/\` and \`carepop-web/\`. Interacts securely with Supabase database and external services.

\*\*Rationale:\*\* This structure simplifies individual project development compared to a complex frontend monorepo handling multiple targets (RN Native \+ RN Web). It allows using the optimal technology stack for each platform (Expo/RN for native, Next.js/Tailwind/Shadcn for web) while maintaining a shared backend logic and data layer.

\#\# 2\. Backend Architecture Pattern: Hybrid (BaaS \+ Serverless Functions)

The system employs a hybrid backend architecture leveraging managed services for efficiency and custom serverless functions for flexibility:

\*   \*\*Supabase (BaaS \- The Foundation):\*\*  
    \*   \*\*Managed PostgreSQL Database:\*\* Primary data store. Schema defined and managed via Supabase migrations.  
    \*   \*\*Built-in Authentication:\*\* Core identity provider handling user registration (via client SDK call), login (via client SDK call), session management (JWTs), password reset, potentially OAuth providers. Profile creation linked via DB Trigger.  
    \*   \*\*Row Level Security (RLS):\*\* \*\*Primary mechanism\*\* for granular data access control, enforcing permissions based on user ID (\`auth.uid()\`), roles (\`auth.role()\`, or custom roles table), and relationships/consent status directly within database queries originating from clients or backend services using user tokens.  
    \*   \*\*Storage:\*\* Utilized for user uploads or other file storage needs, with access controlled via Supabase Storage RLS-like policies.  
    \*   \*\*Database Functions & Triggers:\*\* Used for database-level automation (e.g., \`handle\_new\_user\` trigger to create a profile upon \`auth.users\` insertion).  
    \*   \*\*Supabase JS SDK:\*\* Primary interface for interaction from clients and Cloud Run functions.

\*   \*\*Google Cloud Run (Serverless Compute \- For Custom Logic):\*\*  
    \*   Hosts custom backend logic implemented primarily in Node.js/TypeScript.  
    \*   \*\*Strategic Use Cases:\*\* Deployed for tasks where Supabase alone is insufficient or less suitable:  
        \*   \*\*Complex Business Logic/Workflows:\*\* Processes involving multiple steps, data validation beyond DB constraints, or orchestration (e.g., multi-step appointment confirmation).  
        \*   \*\*Application-Level Security Wrappers:\*\* Implementing application-level encryption/decryption (using SEC-E-2 utility) before/after interacting with Supabase for designated SPI/PHI.  
        \*   \*\*Protected APIs Requiring Elevated Privileges:\*\* Endpoints performing actions needing the \`service\_role\` key (e.g., admin user management PROF-3, anonymized report aggregation REP-3). These functions encapsulate the \`service\_role\` usage and perform rigorous application-level authorization checks based on the calling user's context \*before\* using the elevated key.  
        \*   \*\*Third-Party API Integrations:\*\* Communicating with external services (AI/NLP, Payments, complex Notifications, Geocoding).  
        \*   \*\*Scheduled Background Tasks:\*\* Serving as the execution environment for jobs triggered by Google Cloud Scheduler (e.g., sending reminders TRK-6, data retention COMPLIANCE-4, reporting aggregation REP-2/REP-3).  
        \*   \*\*Serving as BFF:\*\* Providing tailored API endpoints that might aggregate data from multiple Supabase tables or external sources specifically for frontend consumption, potentially simplifying client-side logic.

\*\*Rationale:\*\* Maximizes development speed by leveraging Supabase BaaS for common needs (auth, basic data access with RLS) while retaining the flexibility and control of custom serverless code (Cloud Run) for specific, complex, or security-critical backend operations. The backend serves \*\*both the native mobile application and the separate web application\*\* via consistent APIs where appropriate.

\#\# 3\. Frontend Architecture Pattern: Distinct Native & Web Applications

\-   \*\*\`carepop-nativeapp/\` (Expo/React Native for iOS & Android):\*\*  
    \*   \*\*Focus:\*\* Delivering a polished, performant, and intuitive native mobile experience. Utilizes device capabilities where beneficial via Expo SDK.  
    \*   \*\*Stack:\*\* React Native, Expo (Managed Workflow), TypeScript, React Navigation (Native Stack recommended).  
    \*   \*\*UI:\*\* Native components styled with React Native \`StyleSheet\`. Reusable UI components integrated directly into \`carepop-nativeapp/src/components/\` using a defined theme (\`carepop-nativeapp/src/theme/\`).  
    \*   \*\*State Management:\*\* React Context API for simple/auth state; Zustand or Redux Toolkit considered for complex global state needs if they arise.  
    \*   \*\*Data Fetching:\*\* Direct Supabase JS SDK calls for auth and simple RLS-protected reads. \`fetch\` or \`axios\` for calls to custom \`carepop-backend/\` Cloud Run APIs.

\-   \*\*\`carepop-web/\` (Next.js, Tailwind CSS, Shadcn UI):\*\*  
    \*   \*\*Focus:\*\* Providing a comprehensive, accessible, performant, SEO-friendly, and visually appealing web experience covering public information, user application features, and administrative functions.  
    \*   \*\*Stack:\*\* Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI.  
    \*   \*\*UI:\*\* Web components leveraging Shadcn UI and styled with Tailwind CSS utilities.  
    \*   \*\*State Management:\*\* React Context API, server state management via React Query/SWR, potentially Zustand/Redux Toolkit for complex client state.  
    \*   \*\*Data Fetching:\*\* Next.js data fetching patterns (Server Components, Route Handlers proxying to backend), direct Supabase JS SDK calls from client components (for auth/simple reads), React Query/SWR for client-side API interactions with \`carepop-backend/\`.

\*\*Rationale for Separation:\*\* Avoids complexities and compromises of React Native for Web, allowing each platform (native mobile vs. web) to use its optimal technology stack for better performance, developer experience, visual polish, and SEO (for web).

\#\# 4\. Data Management & Access Control Pattern: Supabase RLS \+ Backend Validation

Access control follows a layered approach:

1\.  \*\*Supabase Authentication:\*\* Establishes user identity via JWTs. This is the foundation used by both clients.  
2\.  \*\*Supabase Row Level Security (RLS):\*\* The \*\*default and primary mechanism\*\* for restricting data access directly at the database level. Policies (\`CREATE POLICY ...\`) defined on tables ensure that queries made using a standard user JWT (via client Supabase SDK or backend Cloud Run function using the user's token) can \*only\* see/modify rows permitted by the policy (typically based on \`auth.uid() \= user\_id\`, role checks, or related data like consent).  
3\.  \*\*Backend Application-Level Authorization (in Cloud Run):\*\* Explicit checks implemented within \`carepop-backend/\` Cloud Run functions are used when:  
    \*   RLS is insufficient for complex rules (e.g., multi-step checks, complex relationship-based access).  
    \*   Operations require elevated privileges (using the \`service\_role\` key). In these cases, the Cloud Run function \*\*must\*\* first verify the \*calling user's\* identity and role/permissions (from the JWT via SEC-BE-2 middleware) \*before\* using the \`service\_role\` key to perform the action. This pattern is critical for secure admin functions or system processes interacting with protected data.  
    \*   Validating input data or enforcing business logic before database operations.  
4\.  \*\*Client-Side UI Controls:\*\* Frontend applications (\`carepop-nativeapp\`, \`carepop-web\`) hide or disable UI elements based on the authenticated user's role or permissions, but this is \*\*purely for UX and not considered a security boundary\*\*. Security is enforced by Supabase RLS and backend checks.

\*\*Principle:\*\* Enforce permissions at the lowest possible layer (database via RLS first), with backend code providing necessary validation and secure handling for more complex scenarios or elevated privilege use.

\#\# 5\. Authentication Pattern: Direct Client-Supabase Auth \+ Trigger

\*   \*\*Flow:\*\*  
    1\.  \*\*Client Initiation:\*\* Frontend apps (\`nativeapp\` or \`web\`) use the Supabase JS SDK to call \`supabase.auth.signUp()\` or \`supabase.auth.signInWithPassword()\` (or OAuth methods).  
    2\.  \*\*Supabase Handles Auth:\*\* Supabase Auth service processes the request, verifies credentials/identity, handles email confirmations (if enabled), and creates an entry in the \`auth.users\` table.  
    3\.  \*\*Supabase Returns Session:\*\* Supabase Auth returns a session object (including JWT access token and refresh token) directly to the client via the SDK.  
    4\.  \*\*Profile Trigger (Backend \- Supabase):\*\* An \`AFTER INSERT\` trigger on the \`auth.users\` table executes the \`handle\_new\_user\` PostgreSQL function within Supabase.  
    5\.  \*\*Profile Creation (Backend \- Supabase):\*\* The \`handle\_new\_user\` function inserts a new row into the \`public.profiles\` table, linking it to the new user ID (\`NEW.id\`) and copying necessary initial data (like \`NEW.email\`).  
    6\.  \*\*Client Session Management:\*\* The client securely stores/manages the received session using SDK helpers and secure storage mechanisms (SEC-FE-1), attaching the access token to subsequent authenticated requests (either direct Supabase data calls or calls to the Cloud Run backend APIs).  
\*   \*\*Rationale:\*\* Simplifies the core authentication flow, reduces latency, leverages Supabase's core strengths, and removes the need for specific backend auth endpoint wrappers for simple cases. Profile creation remains automated.

\#\# 6\. Security Architecture Pattern: Defense-in-Depth

Security is layered across the stack:

\*   \*\*Infrastructure:\*\* Secure configurations for GCP (IAM, VPC Firewalls, Cloud Run security settings, Secret Manager) and Supabase (RLS enabled, Auth settings secured, Network restrictions if needed). Regular reviews (SEC-OTHER-1).  
\*   \*\*Transport:\*\* TLS/HTTPS enforced everywhere (SEC-BE-5).  
\*   \*\*Authentication:\*\* Handled by robust Supabase Auth, secure session management on clients (AUTH-3, SEC-FE-1).  
\*   \*\*Authorization:\*\* Primarily via Supabase RLS (COMPLIANCE-2), supplemented by explicit backend application-level checks in Cloud Run (SEC-BE-3). Principle of Least Privilege.  
\*   \*\*Data Encryption:\*\*  
    \*   Application-level AES-256-GCM encryption for SPI/PHI applied by backend Cloud Run functions (SEC-E-2 / COMPLIANCE-1) before storing in Supabase.  
    \*   Infrastructure-level encryption provided by Supabase/GCP.  
\*   \*\*Input Validation:\*\* Applied at backend API boundaries (Cloud Run) and potentially client-side for UX.  
\*   \*\*Secrets Management:\*\* All sensitive keys managed by Google Cloud Secret Manager (SEC-S-1).  
\*   \*\*Auditing & Monitoring:\*\* Comprehensive logging (SEC-A-1, COMPLIANCE-3) and monitoring/alerting (GCP Monitoring, potential Supabase alerts) for security events.  
\*   \*\*Vulnerability Management:\*\* SAST (SEC-TEST-1), Dependency Scanning (SEC-TEST-2), DAST (SEC-TEST-3), Manual Penetration Testing (SEC-TEST-4).  
\*   \*\*Compliance Specific:\*\* RLS, Encryption, DSAR handling (COMPLIANCE-6), Retention (COMPLIANCE-4) aligned with DPA/HIPAA requirements.

\#\# 7\. API Design Pattern: RESTful APIs (Cloud Run)

Backend services hosted on Cloud Run will expose RESTful APIs designed to be consumed by both native and web clients. Considerations:

\*   \*\*Consistency:\*\* Use consistent naming conventions, request/response structures (e.g., standard JSON format for errors and data).  
\*   \*\*Statelessness:\*\* APIs should be stateless where possible, relying on the client's JWT for authentication/authorization context.  
\*   \*\*Client Needs:\*\* While aiming for consistency, endpoints might need slight variations or specific parameters to cater optimally to different client needs (native vs. web).  
\*   \*\*Versioning:\*\* Consider API versioning (e.g., \`/api/v1/...\`) early on if significant breaking changes are anticipated later.  
\*   \*\*Documentation:\*\* Use OpenAPI/Swagger or similar tools to document API endpoints, request/response schemas, and authentication requirements.

\#\# 8\. Deployment Pattern

\-   \*\*Distinct Applications:\*\* \`carepop-nativeapp\`, \`carepop-web\`, and \`carepop-backend\` are deployed independently.  
\-   \*\*Infrastructure-as-Code (IaC):\*\* Recommended for managing GCP resources (Terraform, Pulumi).  
\-   \*\*CI/CD:\*\* Automated pipelines (e.g., GitHub Actions) triggered by pushes to specific directories handle building, testing, and deploying each application to its respective platform (EAS, Vercel/Netlify, Cloud Run).

\#\# 9\. State Management Strategy

\-   Leverage platform-specific best practices: React Context/Zustand/Redux for \`carepop-nativeapp\`; React Context/Zustand/Redux \+ React Query/SWR for \`carepop-web\`.  
\-   Keep global state minimal; derive state where possible.

\#\# 10\. Error Handling and Logging Pattern

\-   \*\*Client-Side:\*\* Graceful error display to users, specific error messages where helpful, generic messages for unexpected failures. Log errors to a monitoring service (e.g., Sentry, Bugsnag) or backend logging endpoint.  
\-   \*\*Backend-Side (Cloud Run):\*\* Use standardized error responses (e.g., consistent JSON structure with error codes/messages). Log all errors with detailed stack traces and context to Google Cloud Logging (FOUND-4, SEC-A-1). Implement global error handling middleware.  
\-   \*\*Supabase:\*\* Handle errors returned by the Supabase JS SDK gracefully on clients and in backend Cloud Run functions. Monitor Supabase logs for database-level errors.

\#\# 11\. Shared Code Strategy (Minimalist)

\-   \*\*UI Components:\*\* Independent per platform (\`carepop-nativeapp/src/components\` vs. \`carepop-web/src/components\`). No direct code sharing.  
\-   \*\*Types/Interfaces/Utilities:\*\* Currently independent per project. If significant overlap arises, consider creating a dedicated \`packages/shared-types\` or \`packages/shared-utils\` directory at the root, potentially managed with pnpm workspaces \*only if\* the overhead is justified. For now, maintain separation.  
\-   \*\*Configuration:\*\* Each project manages its own ESLint, Prettier, TypeScript config.


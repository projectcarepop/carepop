# System Design Patterns & Architectural Blueprints

## 1. Overall Architecture Pattern: Modular Three-Pillar System

The CarePoP platform is architected as a three-pillar system with distinct responsibilities, all residing within a single Git repository but developed as largely independent projects:

1.  **`carepop-nativeapp/` (Expo/React Native):**
    *   **Responsibility:** Provides the user-facing native mobile application for iOS and Android.
    *   **Pattern:** Client-Side Rendering (CSR) native application. UI components previously in a shared package are now integrated directly within this project.
    *   **Interaction:** Communicates with `carepop-backend/` via RESTful APIs for data and authentication.

2.  **`carepop-web/` (Next.js, Tailwind CSS, Shadcn UI):**
    *   **Responsibility:** Provides all web-based interfaces, including public informational pages, user-facing functional modules (mirroring native app features), and administrative dashboards.
    *   **Pattern:** Hybrid (SSR/SSG for public/SEO-critical pages, CSR for authenticated user dashboards and admin sections).
    *   **Interaction:** Communicates with `carepop-backend/` via RESTful APIs for data and authentication.

3.  **`carepop-backend/` (Node.js/TypeScript on Google Cloud Run + Supabase BaaS):**
    *   **Responsibility:** Centralized backend logic, data management, authentication services, and integration points.
    *   **Pattern:** Backend-for-Frontend (BFF) exposing RESTful APIs. Utilizes Supabase for BaaS (database, auth, RLS, storage) and Google Cloud Run for custom serverless functions (complex logic, third-party integrations, scheduled tasks).
    *   **Interaction:** Serves as the single source of truth for both `carepop-nativeapp/` and `carepop-web/`.

This structure replaces previous monorepo complexities for the frontend, simplifying build processes and development focus for each distinct application.

## 2. Backend Architecture Pattern: Hybrid (BaaS + Serverless Functions)

The system employs a hybrid backend architecture leveraging managed services:

*   **Supabase (BaaS):**
    *   **Managed PostgreSQL Database:** Primary data store for user profiles, appointments, health records, tracking data, directory, inventory, etc.
    *   **Built-in Authentication:** Handles user registration, login, session management, JWT issuance.
    *   **Row Level Security (RLS):** Primary mechanism for granular data access control directly within the database, based on user ID, role, and relationships/consent status.
    *   **Storage:** For file uploads (if needed).
    *   **Edge Functions:** Potential use for simple, data-proximate serverless logic.
    *   **Auto-generated APIs:** REST/GraphQL APIs based on schema (can be consumed by frontend or backend services).
*   **Google Cloud Run (Serverless Compute):**
    *   Hosts custom backend logic implemented primarily in Node.js/TypeScript.
    *   Used for:
        *   Complex business logic beyond simple CRUD.
        *   Orchestrating workflows (e.g., booking process, multi-step integrations).
        *   Handling sensitive data processing (e.g., application-level encryption/decryption, anonymization for reports).
        *   Implementing backend APIs requiring specific control or environment.
        *   Integrating with third-party services (Maps, Notifications, AI, Payments).
        *   Running background tasks triggered by Google Cloud Scheduler.
        *   Implementing administrative functions.

**Rationale:** Balances rapid development (using Supabase features) with flexibility (using Cloud Run). Reduces operational overhead while enabling robust, scalable, and secure custom logic. Aligns conceptually with a Modular Monolith by separating concerns: Supabase for core data/auth/access, Cloud Run for specific service logic. This backend serves **both the native mobile application and the separate web application**.

## 3. Frontend Architecture Pattern: Distinct Native & Web Applications

-   **`carepop-nativeapp/` (Expo/React Native for iOS & Android):**
    *   **Stack:** React Native, Expo, TypeScript, React Navigation.
    *   **UI:** Native components styled with React Native `StyleSheet`. Reusable UI components (formerly `packages/ui`) are now integrated directly into `carepop-nativeapp/src/components/` (or similar path).
    *   **State Management:** React Context API for initial needs, potentially Redux Toolkit for more complex global state.
    *   **Data Fetching:** `fetch` API or a lightweight library like `axios` to interact with `carepop-backend/`.
    *   **Focus:** Rich, performant, on-the-go user experience for mobile-specific features.

-   **`carepop-web/` (Next.js, Tailwind CSS, Shadcn UI):**
    *   **Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI.
    *   **UI:** Web components built with Next.js/React, styled with Tailwind CSS, and utilizing Shadcn UI for pre-built components.
    *   **State Management:** React Context API, React Query/SWR for server state, potentially Zustand or Redux Toolkit for complex global client state.
    *   **Data Fetching:** Next.js data fetching methods (Server Components, Route Handlers), `fetch` API, or libraries like React Query/SWR to interact with `carepop-backend/`.
    *   **Focus:** Public informational content, SEO-critical pages, comprehensive user-facing modules, and all administrative interfaces.

**Obsolete Frontend Monorepo Structure:**
*   The previous `carepop-frontend` monorepo (using pnpm workspaces and Turborepo) which housed `apps/nativeapp`, `apps/web` (RNW), and shared `packages/ui`, `packages/eslint-config`, `packages/typescript-config` is now **obsolete**. Relevant code (especially from `apps/nativeapp` and `packages/ui`) has been migrated and integrated into the new top-level `carepop-nativeapp/` project. The `apps/web` (RNW) has been superseded by the dedicated `carepop-web/` Next.js application.

## 4. Data Management Pattern: Centralized Supabase with RLS

Access control is multi-layered:

1.  **Supabase Authentication:** Verifies user identity and issues JWTs containing user ID and potentially roles.
2.  **Supabase Row Level Security (RLS):** The **primary** mechanism for enforcing data access rules at the database level for queries made using user tokens. Policies restrict row visibility/modification based on `auth.uid()`, `auth.role()`, relationships (e.g., provider-patient), and consent flags stored in the database.
3.  **Application-Level Checks (in Cloud Run):** Backend code running on Google Cloud Run performs authorization checks for:
    *   Complex workflows or actions not easily expressible in RLS.
    *   Operations requiring elevated privileges (e.g., admin actions, data aggregation/anonymization).
    *   Server-side operations that must bypass user-specific RLS (e.g., creating a user's profile row immediately after signup).

    These functions may use a Supabase `service_role` key (bypassing RLS) but **must** perform rigorous application-level authorization checks based on the *calling user's authenticated context* (obtained from Supabase Auth and passed to the function) *before* performing the action or returning data, unless the operation is inherently system-level (like the initial profile creation linked directly to a just-created `auth.uid`).
    *   Enforcing business logic constraints before database interaction.

**Principle:** Deny by Default (inherent in RLS, enforced in Cloud Run code).

## 5. Authentication Pattern: Supabase Auth with Backend Orchestration

*   **Encryption:**
    *   **At Rest:**
        *   *Application-Level Encryption (Mandatory for SPI/PHI):* AES-256-GCM encryption applied *before* sending sensitive data (health records, tracking data) to Supabase. Encryption/decryption logic resides in trusted Cloud Run functions.
        *   *Infrastructure Encryption:* Provided by Supabase/GCP for underlying storage.
    *   **In Transit:** TLS/HTTPS enforced for all communication (Client <-> Supabase/Cloud Run, Cloud Run <-> Supabase, Cloud Run <-> 3rd Parties).
*   **Key Management:** Application encryption keys and third-party API keys stored securely in **Google Cloud Secret Manager**, accessed only by authorized Cloud Run services via IAM.
*   **Authentication:** Handled by Supabase Auth.
*   **Authorization:** RBAC/ABAC enforced via Supabase RLS + Cloud Run checks (see above).
*   **Input Validation:** Rigorous validation on all inputs received by backend APIs (Cloud Run/Supabase Functions).
*   **Logging & Monitoring:** Comprehensive logging (Supabase logs, Cloud Logging from Cloud Run) for security events, errors, access decisions. Monitoring (Cloud Monitoring) for anomalies.
*   **Secrets Management:** Use Google Cloud Secret Manager for all sensitive credentials.

## 6. API Design Pattern: RESTful APIs

All backend services will be designed to serve **both the `carepop-nativeapp/` and `carepop-web/` applications** through consistent API contracts.

## 7. Deployment Pattern

-   **`carepop-nativeapp/`:** Deployed to app stores (Apple App Store, Google Play Store) via Expo Application Services (EAS Build & Submit).
-   **`carepop-web/`:** Deployed to a web hosting platform suitable for Next.js applications (e.g., Vercel, Netlify, or self-hosted on GCP Cloud Run/App Engine).
-   **`carepop-backend/`:** Node.js/TypeScript services deployed as serverless functions/containers on Google Cloud Run. Supabase components are managed via the Supabase platform.

CI/CD pipelines will be configured for each of these three top-level projects independently or as part of a coordinated workflow triggered by changes in their respective directories.

## 8. State Management Strategy

-   **`carepop-nativeapp/`:** Start with React Context API for simpler global state. Evaluate Redux Toolkit or Zustand if complex cross-component state becomes prevalent.
-   **`carepop-web/`:** Utilize Next.js built-in capabilities, React Context API for local/simple global state. For server state and caching, React Query or SWR is recommended. For complex client-side global state, Zustand or Redux Toolkit can be considered.
-   **Local Component State:** Use `useState` and `useReducer` where appropriate within components for both applications.

## 9. Error Handling and Logging Pattern

*(Existing content largely remains valid, ensure logging from backend captures client type if possible/relevant)*

## 10. Shared Code Strategy (Revised)

-   **UI Components:**
    *   **Native:** Reusable UI components specific to the native mobile app are now located directly within `carepop-nativeapp/src/components/` (or similar). The previous `packages/ui` is deprecated in its shared form.
    *   **Web:** Reusable UI components for the web app will be built using Next.js/React, styled with Tailwind CSS, and utilize Shadcn UI. These will reside within `carepop-web/src/components/` (or similar).
-   **Types/Interfaces:** If truly common types are needed across `carepop-backend/`, `carepop-nativeapp/`, and `carepop-web/`, a new top-level `packages/shared-types/` directory could be created (and potentially managed with a root `pnpm-workspace.yaml` if that level of integration is desired later). For now, assume types are duplicated or managed within each project as needed. *(Decision: No root monorepo tooling for now, so types are independent).* 
-   **Utility Functions:** Pure JavaScript/TypeScript utility functions that are generic and could be used by any of the three projects might also be suitable for a future `packages/shared-utils/` directory if extensive overlap is found. For now, utilities are local to each project.
-   **Configuration (ESLint, TypeScript):** Each project (`carepop-nativeapp/`, `carepop-web/`, `carepop-backend/`) will manage its own ESLint and TypeScript configurations. The previous `packages/eslint-config` and `packages/typescript-config` are deprecated.

This revised strategy emphasizes independence for the three main applications, reducing shared dependencies to simplify development and build processes. 
# System Patterns: CarePoP/QueerCare

## 1. Core Architecture: Supabase + Google Cloud Run Hybrid

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

**Rationale:** Balances rapid development (using Supabase features) with flexibility (using Cloud Run). Reduces operational overhead while enabling robust, scalable, and secure custom logic. Aligns conceptually with a Modular Monolith by separating concerns: Supabase for core data/auth/access, Cloud Run for specific service logic.

## 2. Data Access Control: RLS + Backend Checks

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

## 3. Security Patterns

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

## 4. Third-Party Integration Pattern

*   Integrations (Maps, Notifications, AI, Payments) are primarily handled by dedicated **Google Cloud Run functions**.
*   These functions act as secure intermediaries, managing API keys (from Secret Manager), encapsulating integration logic, and interacting with the external service.
*   Avoid exposing third-party credentials or complex logic directly to the frontend.
*   Thorough vetting of all third parties (including Supabase and GCP) for security and compliance (DPA/HIPAA BAA) is required.

## 5. Frontend Architecture Pattern

*   **Monorepo Structure:** The frontend is managed within a monorepo (e.g., Turborepo/pnpm), separating concerns into applications (`apps`) and shared code (`packages`).
*   **Native Application (`apps/native`):**
    *   Built using **Expo CLI** (Managed Workflow likely).
    *   Configuration managed primarily via `app.json`/`app.config.js`.
    *   Implements navigation using **Expo Router** (recommended).
    *   Consumes shared components from `packages/ui` and state logic from `packages/store`.
    *   Styling approach **TBD** (evaluating Expo options like `expo-styling`, NativeWind v4, `StyleSheet`).
*   **Web Application (`apps/web`):**
    *   Built using **Next.js**.
    *   Handles web routing (using **Next.js Router**), page structure, layouts, and API routes if needed.
    *   Serves public landing pages (using SSR/SSG for SEO), the authenticated user web application, and the admin UI.
    *   Configured with **React Native Web** to render shared components from `packages/ui`.
    *   Uses standard **Tailwind CSS + PostCSS** setup for styling, referencing the shared config.
    *   Consumes shared components from `packages/ui` and state logic from `packages/store`.
*   **Shared UI Package (`packages/ui`):**
    *   Contains reusable UI components built with **React Native primitives** (View, Text, Pressable, etc.), compatible with Expo and Web (via RNW).
    *   Styling **TBD**, needs to align with chosen Native App approach. Shared theme tokens likely reusable.
    *   Designed for maximum platform-agnosticism.
*   **Shared Configuration (`packages/config`):**
    *   Hosts shared `tailwind.config.js` (relevance for native TBD).
*   **Shared State (`packages/store`):**
    *   Contains shared **Redux Toolkit** slices, selectors, and store configuration logic.
*   **Shared Types (`packages/types`):**
    *   Contains shared TypeScript interfaces and types.
*   **Styling Approach:** **TBD.** Previous attempts with RN CLI (NativeWind, StyleSheet) faced issues. Need to evaluate options within Expo context (e.g., `expo-styling`, NativeWind v4, `StyleSheet` + theme) aiming for consistency via shared `packages/ui`.
*   **Navigation Strategy:** Native app uses Expo Router (recommended); Web app uses Next.js Router. Shared components trigger navigation via callbacks passed from the platform-specific parent.

## 6. Background Tasks Pattern

*   **Google Cloud Scheduler:** Triggers scheduled jobs (e.g., reminders, data aggregation).
*   **Google Cloud Run:** Executes the triggered job logic, interacting with Supabase or other services as needed. 
# Epics & Tickets: CarePop/QueerCare

Overall Project Goal: Develop and launch the CarePoP/QueerCare platform, a comprehensive SRH solution for the Philippines, encompassing a native mobile application (\`carepop-nativeapp/\`), a web application (\`carepop-web/\`), and a backend (\`carepop-backend/\`).

Note on Current Structure (Post-Major Restructure): This document reflects the project structure with three distinct top-level application folders within the main Git repository: \`carepop-backend/\` (Node.js/TypeScript on Cloud Run + Supabase BaaS), \`carepop-nativeapp/\` (Expo/React Native for iOS/Android), and \`carepop-web/\` (Next.js, Tailwind CSS, Shadcn UI). The previous \`carepop-frontend\` monorepo and shared packages are obsolete. Core authentication uses direct Client-Supabase calls with a DB trigger for profile creation.

---

## Epic COMPLIANCE: Data Privacy & Security Assurance (MVP+)

*   Epic Goal: Establish and implement a secure and compliant data management framework across all three applications (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`), ensuring adherence to Philippines DPA and applying security best practices.  
*   Status: Foundational elements in place (RLS basics, infra security setup), deeper compliance tasks pending.

    *   Ticket ID: COMPLIANCE-1  
        *   Title: Implement Data Encryption at Rest Strategy (Application Level via Backend)  
        *   Background: Ensure highly sensitive data (SPI/PHI identified in TRK-1, potentially others) is encrypted *before* storage in Supabase using the AES-256-GCM utility (SEC-E-2) implemented in the backend.  
        *   Scope: Integration of the SEC-E-2 utility into backend services (Cloud Run) that handle writing/reading sensitive data identified for app-level encryption. Secure key management via Google Cloud Secret Manager is part of SEC-S-1.  
        *   Location: \`carepop-backend/src/services/\` (integrating calls to SEC-E-2 utility).  
        *   Acceptance Criteria: Backend services handling designated SPI/PHI correctly call the encryption utility before saving to Supabase and the decryption utility after reading from Supabase. Data stored in Supabase for these fields is verified as encrypted. Keys are loaded securely from Secret Manager.  
        *   Technology/Implementation Suggestions: Node.js/TypeScript in Cloud Run. Calls to shared crypto utility (SEC-E-2). Supabase JS SDK. Ensure utility is called transactionally where appropriate.  
        *   Status: To Do (Depends on SEC-E-2)

    *   Ticket ID: COMPLIANCE-2  
        *   Title: Implement Comprehensive RLS Policies for Core Data (BE/Supabase)  
        *   Background: Secure data access at the database level using Supabase Row Level Security for all tables containing user data or potentially sensitive information.  
        *   Scope: Define and implement RLS policies beyond the basic profile self-access (FOUND-8, SEC-BE-1). Cover roles (Admin, Provider access rules), linked data (appointments, trackers, transactions - ensuring users ONLY access their own), and potentially consent flags. These policies protect data accessed by *both* \`carepop-nativeapp\` and \`carepop-web\` clients via Supabase SDK or backend APIs.  
        *   Depends on: DB Schema definitions for various modules (APPT, TRK, TRN, etc.)  
        *   Location: \`carepop-backend/supabase/migrations/\` (for RLS policy definitions), Supabase dashboard.  
        *   Acceptance Criteria: Comprehensive RLS policies are active for all relevant tables. Manual verification and/or automated tests confirm expected data access patterns for different user roles and data ownership scenarios (e.g., patient sees own data, provider sees assigned patient data *if consent allows*, admin sees specific data).  
        *   Technology/Implementation Suggestions: Supabase PostgreSQL RLS syntax (SQL). Supabase Migrations. Design policies for efficiency. Clearly document RLS logic and assumed roles/permissions. Use Supabase functions for complex RLS conditions if needed.  
        *   Status: In Progress (Basic profile RLS done, comprehensive policies pending other modules).

    *   Ticket ID: COMPLIANCE-3  
        *   Title: Implement Data Access Control Auditing (Backend & Supabase)  
        *   Background: Ensure that data access controls (both RLS hits/misses and application-level checks in Cloud Run) are adequately logged for security monitoring and compliance.  
        *   Scope: Integrate detailed logging within backend APIs (Cloud Run) performing authorization checks (SEC-BE-3 logic). Review and configure Supabase database audit logging for RLS enforcement logging. Log results to Google Cloud Logging (SEC-A-1).  
        *   Depends on: SEC-BE-3, SEC-A-1  
        *   Location: \`carepop-backend/\` (Middleware/Service code), Supabase logging settings, GCP Cloud Logging.  
        *   Acceptance Criteria: Logs capture relevant details of authorization decisions (user ID, role, resource accessed, permission checked, outcome - success/fail). Supabase RLS logs reviewed/configured for relevant events. Logs stored securely in Cloud Logging with appropriate retention.  
        *   Technology/Implementation Suggestions: Structured logging (Winston/Pino to Cloud Logging). Supabase PostgreSQL logging extensions (e.g., \`pgaudit\` if available/configurable, or standard logs). Avoid logging sensitive data within audit trails.  
        *   Status: To Do

    *   Ticket ID: COMPLIANCE-4  
        *   Title: Design & Implement Data Retention Policy Enforcement (Backend Job)  
        *   Background: Define and implement automated enforcement of data retention policies (e.g., deleting inactive user profiles, old logs) based on DPA requirements.  
        *   Scope: Define policies (requires Legal/FPOP input). Create a scheduled job (Cloud Scheduler triggering Cloud Run function) to query Supabase, identify data exceeding retention periods, and perform secure deletion or anonymization.  
        *   Location: \`carepop-backend/src/jobs/retentionEnforcer.ts\` (Cloud Run function code), GCP Cloud Scheduler config, Supabase schema.  
        *   Acceptance Criteria: Policy documented. Scheduled job implemented and deployed. Job correctly identifies and deletes/anonymizes expired data in Supabase. Deletion/anonymization actions are logged securely. Job includes error handling and monitoring.  
        *   Technology/Implementation Suggestions: Documentation. Google Cloud Scheduler, Google Cloud Run (Node.js/TypeScript), Supabase JS SDK (using \`service_role\` key with extreme caution and auditing). Implement efficiently to handle potentially large datasets. Consider soft deletes vs. hard deletes based on policy. Potential use of anonymization utility (COMPLIANCE-8).  
        *   Status: To Do

    *   Ticket ID: COMPLIANCE-5  
        *   Title: Document Data Breach Response Plan (Process)  
        *   Background: Define the organizational plan for responding to a data breach, including detection, containment, notification (to NPC and users), and post-mortem.  
        *   Scope: Documentation outlining the plan, roles, responsibilities, communication channels, and steps. Requires Legal/FPOP input. Integrates with monitoring/alerting (SEC-A-1) and potential notification mechanisms.  
        *   Location: Project documentation (\`docs/security/breach_response_plan.md\`).  
        *   Acceptance Criteria: Plan documented, reviewed, and approved. Key personnel are aware of their roles.  
        *   Technology/Implementation Suggestions: Documentation. Integration points with monitoring/alerting systems. Define escalation paths.  
        *   Status: To Do

    *   Ticket ID: COMPLIANCE-6  
        *   Title: Implement Data Subject Rights Management Backend API (Backend & Supabase)  
        *   Background: Create backend APIs and potentially Supabase Functions/Procedures to handle Data Subject Access Requests (DSAR) like data access, correction, deletion as required by DPA.  
        *   Scope: Define APIs (e.g., \`POST /api/dsar/request\`, \`GET /api/dsar/status/:requestId\`). Backend logic (Cloud Run) to receive requests, verify user identity, potentially queue requests for admin review/action, and interact with Supabase to gather/delete/update data across relevant tables (profiles, logs, etc.). Needs RLS bypass (\`service_role\` key) handled carefully by backend. Frontend UIs in \`carepop-nativeapp\` and \`carepop-web\` needed later.  
        *   Location: \`carepop-backend/src/controllers/dsarController.ts\`, Supabase procedures (optional).  
        *   Acceptance Criteria: Backend API exists. Logic for handling access, correction, deletion defined. Secure interaction with Supabase data (validating request legitimacy before using \`service_role\`). Audit logging of all DSAR requests and actions.  
        *   Technology/Implementation Suggestions: Google Cloud Run (Node.js/TypeScript), Supabase JS SDK (using \`service_role\` with caution and strong validation/logging). Consider identity verification methods. Implement idempotent operations where possible.  
        *   Status: To Do

    *   Ticket ID: COMPLIANCE-7  
        *   Title: Conduct Data Protection Impact Assessment (DPIA) (Process)  
        *   Background: Perform a DPIA for high-risk processing activities (e.g., health tracking, AI assessment, extensive data sharing) as potentially required by DPA.  
        *   Scope: Documentation activity involving analyzing data flows, identifying risks (privacy, security), evaluating necessity/proportionality, and documenting mitigation measures. Requires input on features and technical implementation.  
        *   Location: Project documentation (\`docs/compliance/dpia/\`).  
        *   Acceptance Criteria: DPIA conducted and documented for identified high-risk activities. Mitigation strategies defined. Reviewed by Legal/DPO.  
        *   Technology/Implementation Suggestions: Documentation. DPA guidelines. Data flow diagrams.  
        *   Status: To Do

    *   Ticket ID: COMPLIANCE-8  
        *   Title: Implement Robust Data Anonymization Strategy & Utility (Backend Logic/Utility)  
        *   Background: Develop or integrate a robust utility within the backend (\`carepop-backend/\` Cloud Run) to anonymize sensitive data sets for reporting (REP-3) and potentially retention (COMPLIANCE-4).  
        *   Scope: Research techniques (k-anonymity, l-diversity, possibly exploring differential privacy principles). Implement utility function(s) in Cloud Run service code. Utility takes structured sensitive data (read carefully from Supabase by the calling process) and returns an anonymized version suitable for analysis without re-identification.  
        *   Depends on: Schema definitions for sensitive data (e.g., TRK-1).  
        *   Location: \`carepop-backend/src/utils/anonymizationService.ts\` (or similar)  
        *   Acceptance Criteria: Anonymization strategy defined, balancing utility and privacy risk. Utility function(s) implemented and thoroughly tested. Integrated into reporting/retention backend jobs. Anonymization process is documented.  
        *   Technology/Implementation Suggestions: Node.js/TypeScript in Cloud Run. Statistical libraries (if needed). Careful implementation to prevent re-identification. Consider privacy expert consultation. Requires careful handling of input data potentially using \`service_role\` temporarily by calling job.  
        *   Status: To Do

---

## Epic FE-SETUP: Frontend Applications Initialization & Core Structure (MVP)

*   Goal: Establish foundational setup for both native mobile and web apps.  
*   Status: Partially Done (Init done, Navigation & Theming integration needed)

    *   Ticket ID: FE-SETUP-1: Initialize \`carepop-nativeapp/\` (Expo) Project (MVP) - Done

    *   Ticket ID: FE-SETUP-2: Initialize \`carepop-web/\` (Next.js) Project (MVP) - Done

    *   Ticket ID: FE-SETUP-3: Implement Native App Navigation (\`carepop-nativeapp/\`) (MVP)  
        *   Status: In Progress
        *   Notes: Navigation structure primarily defined in \`App.tsx\`. Still blocked by persistent navigation error: \`MyProfileScreen\` cannot navigate to \`EditProfileScreen\`. Focus on \`App.tsx\` context/rendering.
        *   Technology/Implementation Suggestions: React Navigation (Drawer, Stack, Bottom Tabs as needed). Define main navigators in \`App.tsx\` or a dedicated \`navigation/\` directory. Manage auth state for conditional rendering.

    *   Ticket ID: FE-SETUP-4: Implement Web App Navigation (\`carepop-web/\`) (MVP)  
        *   Status: Not Started

    *   Ticket ID: FE-SETUP-5: Integrate Native App Theme & Core UI Components (\`carepop-nativeapp/\`) (MVP)  
        *   Status: In Progress
        *   Notes: Components migrated, theme defined. Drawer icons standardized to Ionicons.  
        *   Technology/Implementation Suggestions: Define theme (colors, typography, spacing) in \`src/components/theme.ts\`. Create/adapt reusable components (Button, TextInput, Card etc.) in \`src/components/\`. Use \`ThemeProvider\` if necessary.

    *   Ticket ID: FE-SETUP-6: Setup Web App Styling & Base Components (\`carepop-web/\`) (MVP)  
        *   Status: Not Started

    *   Ticket ID: FE-SETUP-7: Debug ExpoLinearGradient Native View Manager Error (\`carepop-nativeapp/\`) - Done

---

## Epic 1: Core Setup, Authentication & Deployment Foundation (Supabase & GCP)  
*   Epic Goal: Establish infrastructure, backend setup, foundational DB schema/RLS, integrate direct client-Supabase auth flow, basic CI/CD.  
*   Status: Mostly Done (Requires implementation of FOUND-9 Trigger)

    *   Ticket ID: FOUND-1: Setup Code Repositories & Initial Project Structure (Native Mobile App & Backend) - Done  
    *   Ticket ID: FOUND-2: Configure Native Mobile App (Expo) & Node.js Backend Development Environment with TypeScript & Supabase SDK - Done  
    *   Ticket ID: FOUND-3: Select, Provision, & Configure Core Cloud Infrastructure (Google Cloud Platform & Supabase) (Staging) - Done  
    *   Ticket ID: FOUND-4: Implement Structured Logging and Configuration Management (Cloud Logging & Secret Manager for Backend) - Done  
    *   Ticket ID: FOUND-5: Configure CI/CD Pipeline (Build, Test, Deploy Backend & Native Mobile App to Staging) - In Progress (BE Done, Native EAS pending setup/test)  
    *   Ticket ID: FOUND-6: Set up Basic Testing Frameworks & Initial Unit Tests (Backend & Native Mobile App) - Done  
    *   Ticket ID: FOUND-7: Configure Supabase Authentication (For Backend and All Client Applications) - Done  
    *   Ticket ID: FOUND-8: Design & Implement Foundational User Database Schema (Supabase) (Authentication Focus for All Clients) - Done  
    *   Ticket ID: FOUND-9 (Revised): Implement Profile Creation on Signup (Supabase Trigger)  
        *   Status: Done  
        *   Technology/Implementation Suggestions: Supabase SQL Editor is fastest for MVP: Go to Database -> Functions -> Create Function (\`handle_new_user\` using provided PL/pgSQL). Go to Database -> Triggers -> Create Trigger (\`on_auth_user_created\`) linking \`auth.users\` \`AFTER INSERT\` event to the function. Alternatively, create SQL scripts and apply via Supabase Migrations (\`supabase migration new create_profile_trigger\`, edit SQL, \`supabase db push\`). Verify trigger works by signing up a new user. (User confirmed this is implemented).
    *   Ticket ID: FOUND-10 (Obsolete): Build Backend API (Cloud Run Function): Secure User Login & Token Generation - Obsolete/Superseded

---

## Epic AUTH: User Authentication (MVP - Implementation)

*   Goal: Implement secure user registration and login via direct Client-Supabase interaction.  
*   Status: To Do (UI elements done, integration logic pending nav fix)

    *   Ticket ID: AUTH-1: Integrate Supabase Registration (Native & Web Clients, Supabase Trigger) (MVP)  
        *   Status: Not Started
        *   Notes: Frontend calls + Trigger verification needed.

    *   Ticket ID: AUTH-2: Integrate Supabase Login (Native & Web Clients) (MVP)  
        *   Status: Not Started
        *   Notes: Frontend calls needed.

    *   Ticket ID: AUTH-3: Secure Supabase Session & Token Handling (Native & Web Clients) (MVP)  
        *   Status: Not Started
        *   Notes: Client-side logic + Secure Storage needed.

    *   Ticket ID: AUTH-4: Implement Login UI (\`carepop-nativeapp/\`) (MVP)  
        *   Status: In Progress
        *   Notes: UI refactored with Ionicons, logo added. Connection logic needs implementation/verification pending navigation fix.

    *   Ticket ID: AUTH-5: Implement Registration UI (\`carepop-nativeapp/\`) (MVP)  
        *   Status: In Progress
        *   Notes: UI refactored, logo added. Connection logic needs implementation/verification pending navigation fix.

    *   Ticket ID: AUTH-6: Implement Login UI (\`carepop-web/\`) (MVP)  
        *   Status: Not Started

    *   Ticket ID: AUTH-7: Implement Registration UI (\`carepop-web/\`) (MVP)  
        *   Status: Not Started

    *   Ticket ID: AUTH-8: Implement Password Reset Flow (BE Logic via Supabase, FE for Native & Web) (P2)  
        *   Status: In Progress
        *   Notes: Native UI for \`ForgotPasswordScreen.tsx\` updated with logo. Backend/Supabase logic pending.

---

## Epic 2: UI/UX Design System & Core Components (Native Mobile App MVP Kickoff)  
*   Goal: Build core reusable native UI components within \`carepop-nativeapp\`.  
*   Status: In Progress

    *   Ticket ID: UI-1: Define & Implement Shared Theme (For Native Mobile App) - Done  
    *   Ticket ID: UI-2: Build Core Reusable Components - Buttons (For Native Mobile App) - Done  
    *   Ticket ID: UI-3: Build Core Reusable Components - Form Inputs (For Native Mobile App) - Done  
    *   Ticket ID: UI-4: Build Core Reusable Components - Layout (Card, Container) (For Native Mobile App) - Done  
    *   Ticket ID: UI-5: Implement Native Mobile Frontend UI: User Registration Screen (Functional) - In Progress  
    *   Ticket ID: UI-6: Implement Native Mobile Frontend UI: User Login Screen (Functional) - In Progress

---

## Epic 3: Secure Client Handling (Native Mobile & Web), Supabase RLS & Foundational DPA Consent  
*   Goal: Secure token handling, implement RBAC/RLS, integrate DPA consent.  
*   Status: Partially Done

    *   Ticket ID: SEC-BE-1: Implement RBAC Roles, Permission Concepts, and Foundational Supabase RLS - In Progress  
    *   Ticket ID: SEC-BE-2: Implement Backend Authentication Middleware (Cloud Run - for Protected Endpoints) - To Do  
    *   Ticket ID: SEC-BE-3: Implement Core RBAC Enforcement (Supabase RLS & Backend Checks) - To Do  
    *   Ticket ID: SEC-FE-1: Implement Secure Client-Side Auth Token Storage & Retrieval (Native & Web) - To Do  
    *   Ticket ID: SEC-BE-4: Update User Schema & Logic to Store Consent (Backend/Supabase) - To Do  
    *   Ticket ID: SEC-FE-2: Implement Native Mobile UI: Integrate DPA Consent into Registration - To Do  
    *   Ticket ID: SEC-BE-5: Configure Secure HTTPS/TLS for Staging - Done

---

## Epic WEB: Dedicated Web Application (Next.js, Tailwind CSS, Shadcn UI)  
*   Goal: Build the separate web application.  
*   Status: Not Started (Beyond init)

    *   Ticket ID: WEB-SETUP-1: Initialize Project - Done  
    *   Ticket ID: WEB-SETUP-2: Set up Supabase Client & Auth Context/Hooks - To Do  
    *   Ticket ID: WEB-SETUP-3: Set up Basic Layout with Navigation - To Do  
    *   *(Includes Auth UI tickets AUTH-6, AUTH-7)*  
    *   *(Includes Public Page tickets WEB-1, WEB-2, WEB-3)*  
    *   *(Includes SEO tickets WEB-4, WEB-DIR-8, WEB-DIR-9, WEB-DIR-10)*  
    *   *(Will include tickets for functional module UIs - Appointments, Profile, Directory, Admin etc.)* - To Do

Okay, here are the remaining Epics from \`epics_and_tickets.md\` with their tickets updated to reflect the three-pillar architecture, the distinct native/web frontends, and the direct Supabase Auth flow. Backend tickets consistently note serving both native and web clients where applicable.

---

*(Continuing \`epics_and_tickets.md\`)*

## Epic Y: Healthcare Provider Directory (Full Features & SEO for Native Mobile App, Backend serving All Clients, Web App includes Directory Feature)

*   Epic Goal: Fully implement the Provider and Facility directory features. Native app UI (\`carepop-nativeapp/\`) and Web app UI (\`carepop-web/\`) both consume backend APIs. Backend (\`carepop-backend/\`) serves APIs to both. Data stored in Supabase with RLS. SEO for directory handled by \`carepop-web/\` (Next.js).  
*   Status: To Do (Beyond basic setup)

    *   Ticket ID: DIR-1 (UPDATED for Supabase - Serving All Clients)  
        *   Title: Refine Provider/Facility Database Schema (Supabase) & Add Indexing for Advanced Search  
        *   Background: Enhance the directory schemas in Supabase PostgreSQL to include all planned attributes (languages, services, LGBTQ+-affirming flag, detailed consultation hours, accessibility) and ensure indexing supports complex search queries including location. Implement RLS for public read access.  
        *   Location: \`carepop-backend/supabase/migrations/\`  
        *   Acceptance Criteria: Schemas updated with necessary fields. RLS policies defined allowing public reads. GiST indexing for geo queries and full-text search indexes added and tested. Migrations created.  
        *   Technology/Implementation Suggestions: Supabase PostgreSQL, PostGIS extension (enable in Supabase), Supabase migrations, Supabase RLS.  
        *   Status: To Do

    *   Ticket ID: DIR-2 (UPDATED for Cloud Run/Supabase - Serving All Clients)  
        *   Title: Build Backend API (\`carepop-backend/Cloud Run Function\`): Advanced Directory Search with Filters & Location  
        *   Background: Implement the API endpoint (Google Cloud Run function) capable of handling search queries with multiple filters and location proximity search against Supabase. This API serves both native and web clients.  
        *   Location: \`carepop-backend/src/controllers/directoryController.ts\`  
        *   Acceptance Criteria: \`/api/directory/search\` endpoint implemented. Accepts filters and location. Constructs efficient Supabase queries (PostGIS, FTS). Returns ordered, paginated results. Publicly accessible (no auth required, RLS handles data visibility).  
        *   Technology/Implementation Suggestions: Google Cloud Run (Node.js/TypeScript). Supabase JS SDK (using \`anon\` key client). Supabase PostgreSQL PostGIS functions (\`ST_DWithin\`) and FTS functions (\`to_tsvector\`, \`to_tsquery\`). Input validation for query params. Pagination logic.  
        *   Status: To Do

    *   Ticket ID: DIR-3 (UPDATED for Cloud Run/Supabase - Serving All Clients)  
        *   Title: Build Backend API (\`carepop-backend/Cloud Run Functions\`): Admin Management (Full CRUD for Providers/Facilities)  
        *   Background: Enhance backend APIs (Google Cloud Run functions) to support full CRUD of provider/facility records in Supabase by authenticated administrators. Serves admin UIs (primarily \`carepop-web\`).  
        *   Location: \`carepop-backend/src/controllers/adminDirectoryController.ts\`  
        *   Acceptance Criteria: CRUD endpoints implemented for \`/api/admin/providers\` and \`/api/admin/facilities\`. Endpoints protected by Auth Middleware (SEC-BE-2) and RBAC checks for 'admin' role (SEC-BE-3). Input validation performed. Geocoding logic integrated on create/update. Actions logged. Interacts with Supabase DB using \`service_role\` key carefully after authz checks.  
        *   Technology/Implementation Suggestions: Google Cloud Run (Node.js/TypeScript), Supabase JS SDK (\`service_role\` key). Auth & RBAC Middleware. Input validation. Logging. Geocoding API integration (e.g., Google Maps Geocoding API call from Cloud Run).  
        *   Status: To Do

    *   Ticket ID: DIR-4 (Native Mobile App)  
        *   Title: Implement Native Mobile App UI (\`carepop-nativeapp/\`): Advanced Directory Search Filters & Location Input  
        *   Background: Develop the native mobile UI components and logic for advanced filtering and location-based searching in the directory. Connects to DIR-2 API.  
        *   Location: \`carepop-nativeapp/src/screens/Directory/SearchScreen.tsx\` (or similar)  
        *   Acceptance Criteria: Native search screen includes UI elements (dropdowns, checkboxes, location input) for filtering. User location detection integrated (with permission). Filters and location sent to backend API (DIR-2). Results updated based on filters.  
        *   Technology/Implementation Suggestions: React Native (Expo). UI Components from \`carepop-nativeapp/src/components\`. Expo Location API. State management for filters. API client.  
        *   Status: To Do

    *   Ticket ID: DIR-5 (Native Mobile App)  
        *   Title: Implement Native Mobile App UI (\`carepop-nativeapp/\`): Display Search Results on Map & List View Toggle  
        *   Background: Develop the native mobile UI to display directory search results on an interactive map and as a togglable list. Consumes data from DIR-2 API.  
        *   Location: \`carepop-nativeapp/src/screens/Directory/ResultsScreen.tsx\` (or similar)  
        *   Acceptance Criteria: Native results screen implemented. Integrates a map view (e.g., \`react-native-maps\`) showing provider markers. List view displays results scrollably. Toggle between views implemented. Map markers/list items link to detail view. Handles loading/error states.  
        *   Technology/Implementation Suggestions: React Native (Expo). \`react-native-maps\`. \`FlatList\`. State management for view toggle and results. UI components.  
        *   Status: To Do

    *   Ticket ID: DIR-6 (Native Mobile App)  
        *   Title: Implement Native Mobile App UI (\`carepop-nativeapp/\`): Deep-Linking for Navigation to External Map Apps  
        *   Background: Add "Get Directions" functionality to the native mobile provider detail screen.  
        *   Location: \`carepop-nativeapp/src/screens/Directory/ProviderDetailScreen.tsx\` (or similar)  
        *   Acceptance Criteria: "Get Directions" button uses Expo's \`Linking\` API to open the provider's address (coordinates needed from backend) in the user's default map app. Handles potential errors gracefully.  
        *   Technology/Implementation Suggestions: React Native (Expo). \`Expo.Linking\` API. Requires coordinates in provider detail data fetched from backend.  
        *   Status: To Do

    *   Ticket ID: DIR-7 (Web Admin UI - \`carepop-web/\`)  
        *   Title: Implement Admin UI (\`carepop-web/\`): Provider/Facility Management Screens (CRUD)  
        *   Background: Develop the web-based administrative UI for directory management (CRUD operations). Connects to DIR-3 APIs.  
        *   Location: \`carepop-web/src/app/admin/directory/providers/\`, \`carepop-web/src/app/admin/directory/facilities/\`  
        *   Acceptance Criteria: Web admin pages created for listing, viewing, adding, and editing providers and facilities. Uses Shadcn UI / Tailwind CSS. Forms match schema, include validation. Calls backend CRUD APIs (DIR-3). Protected by admin role.  
        *   Technology/Implementation Suggestions: Next.js, React, Tailwind CSS, Shadcn UI. Data fetching hooks (SWR/React Query). Form libraries. State management.  
        *   Status: To Do

---

## Epic APPT-USER: Appointment Scheduling (Completing User Flows for Native Mobile App, Backend serving All Clients, Web App includes Booking)

*   Epic Goal: Implement the user-facing appointment booking and management flow, including browsing availability, requesting/confirming bookings, and viewing history. Frontend logic exists in both \`carepop-nativeapp/\` and \`carepop-web/\`. Backend (\`carepop-backend/\`) provides APIs serving both. Data in Supabase.  
*   Status: To Do (Requires schema, backend APIs, and frontend integration)

    *   *(Prerequisite) Ticket ID: APPT-SCHEMA-1  
        *   Title: Design & Implement Appointments & Availability Database Schema (\`carepop-backend/Supabase\`)  
        *   Background: Define Supabase PostgreSQL schemas for \`appointments\` and \`provider_availability\` tables, including necessary fields for scheduling logic, status tracking, and user/provider links. Implement RLS policies.  
        *   Location: \`carepop-backend/supabase/migrations/\`  
        *   Status: To Do

    *   Ticket ID: APP-USER-1: Build Backend API (\`carepop-backend/Cloud Run Function\`): Fetch User's Future Appointments (Serving All Clients) - Status: To Do (Depends on APPT-SCHEMA-1)  
    *   Ticket ID: APP-USER-2: Build Backend API (\`carepop-backend/Cloud Run Function\`): Fetch User's Past/Cancelled Appointments (Serving All Clients) - Status: To Do (Depends on APPT-SCHEMA-1)  
    *   Ticket ID: APP-BACKEND-1 (New): Build Backend API (\`carepop-backend/Cloud Run Function\`): Fetch Provider Availability Slots (Serving All Clients) - Status: To Do (Depends on APPT-SCHEMA-1, APP-ADMIN-1)  
    *   Ticket ID: APP-BACKEND-2 (New): Build Backend API (\`carepop-backend/Cloud Run Function\`): Request/Book Appointment (Serving All Clients) - Status: To Do (Depends on APPT-SCHEMA-1, APP-BACKEND-1)  
    *   Ticket ID: APP-BACKEND-3 (New): Build Backend API (\`carepop-backend/Cloud Run Function\`): User Cancel Appointment (Serving All Clients) - Status: To Do (Depends on APPT-SCHEMA-1)

    *   Ticket ID: APP-USER-3 (Native Mobile App): Implement UI: Interactive Availability Calendar View - Status: To Do  
    *   Ticket ID: APP-USER-4 (Native Mobile App): Implement UI: Display & Select Available Time Slots - Status: To Do  
    *   Ticket ID: APP-USER-5 (Native Mobile App): Implement UI: Appointment Booking Confirmation Flow - Status: To Do  
    *   Ticket ID: APP-USER-6 (Native Mobile App): Implement UI: My Appointments Screen (List & Filter) - Status: To Do  
    *   Ticket ID: APP-USER-7 (Native Mobile App): Implement UI: My Appointment Detail View & Cancellation Action - Status: To Do

    *   *(Equivalent Web UI tickets for Appointment flow in \`carepop-web/\` need to be added here)* - Status: To Do

---

## Epic APPT-ADMIN/NOTIF: Appointment Scheduling (Admin/Provider & Notifications - Backend serving All Clients, Admin UI primarily Web)  
*   Epic Goal: Implement administrative/provider features for managing schedules/appointments, and setup backend notification system. Admin UI primarily in \`carepop-web/\`. Backend APIs (\`carepop-backend/\`) serve required clients.  
*   Status: To Do

    *   Ticket ID: APP-ADMIN-1: Refine/Implement Provider Availability Schema & Logic (\`carepop-backend/Supabase\`) - Status: To Do (Related to APPT-SCHEMA-1)  
    *   Ticket ID: APP-ADMIN-2: Build Backend API (\`carepop-backend/Cloud Run Functions\`): Admin/Provider Manage Availability (CRUD) - Status: To Do  
    *   Ticket ID: APP-ADMIN-3: Build Backend API (\`carepop-backend/Cloud Run Functions\`): Admin/Provider View Appointment Requests - Status: To Do  
    *   Ticket ID: APP-ADMIN-4: Build Backend API (\`carepop-backend/Cloud Run Functions\`): Admin/Provider Confirm/Cancel Appointment Request - Status: To Do  
    *   Ticket ID: APP-ADMIN-5 (Web Admin UI - \`carepop-web/\`): Implement UI: Schedule & Appointment Management - Status: To Do  
    *   Ticket ID: APP-ADMIN-6: Integrate Backend (\`carepop-backend/Cloud Run\`) with Notification Service (Appointment Status Triggers) - Status: To Do  
    *   Ticket ID: APP-ADMIN-7: Build Backend Service (\`carepop-backend/Cloud Scheduler + Cloud Run\`): Scheduled Appointment Reminders - Status: To Do  
    *   Ticket ID: APP-ADMIN-8 (Native Mobile App): Implement Background Task Listener & Local Notification Trigger - Status: To Do

---

## Epic PROFILE: Secure User Profile & Linked Data Views (UI: \`carepop-nativeapp/\` & \`carepop-web/\`, Backend serving All Clients, Admin UI primarily \`carepop-web/\`)  
*   Epic Goal: Complete user profile features and linked data access framework.  
*   Status: Partially Done (Foundational profile done, detailed fields and linked data pending)

    *   Ticket ID: PROF-1: Enhance User Profile Database Schema (Supabase) (Detailed Fields) - Status: To Do  
    *   Ticket ID: PROF-2: Build Backend API (Cloud Run Function): User View/Edit Detailed Profile - Status: To Do  
    *   Ticket ID: PROF-3: Build Backend API (Cloud Run Function): Admin View/Manage Any User Profile - Status: To Do  
    *   Ticket ID: PROF-4 (Native Mobile App): Implement UI: Detailed User Profile Screens (View/Edit) - Status: To Do  
    *   Ticket ID: PROF-5 (Web Admin UI - \`carepop-web/\`): Implement UI: User Management Screens (List/View/Edit) - Status: To Do  
    *   Ticket ID: PROF-6: Design Backend Framework for Secure Linked Data Retrieval (Placeholder - Supabase RLS & Cloud Run Checks) - Status: To Do  
    *   Ticket ID: PROF-7 (Native Mobile App): Implement UI: Placeholder Linked Data Sections on Profile/Dashboard - Status: In Progress  
    *   *(Equivalent Profile View/Edit tickets for \`carepop-web/\` user-facing sections need to be added here)* - Status: To Do

---

## Epic TRANSACTIONS: Transaction History (User Focused - UI: \`carepop-nativeapp/\` & \`carepop-web/\`, Backend \`carepop-backend/\` serving All Clients)  
*   Epic Goal: Implement viewing of transaction history.  
*   Status: To Do

    *   Ticket ID: TRN-1: Design & Implement Transaction History Database Schema (Supabase) - Status: To Do  
    *   Ticket ID: TRN-2: Build Backend API (Cloud Run Function): Record New Transaction (Internal) - Status: To Do  
    *   Ticket ID: TRN-3: Build Backend API (Cloud Run Function): User View Own Transaction History - Status: To Do  
    *   Ticket ID: TRN-4 (Native Mobile App): Implement UI: User View Transaction History Screen - Status: To Do  
    *   *(Equivalent Web UI ticket for \`carepop-web/\` needs to be added here)* - Status: To Do

---

## Epic INVENTORY: Medicine Inventory Management (Admin Focused - Admin UI primarily \`carepop-web/\`, Backend \`carepop-backend/\`)  
*   Epic Goal: Implement inventory tracking for admins.  
*   Status: To Do

    *   Ticket ID: INV-1: Design & Implement Inventory Database Schema (Supabase) - Status: To Do  
    *   Ticket ID: INV-2: Build Backend API (Cloud Run Functions): Admin Manage Inventory (Full CRUD) - Status: To Do  
    *   Ticket ID: INV-4 (Web Admin UI - \`carepop-web/\`): Implement UI: Inventory Management Screens (CRUD) - Status: To Do  
    *   Ticket ID: INV-5 (Formerly INV-4 part 2): Implement Low Stock Alert System (Backend Logic & Admin UI Notification - Primarily \`carepop-web/\`) - Status: To Do

---

## Epic REPORTING: Admin Reporting (Aggregated Data - Admin UI primarily \`carepop-web/\`, Backend \`carepop-backend/\`)  
*   Epic Goal: Implement admin reporting features.  
*   Status: To Do

    *   Ticket ID: REP-1: Design Data Aggregation Strategy for Reporting (Supabase & Cloud Run) - Status: To Do  
    *   Ticket ID: REP-2: Build Backend Logic & API for Basic Aggregation & Reporting (Non-Sensitive Data) - Status: To Do  
    *   Ticket ID: REP-3: Build Backend Logic & API for Aggregating & Anonymizing Sensitive Data Summaries - Status: To Do (Depends on COMPLIANCE-8)  
    *   Ticket ID: REP-4 (Web Admin UI - \`carepop-web/\`): Implement UI: Reporting Dashboard & Export - Status: To Do  
    *   Ticket ID: REP-5: Build Backend API (Cloud Run Function): Report Data Export (CSV/JSON) - Status: To Do

---

## Epic TRACKING-DATA: Secure Health Tracking Modules (Pill & Menstrual - UI: \`carepop-nativeapp/\` & potential \`carepop-web/\`, Backend \`carepop-backend/\` with App Encryption)  
*   Epic Goal: Implement secure health tracking modules.  
*   Status: To Do

    *   Ticket ID: TRK-1: Design & Implement Pill & Menstrual Tracker Database Schemas (Supabase, Highly Sensitive) - Status: To Do  
    *   Ticket ID: TRK-2: Implement Backend Cryptography Utility (Cloud Run Function) - SEE SEC-E-2  
    *   Ticket ID: TRK-3: Build Backend API (Cloud Run Function): User Manage Pill Tracker Data (Log/Edit/Delete - Encrypted) - Status: To Do (Depends on TRK-1, SEC-E-2)  
    *   Ticket ID: TRK-4: Build Backend API (Cloud Run Function): User Manage Menstrual Tracker Data (Log/Edit/Delete - Encrypted) - Status: To Do (Depends on TRK-1, SEC-E-2)  
    *   Ticket ID: TRK-5: Build Backend API (Cloud Run Function): User View Own Tracker Data (Decrypted Retrieval) - Status: To Do (Depends on TRK-1, SEC-E-2)  
    *   Ticket ID: TRK-6: Build Backend Logic (Cloud Scheduler + Cloud Run): Schedule Tracking Reminders - Status: To Do  
    *   Ticket ID: TRK-7: Build Backend API (Cloud Run Function): Provider View Assigned Patient Tracking Data (Strict Consent & Anonymization Required) - Status: To Do (Phase 3+)  
    *   Ticket ID: TRK-8 (Native Mobile App): Implement UI: Pill Tracker Screens (Logging, List, Reminder Config) - Status: To Do  
    *   Ticket ID: TRK-9 (Native Mobile App): Implement UI: Menstrual Tracker Screens (Logging, Calendar View, Symptoms, Reminder Config) - Status: To Do  
    *   *(Equivalent Web UI tickets for \`carepop-web/\` if tracker editing/viewing planned there) - Status: To Do

---

## Epic AI-HEALTH-ASSESS: AI-Assisted Health Assessment (Initial Scope - UI: \`carepop-nativeapp/\` & potential \`carepop-web/\`, Backend \`carepop-backend/\`)  
*   Epic Goal: Implement low-risk AI health assessment feature.  
*   Status: To Do

    *   Ticket ID: AI-1: Build Backend Service (Cloud Run Function): Integration for AI/NLP Processing - Status: To Do  
    *   Ticket ID: AI-2: Build Backend API (Cloud Run Function): Process User Assessment Input (Low-Risk Scope) - Status: To Do (Depends on AI-1)  
    *   Ticket ID: AI-3 (Native Mobile App): Implement UI: AI Health Assessment Input Screen - Status: To Do  
    *   Ticket ID: AI-4 (Native Mobile App): Implement UI: Display AI Health Assessment Results (Low-Risk Scope) - Status: To Do  
    *   *(Equivalent Web UI tickets for \`carepop-web/\` if AI feature planned there) - Status: To Do

---

## Epic SECURITY-DEEP-DIVE: Comprehensive Technical Security (Backend \`carepop-backend/\` & Infrastructure)  
*   Epic Goal: Implement advanced security measures.  
*   Status: Partially Done (Secrets managed, basic infra, deeper items pending)

    *   Ticket ID: SEC-E-1: Design Application-Level At-Rest Encryption Integration Strategy (Backend Strategy) - To Do  
    *   Ticket ID: SEC-E-2: Implement Backend Cryptography Utility (AES-256-GCM) (Cloud Run Function using Secret Manager) - Status: To Do  
    *   Ticket ID: SEC-S-1: Implement Secure Secrets Management with Google Cloud Secret Manager - Done  
    *   Ticket ID: SEC-A-1: Design & Implement Comprehensive Auditing Strategy (Supabase & Cloud Logging) - To Do  
    *   Ticket ID: SEC-A-2: Refine Rate Limiting & Implement Bot Protection (GCP Features) - To Do  
    *   Ticket ID: SEC-TEST-1: Integrate Automated SAST into Backend CI - To Do  
    *   Ticket ID: SEC-TEST-2: Integrate Automated Dependency Vulnerability Scanning into Backend CI - To Do  
    *   Ticket ID: SEC-TEST-3: Set Up & Conduct Regular Automated DAST Scans (Backend APIs) - To Do  
    *   Ticket ID: SEC-TEST-4: Schedule & Perform Periodic Manual Penetration Testing (Overall Project) - To Do  
    *   Ticket ID: SEC-OTHER-1: Configure & Review Infrastructure Security Settings (GCP & Supabase) - In Progress (Ongoing)

---

## Epic ADMIN: Web Admin Portal (P2 - Post MVP - \`carepop-web/\`)  
*   Epic Goal: Develop web-based admin portal in \`carepop-web/\`.  
*   Status: To Do

    *   *(Admin tickets for User Management UI (PROF-5), Provider/Facility UI (DIR-7), Inventory UI (INV-4), Reporting UI (REP-4), etc. belong here and are marked "To Do" in their respective epics)*

---

## Epic ONBOARDING: Native App Onboarding Flow (MVP)
*   Goal: Implement a multi-step onboarding experience for new users in \`carepop-nativeapp/\`.
*   Status: In Progress

    *   Ticket ID: ONBOARDING-1: Implement Splash Screen (\`carepop-nativeapp/\`)  
        *   Status: In Progress
        *   Notes: Located at \`screens/Onboarding/SplashScreen.tsx\`. Resolved potential text rendering warning issue.
        *   Technology/Implementation Suggestions: Full-screen component, displays logo, potentially an activity indicator. Shown while app loads initial assets/checks auth state.

    *   Ticket ID: ONBOARDING-2: Implement Onboarding Screen One (\`carepop-nativeapp/\`)  
        *   Status: In Progress
        *   Notes: Located at \`screens/Onboarding/OnboardingScreenOne.tsx\`. Uses smaller \`onboarding-1.png\` Image. Text styled separately. Swipe navigation. Unused navigation prop removed. Resolved potential text rendering warning issue.

    *   Ticket ID: ONBOARDING-3: Implement Onboarding Screen Two (\`carepop-nativeapp/\`)  
        *   Status: In Progress
        *   Notes: Located at \`screens/Onboarding/OnboardingScreenTwo.tsx\`. Uses smaller \`onboarding-2.png\` Image. Text styled separately. Swipe navigation. Unused navigation prop removed. Resolved potential text rendering warning issue.

    *   Ticket ID: ONBOARDING-4: Implement Onboarding Screen Three (\`carepop-nativeapp/\`)  
        *   Status: In Progress
        *   Notes: Located at \`screens/Onboarding/OnboardingScreenThree.tsx\`. Uses smaller \`onboarding-3.png\` Image. Text and button styled separately. Final screen, uses "Get Started" button. Unused navigation prop removed. Resolved potential text rendering warning issue.

    *   Ticket ID: ONBOARDING-5: Integrate Onboarding Flow into App Logic (\`carepop-nativeapp/\`)  
        *   Status: In Progress
        *   Notes: Involves \`App.tsx\` and AsyncStorage for completion state. Manages swipe navigation logic via Carousel. App.tsx temporarily modified to always show onboarding. Text rendering warning resolved.


# Epic & Ticket Tracker

IMPORTANT NOTE ON CURRENT STATUS (As of TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW):
*   The project has undergone a major architectural and structural refactor, and the Git \`main\` branch history has been reset to reflect this.
*   The project now consists of three top-level directories: \`carepop-backend/\`, \`carepop-nativeapp/\` (Expo), and \`carepop-web/\` (Next.js).
*   \`epics_and_tickets.md\` has been comprehensively updated to align with this new structure, technology stack, and the decision to use direct Client-Supabase Auth with a DB trigger.
*   This tracker reflects the state *after* the planning refactor. Statuses below indicate the *next steps* for implementation within the new structure. Tasks previously "Done" in the old structure often need code refactoring or verification.

---

## Epic COMPLIANCE: Data Privacy & Security Assurance (MVP+)  
*   Goal: Establish and implement a secure and compliant data management framework.  
*   Status: To Do (Requires specific implementation within new structure)

    *   [Not Started] COMPLIANCE-1: Implement Data Encryption at Rest Strategy (Application Level via Backend)  
        *   Notes: Depends on SEC-E-2.
    *   [In Progress] COMPLIANCE-2: Implement Comprehensive RLS Policies for Core Data (BE/Supabase)  
        *   Notes: Basic profile RLS done in FOUND-8; needs expansion for other modules.
    *   [Not Started] COMPLIANCE-3: Implement Data Access Control Auditing (Backend & Supabase)  
        *   Notes: Depends on SEC-A-1 implementation.
    *   [Not Started] COMPLIANCE-4: Design & Implement Data Retention Policy Enforcement (Backend Job)  
    *   [Not Started] COMPLIANCE-5: Document Data Breach Response Plan (Process)  
    *   [Not Started] COMPLIANCE-6: Implement Data Subject Rights Management Backend API (Backend & Supabase)  
    *   [Not Started] COMPLIANCE-7: Conduct Data Protection Impact Assessment (DPIA) (Process)  
    *   [Not Started] COMPLIANCE-8: Implement Robust Data Anonymization Strategy & Utility (Backend Logic/Utility)  

---

## Epic FE-SETUP: Frontend Applications Initialization & Core Structure (MVP)  
*   Goal: Establish foundational setup for both native mobile and web apps.  
*   Status: Partially Done (Init done, Navigation & Theming integration needed)

    *   [Done] FE-SETUP-1: Initialize \`carepop-nativeapp/\` (Expo) Project (MVP)  
    *   [Done] FE-SETUP-2: Initialize \`carepop-web/\` (Next.js) Project (MVP)  
    *   [In Progress] FE-SETUP-3: Implement Native App Navigation (\`carepop-nativeapp/\`) (MVP)  
        *   Notes: Navigation structure primarily defined in \`App.tsx\`. Still blocked by persistent navigation error: \`MyProfileScreen\` cannot navigate to \`EditProfileScreen\`. Focus on \`App.tsx\` context/rendering.
    *   [Not Started] FE-SETUP-4: Implement Web App Navigation (\`carepop-web/\`) (MVP)  
    *   [In Progress] FE-SETUP-5: Integrate Native App Theme & Core UI Components (\`carepop-nativeapp/\`) (MVP)  
        *   Notes: Components migrated, theme defined. Drawer icons standardized to Ionicons.
    *   [Not Started] FE-SETUP-6: Setup Web App Styling & Base Components (\`carepop-web/\`) (MVP)  
    *   [Done] FE-SETUP-7: Debug ExpoLinearGradient Native View Manager Error (\`carepop-nativeapp/\`)
        *   Goal: Resolve the "ViewManagerResolver returned null for ViewManagerAdapter_ExpoLinearGradient" error.
        *   Scope: Investigate \`expo-linear-gradient\` installation, versions, and native linking. Check for conflicts with other libraries or recent code changes.
        *   Location: \`carepop-mobile/\`
        *   Acceptance Criteria: Application runs without crashing due to this error. Linear gradients render correctly.
        *   Resolution: Removed \`LinearGradient\` from \`SplashScreen.tsx\` as it was causing the error. Replaced with a solid background and logo image.

---

## Epic 1: Core Setup, Authentication & Deployment Foundation (Supabase & GCP)  
*   Epic Goal: Establish infrastructure, backend setup, foundational DB schema/RLS, integrate direct client-Supabase auth flow, basic CI/CD.  
*   Status: Mostly Done (CI/CD refinement needed)

    *   [Done] FOUND-1: Setup Code Repositories & Initial Project Structure (Native Mobile App & Backend)  
    *   [Done] FOUND-2: Configure Native Mobile App (Expo) & Node.js Backend Development Environment with TypeScript & Supabase SDK  
    *   [Done] FOUND-3: Select, Provision, & Configure Core Cloud Infrastructure (Google Cloud Platform & Supabase) (Staging)  
    *   [Done] FOUND-4: Implement Structured Logging and Configuration Management (Cloud Logging & Secret Manager for Backend)  
    *   [In Progress] FOUND-5: Configure CI/CD Pipeline (Build, Test, Deploy Backend & Native Mobile App to Staging)  
        *   Notes: BE Done, Native EAS pending setup/test.
    *   [Done] FOUND-6: Set up Basic Testing Frameworks & Initial Unit Tests (Backend & Native Mobile App)  
    *   [Done] FOUND-7: Configure Supabase Authentication (For Backend and All Client Applications)  
    *   [Done] FOUND-8: Design & Implement Foundational User Database Schema (Supabase) (Authentication Focus for All Clients)  
    *   [Done] FOUND-9 (Revised): Implement Profile Creation on Signup (Supabase Trigger)  
        *   Notes: User confirmed trigger is implemented.
    *   [Obsolete] FOUND-10: Build Backend API (Cloud Run Function): Secure User Login & Token Generation  
        *   Notes: Obsolete/Superseded by direct client-Supabase auth.

---

## Epic AUTH: User Authentication (MVP - Implementation)  
*   Goal: Implement secure user registration and login via direct Client-Supabase interaction.  
*   Status: To Do (UI elements done, integration logic pending nav fix)

    *   [Not Started] AUTH-1: Integrate Supabase Registration (Native & Web Clients, Supabase Trigger) (MVP)  
        *   Notes: Frontend calls + Trigger verification needed.
    *   [Not Started] AUTH-2: Integrate Supabase Login (Native & Web Clients) (MVP)  
        *   Notes: Frontend calls needed.
    *   [Not Started] AUTH-3: Secure Supabase Session & Token Handling (Native & Web Clients) (MVP)  
        *   Notes: Client-side logic + Secure Storage needed.
    *   [In Progress] AUTH-4: Implement Login UI (\`carepop-nativeapp/\`) (MVP)  
        *   Notes: UI refactored with Ionicons, logo added. Connection logic needs implementation/verification pending navigation fix.
    *   [In Progress] AUTH-5: Implement Registration UI (\`carepop-nativeapp/\`) (MVP)  
        *   Notes: UI refactored, logo added. Connection logic needs implementation/verification pending navigation fix.
    *   [Not Started] AUTH-6: Implement Login UI (\`carepop-web/\`) (MVP)  
    *   [Not Started] AUTH-7: Implement Registration UI (\`carepop-web/\`) (MVP)  
    *   [In Progress] AUTH-8: Implement Password Reset Flow (BE Logic via Supabase, FE for Native & Web) (P2)  
        *   Notes: Native UI for \`ForgotPasswordScreen.tsx\` updated with logo. Backend/Supabase logic pending.

---

## Epic 2: UI/UX Design System & Core Components (Native Mobile App MVP Kickoff)  
*   Goal: Build core reusable native UI components within \`carepop-nativeapp\`.  
*   Status: Done (Initial components created and integrated, available for use)

    *   [Done] UI-1: Define & Implement Shared Theme (For Native Mobile App)  
        *   Notes: Integrated.
    *   [Done] UI-2: Build Core Reusable Components - Buttons (For Native Mobile App)  
        *   Notes: Integrated.
    *   [Done] UI-3: Build Core Reusable Components - Form Inputs (For Native Mobile App)  
        *   Notes: Integrated.
    *   [Done] UI-4: Build Core Reusable Components - Layout (Card, Container) (For Native Mobile App)  
        *   Notes: Integrated.
    *   [Obsolete] UI-5: Implement Native Mobile Frontend UI: User Registration Screen (Functional)  
        *   Notes: Superseded by AUTH-5 (UI part done, logic needs redo).
    *   [Obsolete] UI-6: Implement Native Mobile Frontend UI: User Login Screen (Functional)  
        *   Notes: Superseded by AUTH-4 (UI part done, logic needs redo).

---

## Epic 3: Secure Client Handling (Native Mobile & Web), Supabase RLS & Foundational DPA Consent  
*   Goal: Secure token handling, implement RBAC/RLS, integrate DPA consent.  
*   Status: Partially Done (Basic RLS setup, most pending)

    *   [In Progress] SEC-BE-1: Implement RBAC Roles, Permission Concepts, and Foundational Supabase RLS (Serving All Clients)  
        *   Notes: Profile RLS done, roles/permissions TBD.
    *   [Not Started] SEC-BE-2: Implement Backend Authentication Middleware (Cloud Run - for Protected Endpoints)  
    *   [Not Started] SEC-BE-3: Implement Core RBAC Enforcement (Supabase RLS & Backend Checks for All Clients)  
    *   [Not Started] SEC-FE-1: Implement Secure Client-Side Auth Token Storage & Retrieval (Native & Web)  
        *   Notes: Critical for AUTH-3.
    *   [Not Started] SEC-BE-4: Update User Schema & Logic to Store Consent (Backend/Supabase)  
    *   [Not Started] SEC-FE-2: Implement Native Mobile Frontend UI: Integrate DPA Consent into Registration  
    *   [Done] SEC-BE-5: Configure Secure HTTPS/TLS for Staging  
        *   Notes: Verified defaults.

---

## Epic WEB: Dedicated Web Application (Next.js, Tailwind CSS, Shadcn UI)  
*   Goal: Build the separate web application.  
*   Status: To Do (Basic init done, functional implementation pending)

    *   [Done] WEB-SETUP-1: Initialize Project  
    *   [Not Started] WEB-SETUP-2: Set up Supabase Client & Auth Context/Hooks  
    *   [Not Started] WEB-SETUP-3: Set up Basic Layout with Navigation  
    *   [Not Started] AUTH-6: Implement Login UI (\`carepop-web/\`) (MVP)  
    *   [Not Started] AUTH-7: Implement Registration UI (\`carepop-web/\`) (MVP)  
    *   [Not Started] WEB-1: Develop Landing Page (\`carepop-web/\`) (MVP)  
    *   [Not Started] WEB-2: Develop "About Us" Page (\`carepop-web/\`) (MVP)  
    *   [Not Started] WEB-3: Develop "Contact Us" Page (\`carepop-web/\`) (MVP)  
    *   [Not Started] WEB-4: Basic SEO Setup (\`carepop-web/\`) (MVP)  
    *   [Not Started] WEB-DIR-8: Implement Web App SSR/SSG for Public Directory Pages & Canonical Tags  
    *   [Not Started] WEB-DIR-9: Implement Detailed Schema.org Markup for Directory Entries  
    *   [Not Started] WEB-DIR-10: Optimize Web App Performance & Technical SEO for Directory Pages  
    *   Notes: Other Web-specific UI tickets for modules - Profile, Appt, Admin, etc. are all To Do.

---

## Epic Y: Healthcare Provider Directory (Native Mobile App UI, Backend serving All Clients, Web App Feature)  
*   Goal: Implement directory features. SEO now in Epic WEB.  
*   Status: To Do

    *   [Not Started] DIR-1: Refine Provider/Facility Database Schema (Supabase) & Add Indexing  
    *   [Not Started] DIR-2: Build Backend API (Cloud Run Function): Advanced Directory Search  
    *   [Not Started] DIR-3: Build Backend API (Cloud Run Functions): Admin Management (Full CRUD)  
    *   [Not Started] DIR-4 (Native Mobile App): Implement UI: Advanced Directory Search Filters & Location Input  
    *   [Not Started] DIR-5 (Native Mobile App): Implement UI: Display Search Results on Map & List View Toggle  
    *   [Not Started] DIR-6 (Native Mobile App): Implement UI: Deep-Linking for Navigation to External Map Apps  
    *   [Not Started] DIR-7 (Web Admin UI - \`carepop-web/\`): Implement UI: Provider/Facility Management Screens (CRUD)  
    *   Notes: Equivalent Web UI Search/Display tickets for \`carepop-web/\` need to be added here - Status: To Do

---

## Epic APPT-USER: Appointment Scheduling (User Flows - Native Mobile & Web UI, Backend serving All Clients)  
*   Goal: Implement user-facing booking flow.  
*   Status: To Do

    *   [Not Started] (Prerequisite) APPT-SCHEMA-1: Design & Implement Appointments & Availability DB Schema (Supabase)  
    *   [Not Started] APP-USER-1: Build Backend API: Fetch User's Future Appointments  
    *   [Not Started] APP-USER-2: Build Backend API: Fetch User's Past/Cancelled Appointments  
    *   [Not Started] APP-BACKEND-1: Build Backend API: Fetch Provider Availability Slots  
    *   [Not Started] APP-BACKEND-2: Build Backend API: Request/Book Appointment  
    *   [Not Started] APP-BACKEND-3: Build Backend API: User Cancel Appointment  
    *   [Not Started] APP-USER-3 (Native Mobile App): Implement UI: Interactive Availability Calendar View  
    *   [Not Started] APP-USER-4 (Native Mobile App): Implement UI: Display & Select Available Time Slots  
    *   [Not Started] APP-USER-5 (Native Mobile App): Implement UI: Appointment Booking Confirmation Flow  
    *   [Not Started] APP-USER-6 (Native Mobile App): Implement UI: My Appointments Screen (List & Filter)  
    *   [Not Started] APP-USER-7 (Native Mobile App): Implement UI: My Appointment Detail View & Cancellation Action  
    *   Notes: Equivalent Web UI tickets for booking flow in \`carepop-web/\` need to be added here - Status: To Do

---

## Epic APPT-ADMIN/NOTIF: Appointment Scheduling (Admin/Provider & Notifications - Backend serving All Clients, Admin UI primarily Web)  
*   Goal: Implement admin schedule management and notifications.  
*   Status: To Do

    *   [Not Started] APP-ADMIN-1: Refine/Implement Provider Availability Schema & Logic (Supabase)  
    *   [Not Started] APP-ADMIN-2: Build Backend API: Admin/Provider Manage Availability (CRUD)  
    *   [Not Started] APP-ADMIN-3: Build Backend API: Admin/Provider View Appointment Requests  
    *   [Not Started] APP-ADMIN-4: Build Backend API: Admin/Provider Confirm/Cancel Appointment Request  
    *   [Not Started] APP-ADMIN-5 (Web Admin UI - \`carepop-web/\`): Implement UI: Schedule & Appointment Management  
    *   [Not Started] APP-ADMIN-6: Integrate Backend with Notification Service (Appointment Status Triggers)  
    *   [Not Started] APP-ADMIN-7: Build Backend Service (Cloud Scheduler + Cloud Run): Scheduled Appointment Reminders  
    *   [Not Started] APP-ADMIN-8 (Native Mobile App): Implement Background Task Listener & Local Notification Trigger  

---

## Epic PROFILE: Secure User Profile & Linked Data Views (UI: Native Mobile & Web, Backend serving All Clients, Admin UI primarily Web)  
*   Goal: Implement detailed profile and linked data framework.  
*   Status: To Do (Beyond foundational profile)

    *   [Done] PROF-1: Enhance User Profile Database Schema (Supabase) (Detailed Fields)  
    *   [Done] PROF-2: Build Backend API (Cloud Run Function): User View/Edit Detailed Profile  
    *   [Done] PROF-3: Build Backend API (Cloud Run Function): Admin View/Manage Any User Profile  
    *   [Not Started] PROF-4 (Native Mobile App): Implement UI: Detailed User Profile Screens (View/Edit)  
    *   [Not Started] PROF-5 (Web Admin UI - \`carepop-web/\`): Implement UI: User Management Screens (List/View/Edit)  
    *   [Not Started] PROF-6: Design Backend Framework for Secure Linked Data Retrieval (Placeholder - Supabase RLS & Cloud Run Checks)  
    *   [In Progress] PROF-7 (Native Mobile App): Implement UI: Placeholder Linked Data Sections on Profile/Dashboard  
        *   Notes: Placeholder UI links exist.
    *   Notes: Equivalent Web UI tickets for Profile View/Edit in \`carepop-web/\` need to be added here - Status: To Do

---

## Epic TRANSACTIONS: Transaction History (User Focused - UI: Native Mobile & Web, Backend \`carepop-backend/\` serving All Clients)  
*   Goal: Implement viewing of transaction history.  
*   Status: To Do

    *   [Not Started] TRN-1: Design & Implement Transaction History Database Schema (Supabase)  
    *   [Not Started] TRN-2: Build Backend API (Cloud Run Function): Record New Transaction (Internal)  
    *   [Not Started] TRN-3: Build Backend API (Cloud Run Function): User View Own Transaction History  
    *   [Not Started] TRN-4 (Native Mobile App): Implement UI: User View Transaction History Screen  
    *   Notes: Equivalent Web UI ticket for \`carepop-web/\` needs to be added here - Status: To Do

---

## Epic INVENTORY: Medicine Inventory Management (Admin Focused - Admin UI primarily \`carepop-web/\`, Backend \`carepop-backend/\`)  
*   Goal: Implement inventory tracking for admins.  
*   Status: To Do

    *   [Not Started] INV-1: Design & Implement Inventory Database Schema (Supabase)  
    *   [Not Started] INV-2: Build Backend API (Cloud Run Functions): Admin Manage Inventory (Full CRUD)  
    *   [Not Started] INV-4 (Web Admin UI - \`carepop-web/\`): Implement UI: Inventory Management Screens (CRUD)  
    *   [Not Started] INV-5: Implement Low Stock Alert System (Backend Logic & Admin UI Notification - Primarily \`carepop-web/\`)  

---

## Epic REPORTING: Admin Reporting (Aggregated Data - Admin UI primarily \`carepop-web/\`, Backend \`carepop-backend/\`)  
*   Goal: Implement admin reporting features.  
*   Status: To Do

    *   [Not Started] REP-1: Design Data Aggregation Strategy for Reporting (Supabase & Cloud Run)  
    *   [Not Started] REP-2: Build Backend Logic & API for Basic Aggregation & Reporting (Non-Sensitive Data)  
    *   [Not Started] REP-3: Build Backend Logic & API for Aggregating & Anonymizing Sensitive Data Summaries  
        *   Notes: Depends on COMPLIANCE-8.
    *   [Not Started] REP-4 (Web Admin UI - \`carepop-web/\`): Implement UI: Reporting Dashboard & Export  
    *   [Not Started] REP-5: Build Backend API (Cloud Run Function): Report Data Export (CSV/JSON)  

---

## Epic TRACKING-DATA: Secure Health Tracking Modules (Pill & Menstrual - UI: Native Mobile & potential Web, Backend \`carepop-backend/\` with App Encryption)  
*   Epic Goal: Implement secure health tracking modules.  
*   Status: To Do

    *   [Not Started] TRK-1: Design & Implement Pill & Menstrual Tracker Database Schemas (Supabase, Highly Sensitive)  
    *   [Not Started] TRK-2: Implement Backend Cryptography Utility (Cloud Run Function) - SEE SEC-E-2  
    *   [Not Started] TRK-3: Build Backend API (Cloud Run Function): User Manage Pill Tracker Data (Encrypted)  
    *   [Not Started] TRK-4: Build Backend API (Cloud Run Function): User Manage Menstrual Tracker Data (Encrypted)  
    *   [Not Started] TRK-5: Build Backend API (Cloud Run Function): User View Own Tracker Data (Decrypted)  
    *   [Not Started] TRK-6: Build Backend Logic (Cloud Scheduler + Cloud Run): Schedule Tracking Reminders  
    *   [Not Started] TRK-7: Build Backend API (Cloud Run Function): Provider View Assigned Patient Tracking Data (Strict Consent Required) (P3+)  
    *   [Not Started] TRK-8 (Native Mobile App): Implement UI: Pill Tracker Screens  
    *   [Not Started] TRK-9 (Native Mobile App): Implement UI: Menstrual Tracker Screens  
    *   Notes: Equivalent Web UI tickets for \`carepop-web/\` if viewing/editing tracker data is planned there - Status: To Do

---

## Epic AI-HEALTH-ASSESS: AI-Assisted Health Assessment (Initial Scope - UI: Native Mobile & potential Web, Backend \`carepop-backend/\`)  
*   Epic Goal: Implement low-risk AI health assessment feature.  
*   Status: To Do

    *   [Not Started] AI-1: Build Backend Service (Cloud Run Function): Integration for AI/NLP Processing  
    *   [Not Started] AI-2: Build Backend API (Cloud Run Function): Process User Assessment Input (Low-Risk Scope)  
        *   Notes: Depends on AI-1.
    *   [Not Started] AI-3 (Native Mobile App): Implement UI: AI Health Assessment Input Screen  
    *   [Not Started] AI-4 (Native Mobile App): Implement UI: Display AI Health Assessment Results (Low-Risk Scope)  
    *   Notes: Equivalent Web UI tickets for \`carepop-web/\` if AI feature planned there - Status: To Do

---

## Epic SECURITY-DEEP-DIVE: Comprehensive Technical Security (Backend \`carepop-backend/\` & Infrastructure)  
*   Epic Goal: Implement advanced security measures.  
*   Status: Partially Done (Secrets managed, basic infra, deeper items pending)

    *   [Not Started] SEC-E-1: Design Application-Level At-Rest Encryption Integration Strategy (Backend Strategy)  
    *   [Not Started] SEC-E-2: Implement Backend Cryptography Utility (AES-256-GCM) (Cloud Run Function using Secret Manager)  
    *   [Done] SEC-S-1: Implement Secure Secrets Management with Google Cloud Secret Manager  
    *   [Not Started] SEC-A-1: Design & Implement Comprehensive Auditing Strategy (Supabase & Cloud Logging)  
    *   [Not Started] SEC-A-2: Refine Rate Limiting & Implement Bot Protection (GCP Features)  
    *   [Not Started] SEC-TEST-1: Integrate Automated SAST into Backend CI  
    *   [Not Started] SEC-TEST-2: Integrate Automated Dependency Vulnerability Scanning into Backend CI  
    *   [Not Started] SEC-TEST-3: Set Up & Conduct Regular Automated DAST Scans (Backend APIs)  
    *   [Not Started] SEC-TEST-4: Schedule & Perform Periodic Manual Penetration Testing (Overall Project)  
    *   [In Progress] SEC-OTHER-1: Configure & Review Infrastructure Security Settings (GCP & Supabase)  
        *   Notes: Ongoing.

---

## Epic ADMIN: Web Admin Portal (P2 - Post MVP - \`carepop-web/\`)  
*   Epic Goal: Develop web-based admin portal in \`carepop-web/\`.  
*   Status: To Do

    *   Notes: Admin tickets for User Management UI (PROF-5), Provider/Facility UI (DIR-7), Inventory UI (INV-4), Reporting UI (REP-4), etc. belong here and are marked "To Do" in their respective functional epics.

---

## Epic ONBOARDING: Native App Onboarding Flow (MVP)
*   Goal: Implement a multi-step onboarding experience for new users in \`carepop-nativeapp/\`.
*   Status: In Progress

    *   [In Progress] ONBOARDING-1: Implement Splash Screen (\`carepop-nativeapp/\`)
        *   Notes: Located at \`screens/Onboarding/SplashScreen.tsx\`. Resolved potential text rendering warning issue.
    *   [In Progress] ONBOARDING-2: Implement Onboarding Screen One (\`carepop-nativeapp/\`)
        *   Notes: Located at \`screens/Onboarding/OnboardingScreenOne.tsx\`. Uses smaller \`onboarding-1.png\` Image. Text styled separately. Swipe navigation. Unused navigation prop removed. Resolved potential text rendering warning issue.
    *   [In Progress] ONBOARDING-3: Implement Onboarding Screen Two (\`carepop-nativeapp/\`)
        *   Notes: Located at \`screens/Onboarding/OnboardingScreenTwo.tsx\`. Uses smaller \`onboarding-2.png\` Image. Text styled separately. Swipe navigation. Unused navigation prop removed. Resolved potential text rendering warning issue.
    *   [In Progress] ONBOARDING-4: Implement Onboarding Screen Three (\`carepop-nativeapp/\`)
        *   Notes: Located at \`screens/Onboarding/OnboardingScreenThree.tsx\`. Uses smaller \`onboarding-3.png\` Image. Text and button styled separately. Final screen, uses "Get Started" button. Unused navigation prop removed. Resolved potential text rendering warning issue.
    *   [In Progress] ONBOARDING-5: Integrate Onboarding Flow into App Logic (\`carepop-nativeapp/\`)
        *   Notes: Involves \`App.tsx\` and AsyncStorage for completion state. Manages swipe navigation logic via Carousel. App.tsx temporarily modified to always show onboarding. Text rendering warning resolved.

---

## Active Debugging Notes
-   **"NAVIGATE with payload {\"name\":\"EditProfile\"} was not handled by any navigator":** Persists. Current focus is on \`App.tsx\` navigator context and rendering logic.


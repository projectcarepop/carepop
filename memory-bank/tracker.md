Okay, here is the complete, reset \`tracker.md\` file, reflecting the new three-pillar architecture and the start of the implementation phase within this new structure. Most functional tickets are marked as "To Do" or "In Progress (Needs Refactor)" to provide a clean slate for tracking work against the \*revised\* \`epics\_and\_tickets.md\`.

\---

\*\*START OF FILE: tracker.md (Complete Reset Version)\*\*

\`\`\`markdown  
\# Epic & Ticket Tracker

\*\*IMPORTANT NOTE ON CURRENT STATUS (As of \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\>):\*\*  
\*\*The project has undergone a major architectural and structural refactor, and the Git \`main\` branch history has been reset to reflect this.\*\*  
\-   The project now consists of three top-level directories: \`carepop-backend/\`, \`carepop-nativeapp/\` (Expo), and \`carepop-web/\` (Next.js).  
\-   \*\*\`epics\_and\_tickets.md\` has been comprehensively updated\*\* to align with this new structure, technology stack, and the decision to use direct Client-Supabase Auth with a DB trigger.  
\-   \*\*This tracker reflects the state \*after\* the planning refactor.\*\* Statuses below indicate the \*next steps\* for implementation within the new structure. Tasks previously "Done" in the old structure often need code refactoring or verification.

\---

\#\# Epic COMPLIANCE: Data Privacy & Security Assurance (MVP+)  
\*   \*\*Goal:\*\* Establish and implement a secure and compliant data management framework.  
\*   \*\*Status:\*\* To Do (Requires specific implementation within new structure)

    \*   \*\*Ticket ID:\*\* COMPLIANCE-1: Implement Data Encryption at Rest Strategy (Application Level via Backend) \- \*\*Status:\*\* To Do (Depends on SEC-E-2)  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-2: Implement Comprehensive RLS Policies for Core Data (BE/Supabase) \- \*\*Status:\*\* In Progress (Basic profile RLS done in FOUND-8; needs expansion for other modules)  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-3: Implement Data Access Control Auditing (Backend & Supabase) \- \*\*Status:\*\* To Do (Depends on SEC-A-1 implementation)  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-4: Design & Implement Data Retention Policy Enforcement (Backend Job) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-5: Document Data Breach Response Plan (Process) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-6: Implement Data Subject Rights Management Backend API (Backend & Supabase) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-7: Conduct Data Protection Impact Assessment (DPIA) (Process) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* COMPLIANCE-8: Implement Robust Data Anonymization Strategy & Utility (Backend Logic/Utility) \- \*\*Status:\*\* To Do

\---

\#\# Epic FE-SETUP: Frontend Applications Initialization & Core Structure (MVP)  
\*   \*\*Goal:\*\* Establish foundational setup for both native mobile and web apps.  
\*   \*\*Status:\*\* Partially Done (Init done, Navigation & Theming integration needed)

    \*   \*\*Ticket ID:\*\* FE-SETUP-1: Initialize \`carepop-nativeapp/\` (Expo) Project (MVP) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FE-SETUP-2: Initialize \`carepop-web/\` (Next.js) Project (MVP) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FE-SETUP-3: Implement Native App Navigation (\`carepop-nativeapp/\`) (MVP) \- \*\*Status:\*\* In Progress (Needs implementation of core navigators & auth flow integration)  
    \*   \*\*Ticket ID:\*\* FE-SETUP-4: Implement Web App Navigation (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* FE-SETUP-5: Integrate Native App Theme & Core UI Components (\`carepop-nativeapp/\`) (MVP) \- \*\*Status:\*\* In Progress (Components migrated, theme defined, needs usage verification)  
    \*   \*\*Ticket ID:\*\* FE-SETUP-6: Setup Web App Styling & Base Components (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do

\---

\#\# Epic 1: Core Setup, Authentication & Deployment Foundation (Supabase & GCP)  
\*   \*\*Epic Goal:\*\* Establish infrastructure, backend setup, foundational DB schema/RLS, integrate \*\*direct client-Supabase auth\*\* flow, basic CI/CD.  
\*   \*\*Status:\*\* Mostly Done (Requires FOUND-9 Trigger implementation & testing, CI/CD refinement)

    \*   \*\*Ticket ID:\*\* FOUND-1: Setup Code Repositories & Initial Project Structure (Native Mobile App & Backend) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-2: Configure Native Mobile App (Expo) & Node.js Backend Development Environment with TypeScript & Supabase SDK \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-3: Select, Provision, & Configure Core Cloud Infrastructure (Google Cloud Platform & Supabase) (Staging) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-4: Implement Structured Logging and Configuration Management (Cloud Logging & Secret Manager for Backend) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-5: Configure CI/CD Pipeline (Build, Test, Deploy Backend & Native Mobile App to Staging) \- \*\*Status:\*\* In Progress (BE Done, Native EAS pending setup/test)  
    \*   \*\*Ticket ID:\*\* FOUND-6: Set up Basic Testing Frameworks & Initial Unit Tests (Backend & Native Mobile App) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-7: Configure Supabase Authentication (For Backend and All Client Applications) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-8: Design & Implement Foundational User Database Schema (Supabase) (Authentication Focus for All Clients) \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* FOUND-9 (Revised): Implement Profile Creation on Signup (Supabase Trigger) \- \*\*Status:\*\* To Do (Needs SQL trigger applied & verified)  
    \*   \*\*Ticket ID:\*\* FOUND-10 (Obsolete): Build Backend API (Cloud Run Function): Secure User Login & Token Generation \- \*\*Status:\*\* Obsolete/Superseded

\---

\#\# Epic AUTH: User Authentication (MVP \- Implementation)  
\*   \*\*Goal:\*\* Implement secure user registration and login via direct Client-Supabase interaction.  
\*   \*\*Status:\*\* To Do (Requires implementation based on revised plan)

    \*   \*\*Ticket ID:\*\* AUTH-1: Integrate Supabase Registration (Native & Web Clients, Supabase Trigger) (MVP) \- \*\*Status:\*\* To Do (Frontend calls \+ Trigger verification)  
    \*   \*\*Ticket ID:\*\* AUTH-2: Integrate Supabase Login (Native & Web Clients) (MVP) \- \*\*Status:\*\* To Do (Frontend calls)  
    \*   \*\*Ticket ID:\*\* AUTH-3: Secure Supabase Session & Token Handling (Native & Web Clients) (MVP) \- \*\*Status:\*\* To Do (Client-side logic \+ Secure Storage)  
    \*   \*\*Ticket ID:\*\* AUTH-4: Implement Login UI (\`carepop-nativeapp/\`) (MVP) \- \*\*Status:\*\* To Do (Refactor UI-6 code to use AUTH-2, AUTH-3 logic)  
    \*   \*\*Ticket ID:\*\* AUTH-5: Implement Registration UI (\`carepop-nativeapp/\`) (MVP) \- \*\*Status:\*\* To Do (Refactor UI-5 code to use AUTH-1 logic)  
    \*   \*\*Ticket ID:\*\* AUTH-6: Implement Login UI (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AUTH-7: Implement Registration UI (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AUTH-8: Implement Password Reset Flow (BE Logic via Supabase, FE for Native & Web) (P2) \- \*\*Status:\*\* To Do

\---

\#\# Epic 2: UI/UX Design System & Core Components (Native Mobile App MVP Kickoff)  
\*   \*\*Goal:\*\* Build core reusable native UI components within \`carepop-nativeapp\`.  
\*   \*\*Status:\*\* Done (Initial components created and integrated, available for use)

    \*   \*\*Ticket ID:\*\* UI-1: Define & Implement Shared Theme (For Native Mobile App) \- \*\*Status:\*\* Done (Integrated)  
    \*   \*\*Ticket ID:\*\* UI-2: Build Core Reusable Components \- Buttons (For Native Mobile App) \- \*\*Status:\*\* Done (Integrated)  
    \*   \*\*Ticket ID:\*\* UI-3: Build Core Reusable Components \- Form Inputs (For Native Mobile App) \- \*\*Status:\*\* Done (Integrated)  
    \*   \*\*Ticket ID:\*\* UI-4: Build Core Reusable Components \- Layout (Card, Container) (For Native Mobile App) \- \*\*Status:\*\* Done (Integrated)  
    \*   \*\*Ticket ID:\*\* UI-5: Implement Native Mobile Frontend UI: User Registration Screen (Functional) \- \*\*Status:\*\* Superseded by AUTH-5 (UI part done, logic needs redo)  
    \*   \*\*Ticket ID:\*\* UI-6: Implement Native Mobile Frontend UI: User Login Screen (Functional) \- \*\*Status:\*\* Superseded by AUTH-4 (UI part done, logic needs redo)

\---

\#\# Epic 3: Secure Client Handling (Native Mobile & Web), Supabase RLS & Foundational DPA Consent  
\*   \*\*Goal:\*\* Secure token handling, implement RBAC/RLS, integrate DPA consent.  
\*   \*\*Status:\*\* Partially Done (Basic RLS setup, most pending)

    \*   \*\*Ticket ID:\*\* SEC-BE-1: Implement RBAC Roles, Permission Concepts, and Foundational Supabase RLS (Serving All Clients) \- \*\*Status:\*\* In Progress (Profile RLS done, roles/permissions TBD)  
    \*   \*\*Ticket ID:\*\* SEC-BE-2: Implement Backend Authentication Middleware (Cloud Run \- for Protected Endpoints) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-BE-3: Implement Core RBAC Enforcement (Supabase RLS & Backend Checks for All Clients) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-FE-1: Implement Secure Client-Side Auth Token Storage & Retrieval (Native & Web) \- \*\*Status:\*\* To Do (Critical for AUTH-3)  
    \*   \*\*Ticket ID:\*\* SEC-BE-4: Update User Schema & Logic to Store Consent (Backend/Supabase) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-FE-2: Implement Native Mobile Frontend UI: Integrate DPA Consent into Registration \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-BE-5: Configure Secure HTTPS/TLS for Staging \- \*\*Status:\*\* Done (Verified defaults)

\---

\#\# Epic WEB: Dedicated Web Application (Next.js, Tailwind CSS, Shadcn UI)  
\*   \*\*Goal:\*\* Build the separate web application.  
\*   \*\*Status:\*\* To Do (Basic init done, functional implementation pending)

    \*   \*\*Ticket ID:\*\* WEB-SETUP-1: Initialize Project \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* WEB-SETUP-2: Set up Supabase Client & Auth Context/Hooks \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-SETUP-3: Set up Basic Layout with Navigation \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AUTH-6: Implement Login UI (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AUTH-7: Implement Registration UI (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-1: Develop Landing Page (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-2: Develop "About Us" Page (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-3: Develop "Contact Us" Page (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-4: Basic SEO Setup (\`carepop-web/\`) (MVP) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-DIR-8: Implement Web App SSR/SSG for Public Directory Pages & Canonical Tags \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-DIR-9: Implement Detailed Schema.org Markup for Directory Entries \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* WEB-DIR-10: Optimize Web App Performance & Technical SEO for Directory Pages \- \*\*Status:\*\* To Do  
    \*   \*\*(Other Web-specific UI tickets for modules \- Profile, Appt, Admin, etc. are all To Do)\*\*

\---

\#\# Epic Y: Healthcare Provider Directory (Native Mobile App UI, Backend serving All Clients, Web App Feature)  
\*   \*\*Goal:\*\* Implement directory features. SEO now in Epic WEB.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* DIR-1: Refine Provider/Facility Database Schema (Supabase) & Add Indexing \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* DIR-2: Build Backend API (Cloud Run Function): Advanced Directory Search \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* DIR-3: Build Backend API (Cloud Run Functions): Admin Management (Full CRUD) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* DIR-4 (Native Mobile App): Implement UI: Advanced Directory Search Filters & Location Input \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* DIR-5 (Native Mobile App): Implement UI: Display Search Results on Map & List View Toggle \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* DIR-6 (Native Mobile App): Implement UI: Deep-Linking for Navigation to External Map Apps \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* DIR-7 (Web Admin UI \- \`carepop-web/\`): Implement UI: Provider/Facility Management Screens (CRUD) \- \*\*Status:\*\* To Do  
    \*   \*\*(Equivalent Web UI Search/Display tickets for \`carepop-web/\` need to be added here)\*\* \- \*\*Status:\*\* To Do

\---

\#\# Epic APPT-USER: Appointment Scheduling (User Flows \- Native Mobile & Web UI, Backend serving All Clients)  
\*   \*\*Goal:\*\* Implement user-facing booking flow.  
\*   \*\*Status:\*\* To Do

    \*   \*\*(Prerequisite) Ticket ID:\*\* APPT-SCHEMA-1: Design & Implement Appointments & Availability DB Schema (Supabase) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-1: Build Backend API: Fetch User's Future Appointments \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-2: Build Backend API: Fetch User's Past/Cancelled Appointments \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-BACKEND-1: Build Backend API: Fetch Provider Availability Slots \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-BACKEND-2: Build Backend API: Request/Book Appointment \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-BACKEND-3: Build Backend API: User Cancel Appointment \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-3 (Native Mobile App): Implement UI: Interactive Availability Calendar View \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-4 (Native Mobile App): Implement UI: Display & Select Available Time Slots \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-5 (Native Mobile App): Implement UI: Appointment Booking Confirmation Flow \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-6 (Native Mobile App): Implement UI: My Appointments Screen (List & Filter) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-USER-7 (Native Mobile App): Implement UI: My Appointment Detail View & Cancellation Action \- \*\*Status:\*\* To Do  
    \*   \*\*(Equivalent Web UI tickets for booking flow in \`carepop-web/\` need to be added here)\*\* \- \*\*Status:\*\* To Do

\---

\#\# Epic APPT-ADMIN/NOTIF: Appointment Scheduling (Admin/Provider & Notifications \- Backend serving All Clients, Admin UI primarily Web)  
\*   \*\*Goal:\*\* Implement admin schedule management and notifications.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* APP-ADMIN-1: Refine/Implement Provider Availability Schema & Logic (Supabase) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-2: Build Backend API: Admin/Provider Manage Availability (CRUD) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-3: Build Backend API: Admin/Provider View Appointment Requests \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-4: Build Backend API: Admin/Provider Confirm/Cancel Appointment Request \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-5 (Web Admin UI \- \`carepop-web/\`): Implement UI: Schedule & Appointment Management \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-6: Integrate Backend with Notification Service (Appointment Status Triggers) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-7: Build Backend Service (Cloud Scheduler \+ Cloud Run): Scheduled Appointment Reminders \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* APP-ADMIN-8 (Native Mobile App): Implement Background Task Listener & Local Notification Trigger \- \*\*Status:\*\* To Do

\---

\#\# Epic PROFILE: Secure User Profile & Linked Data Views (UI: Native Mobile & Web, Backend serving All Clients, Admin UI primarily Web)  
\*   \*\*Goal:\*\* Implement detailed profile and linked data framework.  
\*   \*\*Status:\*\* To Do (Beyond foundational profile)

    \*   \*\*Ticket ID:\*\* PROF-1: Enhance User Profile Database Schema (Supabase) (Detailed Fields) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* PROF-2: Build Backend API (Cloud Run Function): User View/Edit Detailed Profile \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* PROF-3: Build Backend API (Cloud Run Function): Admin View/Manage Any User Profile \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* PROF-4 (Native Mobile App): Implement UI: Detailed User Profile Screens (View/Edit) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* PROF-5 (Web Admin UI \- \`carepop-web/\`): Implement UI: User Management Screens (List/View/Edit) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* PROF-6: Design Backend Framework for Secure Linked Data Retrieval (Placeholder \- Supabase RLS & Cloud Run Checks) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* PROF-7 (Native Mobile App): Implement UI: Placeholder Linked Data Sections on Profile/Dashboard \- \*\*Status:\*\* In Progress (Placeholder UI links exist)  
    \*   \*\*(Equivalent Web UI tickets for Profile View/Edit in \`carepop-web/\` need to be added here)\*\* \- \*\*Status:\*\* To Do

\---

\#\# Epic TRANSACTIONS: Transaction History (User Focused \- UI: Native Mobile & Web, Backend \`carepop-backend/\` serving All Clients)  
\*   \*\*Goal:\*\* Implement viewing of transaction history.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* TRN-1: Design & Implement Transaction History Database Schema (Supabase) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRN-2: Build Backend API (Cloud Run Function): Record New Transaction (Internal) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRN-3: Build Backend API (Cloud Run Function): User View Own Transaction History \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRN-4 (Native Mobile App): Implement UI: User View Transaction History Screen \- \*\*Status:\*\* To Do  
    \*   \*\*(Equivalent Web UI ticket for \`carepop-web/\` needs to be added here)\*\* \- \*\*Status:\*\* To Do

\---

\#\# Epic INVENTORY: Medicine Inventory Management (Admin Focused \- Admin UI primarily \`carepop-web/\`, Backend \`carepop-backend/\`)  
\*   \*\*Goal:\*\* Implement inventory tracking for admins.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* INV-1: Design & Implement Inventory Database Schema (Supabase) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* INV-2: Build Backend API (Cloud Run Functions): Admin Manage Inventory (Full CRUD) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* INV-4 (Web Admin UI \- \`carepop-web/\`): Implement UI: Inventory Management Screens (CRUD) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* INV-5: Implement Low Stock Alert System (Backend Logic & Admin UI Notification \- Primarily \`carepop-web/\`) \- \*\*Status:\*\* To Do

\---

\#\# Epic REPORTING: Admin Reporting (Aggregated Data \- Admin UI primarily \`carepop-web/\`, Backend \`carepop-backend/\`)  
\*   \*\*Goal:\*\* Implement admin reporting features.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* REP-1: Design Data Aggregation Strategy for Reporting (Supabase & Cloud Run) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* REP-2: Build Backend Logic & API for Basic Aggregation & Reporting (Non-Sensitive Data) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* REP-3: Build Backend Logic & API for Aggregating & Anonymizing Sensitive Data Summaries \- \*\*Status:\*\* To Do (Depends on COMPLIANCE-8)  
    \*   \*\*Ticket ID:\*\* REP-4 (Web Admin UI \- \`carepop-web/\`): Implement UI: Reporting Dashboard & Export \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* REP-5: Build Backend API (Cloud Run Function): Report Data Export (CSV/JSON) \- \*\*Status:\*\* To Do

\---

\#\# Epic TRACKING-DATA: Secure Health Tracking Modules (Pill & Menstrual \- UI: Native Mobile & potential Web, Backend \`carepop-backend/\` with App Encryption)  
\*   \*\*Epic Goal:\*\* Implement secure health tracking modules.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* TRK-1: Design & Implement Pill & Menstrual Tracker Database Schemas (Supabase, Highly Sensitive) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRK-2: Implement Backend Cryptography Utility (Cloud Run Function) \- \*\*SEE SEC-E-2\*\*  
    \*   \*\*Ticket ID:\*\* TRK-3: Build Backend API (Cloud Run Function): User Manage Pill Tracker Data (Encrypted) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRK-4: Build Backend API (Cloud Run Function): User Manage Menstrual Tracker Data (Encrypted) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRK-5: Build Backend API (Cloud Run Function): User View Own Tracker Data (Decrypted) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRK-6: Build Backend Logic (Cloud Scheduler \+ Cloud Run): Schedule Tracking Reminders \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRK-7: Build Backend API (Cloud Run Function): Provider View Assigned Patient Tracking Data (Strict Consent Required) \- \*\*Status:\*\* To Do (P3+)  
    \*   \*\*Ticket ID:\*\* TRK-8 (Native Mobile App): Implement UI: Pill Tracker Screens \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* TRK-9 (Native Mobile App): Implement UI: Menstrual Tracker Screens \- \*\*Status:\*\* To Do  
    \*   \*\*(Equivalent Web UI tickets for \`carepop-web/\` if viewing/editing tracker data is planned there) \- Status:\*\* To Do

\---

\#\# Epic AI-HEALTH-ASSESS: AI-Assisted Health Assessment (Initial Scope \- UI: Native Mobile & potential Web, Backend \`carepop-backend/\`)  
\*   \*\*Epic Goal:\*\* Implement low-risk AI health assessment feature.  
\*   \*\*Status:\*\* To Do

    \*   \*\*Ticket ID:\*\* AI-1: Build Backend Service (Cloud Run Function): Integration for AI/NLP Processing \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AI-2: Build Backend API (Cloud Run Function): Process User Assessment Input (Low-Risk Scope) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AI-3 (Native Mobile App): Implement UI: AI Health Assessment Input Screen \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* AI-4 (Native Mobile App): Implement UI: Display AI Health Assessment Results (Low-Risk Scope) \- \*\*Status:\*\* To Do  
    \*   \*\*(Equivalent Web UI tickets for \`carepop-web/\` if AI feature planned there) \- Status:\*\* To Do

\---

\#\# Epic SECURITY-DEEP-DIVE: Comprehensive Technical Security (Backend \`carepop-backend/\` & Infrastructure)  
\*   \*\*Epic Goal:\*\* Implement advanced security measures.  
\*   \*\*Status:\*\* Partially Done (Secrets managed, basic infra, deeper items pending)

    \*   \*\*Ticket ID:\*\* SEC-E-1: Design Application-Level At-Rest Encryption Integration Strategy \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-E-2: Implement Backend Cryptography Utility (AES-256-GCM) (Cloud Run Function) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-S-1: Implement Secure Secrets Management with Google Cloud Secret Manager \- \*\*Status:\*\* Done  
    \*   \*\*Ticket ID:\*\* SEC-A-1: Design & Implement Comprehensive Auditing Strategy \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-A-2: Refine Rate Limiting & Implement Bot Protection (GCP Features) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-TEST-1: Integrate Automated SAST into Backend CI \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-TEST-2: Integrate Automated Dependency Vulnerability Scanning into Backend CI \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-TEST-3: Set Up & Conduct Regular Automated DAST Scans (Backend APIs) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-TEST-4: Schedule & Perform Periodic Manual Penetration Testing (Overall Project) \- \*\*Status:\*\* To Do  
    \*   \*\*Ticket ID:\*\* SEC-OTHER-1: Configure & Review Infrastructure Security Settings (GCP & Supabase) \- \*\*Status:\*\* In Progress (Ongoing)

\---

\#\# Epic ADMIN: Web Admin Portal (P2 \- Post MVP \- \`carepop-web/\`)  
\*   \*\*Epic Goal:\*\* Develop web-based admin portal in \`carepop-web/\`.  
\*   \*\*Status:\*\* To Do

    \*   \*\*(Admin tickets for User Management UI (PROF-5), Provider/Facility UI (DIR-7), Inventory UI (INV-4), Reporting UI (REP-4), etc. belong here and are marked "To Do" in their respective functional epics)\*\*


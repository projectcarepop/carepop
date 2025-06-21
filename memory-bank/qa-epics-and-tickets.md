# ✅ QA Testing Plan: Admin Dashboard Refinement

This document outlines the epics and tickets for the quality assurance testing of the CarePop Admin Dashboard.

---

# EPIC: QA-FUNC - Functionality Testing (CRUD)

- **TICKET: QA-FUNC-001:** Verify Appointment CRUD
  - AC: Create, Read, Update (Confirm/Cancel), and Delete operations for appointments work as expected via the admin UI.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-002:** Verify Clinic CRUD
  - AC: Create, Read, Update, and Delete operations for clinics work as expected.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-003:** Verify Provider CRUD
  - AC: Create, Read, Update, and Delete operations for providers work as expected.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-004:** Verify Service CRUD
  - AC: Create, Read, Update, and Delete operations for services work as expected.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-005:** Verify Service Category CRUD
  - AC: Create, Read, Update, and Delete operations for service categories work as expected.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-006:** Verify Inventory Item CRUD
  - AC: Create, Read, Update, and Delete operations for inventory items work as expected.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-007:** Verify Supplier CRUD
  - AC: Create, Read, Update, and Delete operations for suppliers work as expected.
  - AC: Success/failure toasts are displayed for all actions.
- **TICKET: QA-FUNC-008:** Verify User Role Management
  - AC: Updating a user's role via the admin UI works as expected.
  - AC: Success/failure toasts are displayed for the action.

# EPIC: QA-ACCESS - Role-Based Access Control

- **TICKET: QA-ACCESS-001:** Test Admin Route Protection
  - AC: Non-admin users attempting to access any `/admin/*` route are redirected to a 'forbidden' or 'login' page.
  - AC: Logged-out users are redirected to the login page.
  - AC: Admin users can access all `/admin/*` routes successfully.

# EPIC: QA-UI - Data Display and UI States

- **TICKET: QA-UI-001:** Test Table States
  - AC: All admin tables correctly display loading states while data is being fetched.
  - AC: All admin tables correctly display an empty state message when there is no data to show.
  - AC: All admin tables handle and display data fetching errors gracefully.
- **TICKET: QA-UI-002:** Test Data Integrity
  - AC: Data displayed in tables and detail views accurately reflects the current state of the Supabase database.
  - AC: Pagination and search/filter queries function correctly and display the correct data subsets.

# EPIC: QA-RESP - Responsiveness Testing

- **TICKET: QA-RESP-001:** Test Admin Layout on Mobile
  - AC: The main admin layout, including the sidebar and header, is usable and not misaligned on mobile viewports (e.g., 375px width).
- **TICKET: QA-RESP-002:** Test Table Responsiveness
  - AC: All data tables within the admin dashboard are horizontally scrollable or reflow appropriately on mobile, without causing page overflow.
- **TICKET: QA-RESP-003:** Test Modal and Form Responsiveness
  - AC: All modals (e.g., delete confirmation) and forms (e.g., create/edit pages) are legible and usable on mobile viewports. Buttons and inputs should be easily tappable.

# EPIC: QA-TECH - Code and Dependency Integrity

- **TICKET: QA-TECH-001:** Audit TypeScript Types
  - AC: Perform a spot-check across the `carepop-web/src/app/admin` directory to ensure no new `any` types have been introduced.
  - AC: Confirm component props are properly typed.
- **TICKET: QA-TECH-002:** Audit Animations
  - AC: Check for any excessive or janky animations that might have been added. Ensure UI interactions feel smooth.

# EPIC: QA-REG - Regression Testing

- **TICKET: QA-REG-001:** Full CRUD Regression
  - AC: Re-verify all CRUD actions across all admin sections to ensure no functionality has regressed during the build-fixing process. This serves as a final check.

# EPIC: QA-DEPLOY - Vercel Build & Deployment

- **TICKET: QA-DEPLOY-001:** Final Build Check
  - AC: The application builds successfully one final time before concluding the QA process.
- **TICKET: QA-DEPLOY-002:** Environment Variable Check
  - AC: Confirm that no environment-specific bugs are present. (Note: This will be a conceptual check, as I cannot access Vercel previews directly). 
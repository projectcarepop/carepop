### **Plan: Admin Dashboard Refinement**

Here is the proposed plan to systematically refine the Admin Dashboard, addressing the reported issues with data fetching, CRUD operations, and responsiveness.

### **Epic: ADMIN-REFINEMENT - Admin Dashboard Refinement and Stabilization**

**Description:** This epic covers the systematic review, debugging, and enhancement of the entire `carepop-web` admin dashboard. The goal is to ensure all pages are robust, reliable, and provide a seamless UX for administrators, aligning with project-wide best practices.

**Acceptance Criteria (Overall Epic):**
*   All admin pages reliably fetch and display the correct data from the backend.
*   All CRUD (Create, Read, Update, Delete) operations are fully functional, with immediate and clear UI feedback.
*   All admin pages are fully responsive across desktop, tablet, and mobile viewports.
*   Code adheres to strict TypeScript standards, with no `any` types.
*   UI interactions are enhanced with subtle animations where appropriate.

---

### **Tickets:**

#### **TICKET-ADMIN-REFINEMENT-1: Refine Admin Dashboard Home Page**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** The main admin dashboard page (`/admin`) displays key stats. This ticket involves verifying the data accuracy, ensuring the layout is responsive, and fixing any UI bugs.
*   **Acceptance Criteria:**
    *   Stats for clinics, providers, etc., are fetched correctly from the `GET /api/v1/admin/stats` backend endpoint.
    *   The page layout is responsive and does not break on smaller screens.
    *   Links to other admin sections are correct and functional.
*   **Pillar:** `carepop-web`

#### **TICKET-ADMIN-REFINEMENT-2: Refine Appointments Management**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** Review and fix the Appointments management page (`/admin/appointments`). This page has had issues with data fetching in the past (e.g., missing patient names).
*   **Acceptance Criteria:**
    *   The appointments table correctly fetches and displays all relevant data, including patient names, clinic names, and provider names, without errors. This will likely involve verifying the backend call to `GET /api/v1/admin/appointments` and its associated joins.
    *   Filtering and sorting functionalities work as expected.
    *   CRUD operations (if any, e.g., updating appointment status) are functional and provide user feedback.
    *   The table and its controls are responsive, likely using a horizontal scroll on mobile.
*   **Pillar:** `carepop-web`

#### **TICKET-ADMIN-REFINEMENT-3: Refine Clinics Management**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** Review and fix the Clinics management page (`/admin/clinics`).
*   **Acceptance Criteria:**
    *   The clinics table correctly fetches and displays all clinic data.
    *   Full CRUD functionality (Create, View, Update, Delete) is working flawlessly.
    *   Form submissions to `POST /api/v1/admin/clinics` and `PUT /api/v1/admin/clinics/:id` are correctly handled, with proper data mapping and validation.
    *   The UI provides clear success/error feedback (e.g., using toasts).
    *   The page, including the forms and table, is fully responsive.
*   **Pillar:** `carepop-web`

#### **TICKET-ADMIN-REFINEMENT-4: Refine Providers Management**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** Review and fix the Providers management page (`/admin/providers`).
*   **Acceptance Criteria:**
    *   The providers table correctly fetches and display all provider data.
    *   Full CRUD functionality is working flawlessly.
    *   Provider creation/editing forms correctly handle all fields, including assignments for clinics and services.
    *   Backend API calls for provider management are working correctly.
    *   The page, including forms and tables, is fully responsive.
*   **Pillar:** `carepop-web`

#### **TICKET-ADMIN-REFINEMENT-5: Refine Services Management**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** Review and fix the Services (`/admin/services`) and Service Categories (`/admin/service-categories`) management pages.
*   **Acceptance Criteria:**
    *   Tables for both services and service categories fetch and display data correctly.
    *   Full CRUD functionality for both sections is working flawlessly.
    *   Backend APIs (`/api/v1/admin/services` and `/api/v1/admin/service-categories`) are correctly integrated.
    *   The UI provides clear success/error feedback.
    *   All pages and forms are fully responsive.
*   **Pillar:** `carepop-web`

#### **TICKET-ADMIN-REFINEMENT-6: Refine Users Management**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** Review and fix the Users management page (`/admin/users`). This page has had 500 errors in the past.
*   **Acceptance Criteria:**
    *   The user list fetches and displays correctly. The previous reliance on a `search_users` RPC might need to be re-evaluated in favor of a robust backend API call.
    *   The "View Details" page for a user (`/admin/users/[userId]`) correctly loads all user information.
    *   The ability for an admin to grant roles or perform other actions works as intended.
    *   The page is responsive and error-free.
*   **Pillar:** `carepop-web`

#### **TICKET-ADMIN-REFINEMENT-7: Refine Inventory Management**
*   **Epic:** ADMIN-REFINEMENT
*   **Description:** Review and fix the Inventory management page (`/admin/inventory`).
*   **Acceptance Criteria:**
    *   The inventory items table correctly fetches and displays all data.
    *   Full CRUD functionality for inventory items is working flawlessly.
    *   The UI provides clear success/error feedback.
    *   The page, including forms and table, is fully responsive.
*   **Pillar:** `carepop-web`

--- 
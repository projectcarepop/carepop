# Carepop Inventory Management Feature Plan

## 1. High-Level Summary

The goal of the Inventory Management feature is to provide clinic administrators and managers with a robust, intuitive system to track and manage medical products and supplies on a **per-clinic basis**. This feature is critical for ensuring supplies are available, minimizing waste due to expiration, and maintaining accurate stock levels for operational efficiency.

The current implementation is architecturally flawed on the frontend, primarily due to a lack of clinic context. This plan outlines the work required to refactor the existing UI and build a complete, scalable, and user-friendly inventory management system that aligns with the corrected backend API and database schema.

---

## 2. Core Architecture & UI Vision

The entire feature will be built around a "per-clinic" workflow. The user must first select a clinic, and all subsequent actions (viewing, adding, editing) will apply to that specific clinic.

To support this and future enhancements, the `/inventory` section will have its own dedicated layout, including a vertical sidebar for navigation, similar to the main `/admin` dashboard.

-   **Inventory Layout (`/inventory/layout.tsx`):** A new layout will wrap all inventory pages. It will contain the new Inventory Sidebar.
-   **Inventory Sidebar:** This sidebar will provide navigation *within* the inventory section. Initial links will include "Products" and "Categories". Future links like "Reports" or "Suppliers" can be added here.
-   **Main Content Area:** The primary view will feature a prominent **Clinic Selector** dropdown at the top. Below this, the data table and other UI elements will render, driven by the selected clinic's data.

---

## 3. Epics & Tickets

The work is broken down into three phases (Epics), from Minimum Viable Product to future enhancements.

### Epic 1: Core Inventory MVP

*The focus of this epic is to build the fundamental "per-clinic" workflow and align the UI with the backend.*

---

#### **Ticket INV-01: Create Inventory Layout & Sidebar**

-   **Summary:** Create a new dedicated layout for the `/inventory` route that includes a persistent sidebar for inventory-specific navigation.
-   **Acceptance Criteria:**
    1.  A new `layout.tsx` file is created at `carepop-web/src/app/inventory/layout.tsx`.
    2.  The layout renders a new sidebar component (`<InventorySidebar />`).
    3.  The sidebar is visually consistent with the existing `/admin` sidebar but is distinct.
    4.  The sidebar contains navigation links for "Products" (`/inventory`) and "Categories" (`/inventory/categories`).
    5.  The main content area is rendered to the right of the sidebar.

---

#### **Ticket INV-02: Implement Clinic Selector & Context**

-   **Summary:** Add a dropdown menu to the main inventory page that allows the user to select which clinic's inventory they want to manage.
-   **Acceptance Criteria:**
    1.  A dropdown component is displayed prominently at the top of the `/inventory` page.
    2.  The dropdown is populated with a list of all clinics fetched from the backend API.
    3.  The component's state holds the `id` of the currently selected clinic.
    4.  Selecting a clinic from the dropdown updates this state.
    5.  A loading state is displayed while the clinics are being fetched.

---

#### **Ticket INV-03: Context-Aware Data Fetching & Display**

-   **Summary:** Connect the Clinic Selector to the data table, so that changing the selected clinic triggers a refetch of the inventory data for that specific clinic.
-   **Acceptance Criteria:**
    1.  The `useQuery` hook for fetching inventory data is dependent on the `selectedClinicId`. The query should be disabled if no clinic is selected.
    2.  When the `selectedClinicId` changes, the query is automatically refetched using the correct backend endpoint (`GET /api/admin/clinics/:clinicId/inventory`).
    3.  The data table correctly updates to display the inventory for the selected clinic.
    4.  A loading state is shown on the data table while new inventory data is being fetched.

---

#### **Ticket INV-04: Update Data Table Columns**

-   **Summary:** Ensure the inventory products data table displays all the relevant fields from the corrected schema.
-   **Acceptance Criteria:**
    1.  The data table in `_components/columns.tsx` is updated.
    2.  The table **must** include columns for: `Item Name`, `Category`, `SKU`, `Quantity On Hand`, `Batch No.`, and `Expiry Date`.
    3.  The `Expiry Date` and `Last Updated` columns are formatted for readability (e.g., `MM/DD/YYYY`).

---

#### **Ticket INV-05: Update Add/Edit Product Form**

-   **Summary:** Align the `ProductForm` component with the full schema, including the new fields, and ensure it correctly submits data for the selected clinic.
-   **Acceptance Criteria:**
    1.  The `ProductForm` component includes form fields for `batchNumber` and `expiryDate` (using a calendar picker).
    2.  The Zod schema and `defaultValues` within the form are updated to include these new fields.
    3.  When submitting the form, the `clinicId` of the **currently selected clinic** is included in the payload. The hardcoded clinic ID is removed.
    4.  The form functions correctly for both creating a new item and editing an existing one.

---

### Epic 2: Enhanced Usability & Workflows

*The focus of this epic is to build on the MVP to create a more efficient and powerful user experience.*

---

#### **Ticket INV-06: Dedicated Stock Management UI**

-   **Summary:** Create a streamlined modal for updating only the stock count of an inventory item, which is a frequent task.
-   **Acceptance Criteria:**
    1.  An "Update Stock" option is available in the actions menu for each row in the data table.
    2.  Clicking this option opens a modal that displays the product name.
    3.  The modal contains a single number input for the "New Quantity on Hand".
    4.  Submitting the modal calls the `upsertInventoryItem` endpoint, updating only the `quantityOnHand` for that item.

---

#### **Ticket INV-07: Advanced Table Filtering**

-   **Summary:** Add client-side or server-side filters to help admins quickly find items that require attention.
-   **Acceptance Criteria:**
    1.  A set of filter buttons/dropdowns is added above the data table.
    2.  A filter for "Low Stock" is available, which shows only items where `quantityOnHand` is less than or equal to `reorderLevel`.
    3.  A filter for "Expiring Soon" is available, showing items with an `expiryDate` within the next 60 days.

---

### Epic 3: Reporting & Auditing

*The focus of this epic is on providing long-term value through data history and strategic oversight.*

---

#### **Ticket INV-08: Create Inventory Audit Log**

-   **Summary:** Create a new backend table and API to log every change to inventory quantity for full traceability.
-   **Acceptance Criteria:**
    1.  A new `inventory_logs` table is created in the database schema.
    2.  The table records `inventory_item_id`, `clinic_id`, `user_id` (of the admin), `change_quantity` (e.g., -1, +50), `new_quantity`, `reason` (e.g., "Manual Update", "Sale"), and a `timestamp`.
    3.  All backend functions that modify `quantityOnHand` are updated to also write a corresponding entry to this log table.
    4.  (Optional UI) A new page is created to view the audit trail for a specific item. 
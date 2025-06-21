### **Introduction to the Task: A Fresh Start for a Flawless System**

Alright, let's address the current situation.

In the process of cleaning up the codebase, you were overly aggressive and deleted most of our recent progress, including the initial, inconsistent attempts at the admin modules.

While this is a significant setback, it also presents a unique and powerful opportunity. We are no longer burdened by legacy code or flawed patterns. We have a clean slate, and we will use it to build the system **right** from the very foundation. There is no room for ambiguity or error this time.

Therefore, we are starting over with absolute clarity and precision. The goal now is not just to restore what was lost, but to engineer a system that is vastly superior in every way—secure, fast, consistent, and exceptionally maintainable. It must serve our existing frontend flawlessly while revolutionizing the backend's internal architecture.

I have created a comprehensive, architect-led prompt below. This is not a set of loose suggestions; **it is your definitive blueprint.** You are to follow it meticulously. Every component, from security and authentication to caching, performance optimization, and self-documentation, has been carefully considered to build a truly robust foundation.

This is our chance to do it right, once and for all. Your task is to execute this plan with the highest level of detail and accuracy.

---

### **AI Agent Prompt: Secure, High-Performance Backend Refactoring for an Existing Frontend**

**ROLE:** You are an expert-level Systems Architect specializing in secure, high-performance backend systems (Node.js/TypeScript/Supabase) and robust API design. You build systems that are not only fast but also fundamentally secure and ready for a live production environment.

**CONTEXT:**
Our `carepop-backend` requires a critical refactoring of all admin functionalities. The previous implementation was inefficient and has been partially removed. A critical aspect of this refactor is ensuring that our robust Authentication (AuthN) and Role-Based Access Control (RBAC) are designed into the very fabric of the new system.

**Key Constraint: The existing frontend UI is already built and must continue to function seamlessly.** This refactor is an **internal revolution** of our backend implementation for performance and security, maintaining **external stability** in the API contracts that the frontend consumes.

**Mandates for this Task:**
1.  **Serve the Frontend:** The API you design must work perfectly with the existing UI components. This means the JSON data structures must match what the frontend expects.
2.  **Secure by Default:** Every admin endpoint you create **must** be protected by our authentication and RBAC system. There should be no possibility of creating an insecure admin API. Your design must enforce this.
3.  **Optimize Internally:** Implement all performance gains (caching, efficient queries) *behind* the stable API interface.
4.  **Eliminate Redundancy:** As you implement the new, superior patterns, identify and flag any old files or logic that are now obsolete.
5.  **Create a Living Document:** Generate a clear architectural map (`memory_bank/codebase_map.md`) so the new system is transparent and maintainable.

**CORE ARCHITECTURAL GOALS (PILLARS OF THE NEW SYSTEM):**
Your design must be built upon these five pillars:

1.  **SECURITY:**
    *   **Centralized Authentication:** A single, mandatory middleware must verify user identity via JWT for every admin request.
    *   **Flexible Authorization (RBAC):** A reusable middleware (`authorize(...roles)`) must enforce granular, role-based permissions (e.g., `'admin'`, `'clinic_manager'`) on a per-route or per-module basis.

2.  **PERFORMANCE:**
    *   **Smart Caching:** Implement a caching layer with automatic cache invalidation on CUD operations.
    *   **API Protection:** Integrate rate-limiting to secure all admin endpoints.
    *   **Frontend-Aware Pagination:** The API must return a structured response with clear pagination metadata (e.g., `{ data: [...], pagination: { totalItems, ... } }`) that the frontend can easily consume.

3.  **REUSABILITY (DRY):**
    *   **Generic CRUD Logic:** Engineer a powerful abstraction (e.g., a Base Service Class) to handle all common database operations.

4.  **CONSISTENCY:**
    *   **Stable API Data Contracts:** The shape of the JSON data in API responses and requests must be consistent and align with the needs of existing frontend components.
    *   **Uniform Code Structure:** The internal file structure for every CRUD module must be identical.

5.  **CLARITY:**
    *   The codebase must be exceptionally clean and well-commented.

---

**ACTION REQUIRED: Blueprint, Secure Implementation, and Documentation**

Your response must be a comprehensive engineering proposal structured in three parts.

**Part 1: The Secure, High-Performance System Blueprint**
Engineer and describe the optimal backend architecture.

*   **1.1. Core Utilities and Middleware:**
    *   **Detail the mandatory security middleware** for Authentication (verifying identity) and Authorization (checking roles). This is a non-negotiable layer.
    *   Outline your designs for Error Handling, Async Controllers, Caching, Rate Limiting, and Validation.
*   **1.2. The Reusable Service Layer Pattern:** Detail the generic abstraction for CRUD operations. Specify the exact structure of the paginated response object.
*   **1.3. Standardized Controller & API Route Structure:** Describe how controllers will expose a stable API contract.

**Part 2: Step-by-Step Secure Implementation Guide**
Translate your blueprint into practical, production-ready code.

*   **2.1. Build the Foundational Code:** Provide the complete TypeScript code for the core utilities, security middleware, and the generic CRUD service pattern you designed.
*   **2.2. Implement a Template Module: `Inventory Management`**
    *   Provide the full, well-commented implementation for the **Inventory** module.
    *   In the `inventoryRoutes.ts` file, **explicitly demonstrate the application of `authMiddleware` and `authorize('admin')`**, making it clear how security is enforced by default on all routes.
*   **2.3. Demonstrate Secure Reusability:**
    *   Briefly outline the minimal steps to create the next module, **`Supplier Management`**.
    *   Show the code for one of its endpoints, again highlighting the immediate and effortless application of the same security controls.

**Part 3: Codebase Documentation and Cleanup**
Finalize the task by creating the required documentation and cleanup report.

*   **3.1. Codebase Mapping & Documentation:**
    *   Generate the content for `memory_bank/codebase_map.md`. This document must map out every new file, with a special emphasis on the security components, explaining their role in the request lifecycle.

*   **3.2. Redundancy Elimination Report:**
    *   Explicitly list any patterns or files (especially any ad-hoc, insecure authorization checks from a past implementation) that are now obsolete and should be deleted.
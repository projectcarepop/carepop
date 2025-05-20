# Epics & Tickets: CarePop/QueerCare

## Epic Template

```markdown
### EPIC-[ID]: [Epic Title]

**Description:** [Brief description of the epic and its overall goal.]
**Business Value:** [Why is this epic important? What value does it deliver?]
**Acceptance Criteria (Overall Epic):**
*   [High-level AC 1]
*   [High-level AC 2]

**Tickets:**
*   TICKET-[ID+1]: [Ticket Title]
*   TICKET-[ID+2]: [Ticket Title]
```

## Ticket Template

```markdown
#### TICKET-[ID]: [Ticket Title]

**Epic:** EPIC-[ID]
**Description:** [Detailed description of the task.]
**Acceptance Criteria (AC):**
*   [Specific AC 1 for this ticket]
*   [Specific AC 2 for this ticket]
*   ...
**Technical Suggestions/Notes:**
*   [e.g., Relevant files, libraries to use, API endpoints, RLS policies to consider]
*   [Security Considerations: e.g., Data sensitivity, encryption needs]
*   [Pillar: `carepop-mobile` | `carepop-web` | `carepop-backend` | `all`]
**Estimated Effort:** [e.g., S, M, L, XL or Story Points]
**Priority:** [High, Medium, Low]
**Status:** To Do (initial status)
```

## Placeholder Epics & Tickets

### EPIC-001: Foundational Setup & User Authentication

**Description:** Establish the basic project structure, core authentication flow, and initial user profile management for all three pillars.
**Business Value:** Enables users to securely access the platform, which is fundamental for all other features.
**Acceptance Criteria (Overall Epic):**
*   Users can register, login, and logout on both mobile and web platforms.
*   Basic user profile data is created and can be viewed (initially).
*   Secure session management is in place.

**Tickets:**
*   TICKET-001: Initialize Project Repositories & CI/CD Pipelines
*   TICKET-002: Implement User Registration (Mobile)
*   TICKET-003: Implement User Login (Mobile)
*   TICKET-004: Implement User Registration (Web)
*   TICKET-005: Implement User Login (Web)
*   TICKET-006: Setup Supabase Auth & `profiles` Table with RLS
*   TICKET-007: Backend: Create `handle_new_user` trigger for profile creation
*   TICKET-008: Basic Profile Viewing Screen (Mobile)
*   TICKET-009: Basic Profile Viewing Page (Web)

### EPIC-LEGAL: Legal Pages & Compliance Documentation

**Description:** Implement and display necessary legal documents like Terms of Service and Privacy Policy.
**Business Value:** Ensures legal compliance and informs users about their rights and responsibilities.
**Acceptance Criteria (Overall Epic):**
*   Terms of Service page is accessible on the web platform.
*   Privacy Policy page is accessible on the web platform.
*   Content is accurate and up-to-date as per provided documents.

**Tickets:**
*   TICKET-LEGAL-W-1: Create Terms of Service Page (Web)
*   TICKET-LEGAL-W-2: Create Privacy Policy Page (Web)

### EPIC-WEB-PROFILE: Web User Profile Management

**Description:** Encompasses all features related to creating, viewing, and editing user profiles on the `carepop-web` application.
**Business Value:** Allows users to manage their personal information, which is essential for personalized services and application functionality.
**Acceptance Criteria (Overall Epic):**
*   Users can create a complete profile on the web.
*   Users can view their profile information accurately.
*   Users can edit their existing profile information.
*   Profile data is handled securely and consistently with the backend.

**Tickets:**
*   TICKET-WEB-PROF-1: Implement Create/Edit Profile Page (Web)

---

#### TICKET-WEB-PROF-1: Implement Create/Edit Profile Page (Web)

**Epic:** EPIC-WEB-PROFILE
**Description:** Develop the user interface and functionality for users to create and subsequently edit their profiles on the `carepop-web` application. This page should handle both new profile creation and updates to existing profiles.
**Acceptance Criteria (AC):**
*   Users can access a dedicated page for profile creation/editing (e.g., `/create-profile`).
*   Form includes fields for all required and optional profile information (e.g., first name, last name, DOB, contact, address, SOGIE-related fields, civil status).
*   Address fields (`provinceCode`, `cityMunicipalityCode`, `barangayCode`) are currently implemented as text inputs.
*   Fields like `civilStatus`, `pronouns`, `assignedSexAtBirth` use `Select` components.
*   Form data is correctly mapped (e.g., to `snake_case`) for submission to the backend.
*   Successful submission updates the user's profile in Supabase.
*   Appropriate user feedback is provided on submission success or failure.
*   Page correctly pre-fills with existing profile data if the user is editing.
**Technical Suggestions/Notes:**
*   Leverages `AuthContext` for user session and profile data.
*   Interacts with backend services for profile data submission.
*   Consider future enhancement to reinstate dynamic/dependent dropdowns for address fields.
*   Pillar: `carepop-web`
**Estimated Effort:** M (initial implementation done, further refinements/testing)
**Priority:** High
**Status:** In Progress

---

### EPIC-WEB-DASH: Web User Dashboard

**Description:** Features related to the main user dashboard on the `carepop-web` application, providing users with an overview and access to key functionalities.
**Business Value:** Serves as the user's landing page after login, offering personalized information and quick access to platform features.
**Acceptance Criteria (Overall Epic):**
*   Users can view a summary of their key profile information.
*   Users are prompted to complete their profile if necessary.
*   Users have clear navigation to other parts of the application.

**Tickets:**
*   TICKET-WEB-DASH-1: Implement Dashboard Profile Display & Prompts (Web)

---

#### TICKET-WEB-DASH-1: Implement Dashboard Profile Display & Prompts (Web)

**Epic:** EPIC-WEB-DASH
**Description:** Enhance the user dashboard page (`/dashboard`) to display key user profile information and provide prompts/links for profile completion or editing.
**Acceptance Criteria (AC):**
*   Dashboard displays user's first name in a welcome message.
*   Dashboard displays detailed profile information (e.g., full name, DOB, pronouns, SOGIE).
*   If essential profile information (e.g., first name, last name, DOB) is missing, a prominent callout prompts the user to complete their profile, linking to `/create-profile`.
*   An "Edit Profile" button is present, linking to `/create-profile`.
*   Page handles loading states gracefully.
*   Page displays correctly for authenticated users.
**Technical Suggestions/Notes:**
*   Fetches profile data from `AuthContext`.
*   Uses `camelCase` fields from `AuthContext.Profile` for display.
*   Pillar: `carepop-web`
**Estimated Effort:** S (initial implementation done, further refinements/testing)
**Priority:** High
**Status:** In Progress

---

*This file will be populated with detailed epics and tickets as the project progresses.*


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

---

*This file will be populated with detailed epics and tickets as the project progresses.*


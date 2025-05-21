# Task Tracker: CarePop/QueerCare

## How to Use

*   This file tracks the status of tickets defined in `epics_and_tickets.md`.
*   Update the status of a ticket here when work starts, is blocked, or is completed.
*   Add brief notes for context if necessary.

## Ticket Status Key

*   **To Do:** Not yet started.
*   **In Progress:** Actively being worked on.
*   **Done:** Completed and meets all Acceptance Criteria.
*   **Blocked:** Cannot proceed due to a dependency or issue.
*   **Obsolete:** No longer relevant or will not be implemented.

## Tracked Tickets

| Epic        | Ticket ID        | Ticket Title                                                | Status      | Assignee | Notes                                                                 |
|-------------|------------------|-------------------------------------------------------------|-------------|----------|-----------------------------------------------------------------------|
| EPIC-001    | TICKET-001       | Initialize Project Repositories & CI/CD Pipelines         | To Do       |          |                                                                       |
| EPIC-001    | TICKET-002       | Implement User Registration (Mobile)                      | Done        | Czar     | Native app functionality complete                                     |
| EPIC-001    | TICKET-003       | Implement User Login (Mobile)                             | Done        | Czar     | Native app functionality complete                                     |
| EPIC-001    | TICKET-004       | Implement User Registration (Web)                       | In Progress | Czar     | Relies on AuthContext.tsx; redirect loop fixed. Ready for full E2E testing.        |
| EPIC-001    | TICKET-005       | Implement User Login (Web)                              | In Progress | Czar     | Relies on AuthContext.tsx; redirect loop fixed, password toggle added. Ready for full E2E testing. |
| EPIC-001    | TICKET-006       | Setup Supabase Auth & `profiles` Table with RLS           | Done        | Czar     | Core Supabase setup for auth and profiles assumed complete            |
| EPIC-001    | TICKET-007       | Backend: Create `handle_new_user` trigger for profile creation | Done        | Czar     | Deployed and functional                                               |
| EPIC-001    | TICKET-008       | Basic Profile Viewing Screen (Mobile)                     | Done        | Czar     | Native app functionality complete                                     |
| EPIC-001    | TICKET-009       | Basic Profile Viewing Page (Web)                          | In Progress | Czar     | Covered by TICKET-WEB-DASH-1                                          |
| EPIC-LEGAL  | TICKET-LEGAL-W-1 | Create Terms of Service Page (Web)                    | To Do       | Czar     | Placeholder, focus shifted                                            |
| EPIC-LEGAL  | TICKET-LEGAL-W-2 | Create Privacy Policy Page (Web)                      | To Do       | Czar     | Placeholder, focus shifted                                            |
| EPIC-WEB-PROFILE | TICKET-WEB-PROF-1 | Implement Create/Edit Profile Page (Web)                | In Progress | Czar     | Submit button fixed. Address fields now use Combobox. Backend PATCH fixed. Theme hover color updated. Ready for E2E testing. |
| EPIC-WEB-DASH    | TICKET-WEB-DASH-1 | Implement Dashboard Profile Display & Prompts (Web)     | In Progress | Czar     | Displays full address names (not codes). Backend PATCH fixed. Theme hover color updated. Ready for E2E testing. |

---

*This table will expand as more tickets are added to `epics_and_tickets.md`.*
# Technology Context: CarePoP/QueerCare

## 1. Core Technologies

*   **Frontend Framework:** React Native (using CLI)
*   **Frontend Language:** TypeScript
*   **Backend Language:** Node.js (with TypeScript)
*   **Backend Hosting (Custom Logic):** Google Cloud Run
*   **Database / BaaS:** Supabase (providing PostgreSQL, Authentication, RLS, Storage, Edge Functions)

## 2. Frontend Stack Details

*   **React Native CLI:** Chosen for flexibility and native module access.
*   **TypeScript:** Enforced for type safety and maintainability.
*   **State Management:** Redux Toolkit (Recommended).
*   **Navigation:** React Navigation (or similar).
*   **UI Library:** To be selected (e.g., React Native Paper), customized for project design.
*   **Web Rendering:** Requires SSR/SSG solution (e.g., integrated Next.js) for public-facing pages needing SEO.
*   **Key Libraries:** Supabase JS SDK (for interacting with Supabase), potentially form handling libraries, mapping libraries (React Native Maps).

## 3. Backend Stack Details

*   **Supabase:**
    *   PostgreSQL Database (Managed)
    *   Supabase Authentication (Handles user identity, JWTs)
    *   Supabase Row Level Security (RLS - Core for data access control)
    *   Supabase Storage (For files)
    *   Supabase Edge Functions (Potential for simple, data-proximate logic)
    *   Supabase SDK (Used by frontend and backend Cloud Run services)
*   **Google Cloud Platform (GCP):**
    *   **Cloud Run:** Hosts Node.js/TypeScript backend services/functions for custom logic, integrations, sensitive processing, background jobs.
    *   **Cloud Secret Manager:** Securely stores all API keys, database credentials, application encryption keys.
    *   **Cloud Logging:** Centralized logging sink for Cloud Run and potentially Supabase logs.
    *   **Cloud Monitoring:** Platform monitoring and alerting.
    *   **Cloud Scheduler:** Triggers background tasks hosted on Cloud Run.
    *   **(Future):** Cloud SQL (potential for backups), Cloud Storage (backups), Cloud CDN, Cloud Load Balancer.
*   **Node.js/TypeScript (on Cloud Run):**
    *   Minimal framework likely (Express/Fastify optional).
    *   Uses Supabase JS SDK to interact with Supabase.
    *   Uses Node.js `crypto` module for application-level AES-256-GCM encryption/decryption.
    *   Uses validation libraries (e.g., Joi, validator.js).
    *   Uses logging libraries (e.g., Winston, Pino) configured for Cloud Logging.

## 4. Development Setup & Tooling

*   **Source Control:** Git (GitHub/GitLab repositories for frontend and backend).
*   **Package Management:** npm or yarn.
*   **CI/CD:** To be configured (e.g., GitHub Actions, GitLab CI) to build, test, and deploy frontend artifacts and backend Cloud Run services/Supabase Functions.
*   **Testing:** Frameworks needed (e.g., Jest, React Native Testing Library for frontend; Jest/Mocha for backend).
*   **Local Development:** Scripts required to run frontend (web/mobile dev servers) and backend (Node.js server simulating Cloud Run).
*   **Debugging:** Flipper, Reactotron (Frontend); Standard Node.js debugging tools, Cloud Logging/Monitoring (Backend).

## 5. Key Third-Party Services (Requires Vetting)

*   **Supabase:** (Core platform dependency)
*   **Google Cloud Platform:** (Core infrastructure dependency)
*   **Google Maps Platform:** (Mapping and Geocoding)
*   **Notification Provider:** (TBD - e.g., Twilio, AWS SNS/FCM)
*   **AI/NLP Service:** (TBD - e.g., AWS Comprehend Medical)
*   **Payment Gateway:** (TBD - if needed)

*Vetting Criteria:* Security posture, reliability, cost, and critically, compliance support (DPA guarantees, HIPAA BAA availability).

## 6. Technical Constraints & Considerations

*   **Compliance:** Strict adherence to Philippines DPA is mandatory. HIPAA compliance is a strategic goal.
*   **Security:** High priority due to sensitive health data (SPI/PHI). Requires robust implementation of encryption, access control (RLS + backend checks), secure coding, etc.
*   **Cross-Platform Consistency:** Achieving identical UX/features across web and mobile requires careful design and testing.
*   **Performance:** Needs proactive optimization (frontend rendering, backend query/RLS performance).
*   **Scalability:** Leverage managed services (Supabase, Cloud Run) but requires monitoring and appropriate configuration.
*   **SEO:** Public web pages must be discoverable, mandating SSR/SSG. 
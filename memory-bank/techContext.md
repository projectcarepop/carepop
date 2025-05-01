# Technology Context: CarePoP/QueerCare

## 1. Core Technologies

*   **Frontend Framework:** React Native (using CLI)
*   **Frontend Language:** TypeScript
*   **Backend Language:** Node.js (with TypeScript)
*   **Backend Hosting (Custom Logic):** Google Cloud Run
*   **Database / BaaS:** Supabase (providing PostgreSQL, Authentication, RLS, Storage, Edge Functions)

## 2. Frontend Stack Details

*   **Monorepo:** Project uses a monorepo structure (e.g., Turborepo with pnpm) with `apps` and `packages` directories.
*   **Native App Framework (`apps/native`):** React Native CLI (Chosen for flexibility and native module access).
*   **Web App Framework (`apps/web`):** Next.js (Chosen for SSR/SSG, efficient web development).
*   **Language:** TypeScript (Enforced across all packages/apps).
*   **Styling:** NativeWind using Tailwind CSS (Shared config in `packages/config`, `className` prop used in shared components).
*   **Shared UI (`packages/ui`):** Components built with React Native primitives, styled with NativeWind, designed for cross-platform use.
*   **State Management (`packages/store`):** Redux Toolkit (Recommended).
*   **Native Navigation (`apps/native`):** React Navigation.
*   **Web Routing (`apps/web`):** Next.js Router (App or Pages).
*   **Key Libraries:** Supabase JS SDK, React Navigation, React Native Web (configured in `apps/web`).
*   **Shared Types (`packages/types`):** Centralized TypeScript definitions.

## 3. Backend Stack Details

*   **Supabase:**
    *   PostgreSQL Database (Managed)
    *   Supabase Authentication (Handles user identity, JWTs)
    *   Supabase Row Level Security (RLS - Core for data access control)
    *   Supabase Storage (For files)
    *   Supabase Edge Functions (Potential for simple, data-proximate logic)
    *   Supabase SDK (Used by frontend and backend Cloud Run services - **Backend uses separate `anon` and `service_role` clients initialized in `supabaseClient.ts`**)
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

*   **Source Control:** Git (GitHub/GitLab repositories).
*   **Monorepo Management:** Turborepo (or chosen tool like Nx, Lerna).
*   **Package Management:** pnpm (or chosen tool like npm/yarn with workspaces).
*   **CI/CD:** GitHub Actions for backend deployment to Cloud Run staging. Frontend deployment strategy TBD (Vercel for web, App Store/Play Store for native).
*   **Testing:** Jest selected for both backend (with `ts-jest`), frontend (`react-native-testing-library` for native, potentially `@testing-library/react` for web-specific parts), and shared packages.
*   **Local Development:** Monorepo scripts (`dev`, `build`, `lint`) managed by Turborepo/package manager. Requires running native emulator/device, web browser, and backend simulator.
*   **Debugging:** Flipper, Reactotron (Native); Next.js/React DevTools (Web); Standard Node.js debugging tools, Cloud Logging/Monitoring (Backend).
*   **Secrets:** GCP Secret Manager for cloud credentials, `.env` files within specific apps/packages for local development as needed.

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
*   **Cross-Platform Consistency:** Core goal achieved via shared `packages/ui` styled with NativeWind. Requires careful component design and testing.
*   **Performance:** Needs proactive optimization (native rendering, web vitals, backend query/RLS performance).
*   **Scalability:** Leverage managed services (Supabase, Cloud Run) but requires monitoring and appropriate configuration.
*   **SEO:** Public web pages (Landing Pages, Directory in `apps/web`) must be discoverable, achieved via Next.js SSR/SSG. 
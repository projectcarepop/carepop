# Tech Context: CarePop/QueerCare

## 1. Core Technologies

*   **Frontend - Mobile (`carepop-mobile`):**
    *   [Placeholder: e.g., React Native, Expo, TypeScript]
*   **Frontend - Web (`carepop-web`):**
    *   [Placeholder: e.g., Next.js, React, TypeScript, Tailwind CSS, Shadcn UI]
*   **Backend (`carepop-backend`):**
    *   [Placeholder: e.g., Node.js, TypeScript, Express.js (or other framework), Supabase (PostgreSQL, Auth, Storage)]
*   **Cloud Provider:**
    *   [Placeholder: e.g., Google Cloud Platform (Cloud Run, Secret Manager)]

## 2. Key Libraries & Frameworks (per pillar)

*   `carepop-mobile`:
    *   **UI/Navigation:** React Navigation
    *   **State Management:** React Context API (Zustand or Redux Toolkit if needed)
    *   **HTTP Client:** Axios or built-in fetch
*   `carepop-web`:
    *   **State Management:** React Context API, React Query/SWR for server state.
    *   **Form Handling:** `react-hook-form` and `zod` for validation.
    *   **URL State:** `nuqs` for managing state in URL search parameters.
*   `carepop-backend`:
    *   **Core:** `@supabase/supabase-js` client.
    *   **Validation:** `zod` for validating API request bodies.
    *   **Encryption:** Node.js built-in `crypto` module.

## 3. Development Setup & Tooling

*   **Version Control:** Git, GitHub
*   **Package Managers:** [Placeholder: e.g., npm, yarn, pnpm (specify per pillar if different)]
*   **Linters & Formatters:** [Placeholder: e.g., ESLint, Prettier]
*   **Testing:** [Placeholder: e.g., Jest, React Testing Library, Cypress, Detox (specify per pillar)]

## 4. Technical Constraints & Considerations

*   [Placeholder: e.g., Offline support requirements for mobile, browser compatibility for web, API rate limits.]

## 5. Deployment

*   `carepop-mobile`: [Placeholder: e.g., EAS Build/Submit, TestFlight, Google Play Console]
*   `carepop-web`: [Placeholder: e.g., Vercel, Netlify, GCP App Engine]
*   `carepop-backend`: [Placeholder: e.g., GCP Cloud Run, Docker]
*   **CI/CD:** [Placeholder: e.g., GitHub Actions]

## 4. Backend Stack Details (`carepop-backend/`)

*   Primary BaaS: Supabase  
    *   Database: Managed PostgreSQL. Schema defined via SQL migrations (`carepop-backend/supabase/migrations/`).  
    *   Authentication: Supabase Auth service (identity, JWTs, password management, email confirmations, potentially OAuth). Clients interact directly via SDK for core auth.  
    *   Authorization: 
        *   **Row Level Security (RLS):** Supabase RLS is the primary data access control mechanism enforced at the database level, typically based on `auth.uid()` and user roles.
        *   **User Roles Management:** User roles are managed in the `public.user_roles` table.
            *   Schema: `user_id UUID` (Foreign Key to `auth.users.id`), `role TEXT`.
            *   This table links users from `auth.users` to specific roles (e.g., 'admin', 'user', 'provider').
            *   RLS policies often reference this table to determine a user's permissions.
    *   Triggers/Functions: Supabase Database Functions (PL/pgSQL) and Triggers used for automated database operations (e.g., `handle_new_user` profile creation). Supabase Edge Functions (Deno/TypeScript) used for utility/helper functions (e.g., `geocode-address` using Nominatim).
    *   Storage: Supabase Storage for file uploads, secured by Storage policies.  
    *   SDK: Supabase JS SDK (`@supabase/supabase-js`) used by clients and Cloud Run services.
        *   **`public-client.ts`:** Located at `carepop-backend/src/lib/supabase/public-client.ts`, this file initializes the client using the public `anon` key. It is used for operations that can be performed by an anonymous user or for validating a user's token. It is subject to all RLS policies.
        *   **`service-client.ts`:** Located at `carepop-backend/src/lib/supabase/service-client.ts`, this file initializes a privileged client using the `SUPABASE_SERVICE_ROLE_KEY`. This client bypasses all RLS and is used ONLY within secure Cloud Run functions after a user's identity has been verified.

*   Custom Logic Host: Google Cloud Platform (GCP) - Cloud Run  
    *   Runtime: Node.js (with TypeScript). Containerized applications/services.  
    *   Purpose: Executes custom backend logic not handled by direct Supabase interactions or triggers. Key uses include:  
        *   Implementing complex RESTful APIs serving both native and web clients (e.g., Clinic Directory Search API).  
        *   Performing application-level data encryption/decryption using custom keys before/after Supabase storage.  
        *   Executing logic requiring elevated `service_role` access to Supabase (after strict application-level authorization checks).  
        *   Integrating with third-party services (AI/NLP, Payment Gateways, etc.).  
        *   Running background jobs triggered by Cloud Scheduler.  
        *   Handling specific administrative API functions.  
    *   Framework: Minimal framework preferred (e.g., standard Node.js `http` module, optionally Express/Fastify for structure if needed).

*   Supporting GCP Services:  
    *   Cloud Secret Manager: Stores ALL sensitive credentials (Supabase `service_role` key, Application Encryption Keys, 3rd party API keys). Accessed securely by Cloud Run services via IAM.  
    *   Cloud Logging: Centralized logging sink for all Cloud Run service logs.  
    *   Cloud Monitoring: Application/infrastructure monitoring and alerting for Cloud Run and potentially Supabase metrics (via integrations).  
    *   Cloud Scheduler: Triggers scheduled Cloud Run jobs (reminders, retention, reporting).  
    *   (Future): Google Cloud Storage (backups), Artifact Registry (container images), Cloud Build (CI/CD), Cloud Load Balancer/CDN.

*   Backend Libraries:
    *   `express`: The core web server framework for the Cloud Run service.
    *   `@supabase/supabase-js`: For all interactions with the Supabase backend.
    *   `zod`: For all API request body and parameter validation.
    *   `cors`, `helmet`, `morgan`: Standard Express middleware for security and logging.
    *   `node-cache`: For simple in-memory caching (e.g., PSGC data).
    *   Node.js `crypto`: The built-in module used for the application-level encryption service.
    *   Logging library (e.g., `winston` or `pino`): To be configured for structured JSON logging compatible with Google Cloud Logging.

*   Third-Party Services (Integrated via Backend):
    *   Nominatim (OpenStreetMap): Used for geocoding textual addresses to latitude/longitude coordinates via the `geocode-address` Supabase Edge Function.

## 5. Development Setup & Tooling (Revised)

*   Project Structure: Independent development within the three top-level directories (`carepop-backend/`, `carepop-nativeapp/`, `carepop-web/`).  
*   Version Control: Git / GitHub. History reset via force push on TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW.  
*   Package Management: `npm` used independently within each project (`npm install`, `package.json`, `package-lock.json`). No root monorepo management.  
*   Local Development: Requires running `npm install` and the appropriate `dev` or `start` script within each respective project directory.  
*   Linters/Formatters: Independent ESLint, Prettier, TypeScript config (`eslintrc.js`, `tsconfig.json`, `.prettierrc`) within each project.  
*   Environment Variables: Handled via `.env` files (not committed) within each project directory, loaded appropriately (e.g., `dotenv` for local Node.js, Expo's `.env` handling, Next.js's `.env.local` handling). Production secrets loaded from Cloud Secret Manager by Cloud Run.
    *   **`SUPABASE_URL`**: The public URL for the Supabase project. Required by all services.
    *   **`SUPABASE_ANON_KEY`**: The public, anonymous key for the Supabase project. Required by all services.
    *   **`SUPABASE_SERVICE_ROLE_KEY`**: The privileged service role key. This is a highly sensitive secret and is **required** by the `carepop-backend` service to perform administrative actions and bypass RLS. It must be configured in the production environment (e.g., Google Secret Manager).

## 6. CI/CD & Deployment

*   Independent pipelines for each project, likely triggered by path changes:  
    *   `carepop-nativeapp/`: EAS Build (triggered by CI/CD) -> EAS Submit.  
    *   `carepop-web/`: CI/CD builds Next.js app -> Deploys to Vercel/Netlify/GCP hosting.  
    *   `carepop-backend/`: CI/CD builds Docker image -> Pushes to Artifact Registry -> Deploys new revision to Cloud Run.  
*   Platforms: GitHub Actions, GitLab CI, Jenkins, Google Cloud Build.

## 7. Key Technical Decisions & Trade-offs (Summary)

*   Three Separate Projects: Simplifies build/dev for each platform, avoids monorepo/RNW complexity. Requires explicit API contracts and separate UI development.  
*   Direct Client-Supabase Auth: Faster auth flow, simpler backend for core auth. Relies on client security and DB trigger reliability.  
*   Supabase + Cloud Run: Balances BaaS speed/features (DB, Auth, RLS) with custom logic flexibility (Cloud Run for complex tasks, encryption, secure `service_role` usage, scheduled jobs). Requires managing two cloud platforms.  
*   Expo (Managed Workflow) for Native: Simplifies native builds/deployment. Relies on Expo SDK/EAS capabilities.  
*   Next.js/Tailwind/Shadcn UI for Web: Optimizes for web performance, SEO, DX, and modern aesthetics. No UI code sharing with native.  
*   TypeScript Everywhere: Improves code quality and maintainability.  
*   NPM Per Project: Simple dependency management. No automatic cross-project linking (must rely on published packages or manual linking if extensive sharing between *backend* and *web* becomes needed later, but currently avoided).

## 8. Technical Constraints & Considerations

*   Compliance: DPA (Mandatory), HIPAA (Goal). Must be designed into Supabase RLS, Cloud Run logic, encryption strategy, etc.  
*   Security: High priority. Requires layered security across Supabase, Cloud Run, GCP, and client applications. Application-level encryption and careful `service_role` key handling are critical.  
*   User Experience: Native app optimized for mobile use cases; Web app optimized for desktop/browser access, public info, and admin tasks. Maintain brand consistency.  
*   Performance: Optimize Supabase queries/RLS, Cloud Run function performance, native app startup/rendering, and web app Core Web Vitals/SSR/SSG.  
*   Scalability: Rely on Supabase, Cloud Run, and web host scaling capabilities.  
*   SEO: Handled primarily by the `carepop-web` (Next.js) application.

---
**END OF DOCUMENT**  

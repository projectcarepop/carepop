# Technical Context: CarePop/QueerCare

## 1. Core Technologies

-   **Backend-as-a-Service (BaaS):** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
-   **Custom Backend Logic:** Node.js, TypeScript, Express.js (or similar lightweight framework) on Google Cloud Run (Serverless Containers).
-   **Native Mobile Application (`carepop-nativeapp/`):** React Native, Expo (Managed Workflow), TypeScript.
-   **Web Application (`carepop-web/`):** Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI.
-   **Version Control:** Git, GitHub.
-   **Package Management:** npm (expected to be used within each project: `carepop-backend/`, `carepop-nativeapp/`, `carepop-web/`).

## 2. Frontend Stack Details

### A. Native Mobile Application (`carepop-nativeapp/`)
    *   **Framework/Platform:** React Native with Expo (Managed Workflow).
    *   **Language:** TypeScript.
    *   **Navigation:** React Navigation.
    *   **UI Components:** Core React Native components, custom components built with React Native primitives, styled with `StyleSheet`. UI components from the *old* `packages/ui` are now integrated directly into this project (e.g., in `carepop-nativeapp/src/components/`).
    *   **State Management:** React Context API initially; consider Redux Toolkit or Zustand for complex global state.
    *   **API Interaction:** `fetch` API or `axios`.
    *   **Build/Deployment:** EAS Build & Submit (Expo Application Services).
    *   **Location:** Top-level folder `carepop-nativeapp/` in the main Git repository.

### B. Web Application (`carepop-web/`)
    *   **Framework:** Next.js (App Router).
    *   **Language:** TypeScript.
    *   **Styling:** Tailwind CSS.
    *   **UI Components:** Shadcn UI (built on Tailwind CSS and Radix UI), custom React components.
    *   **State Management:** React Context API, React Query/SWR for server state; consider Zustand or Redux Toolkit for complex client-side global state.
    *   **API Interaction:** Next.js data fetching methods, `fetch` API, React Query/SWR.
    *   **Build/Deployment:** Vercel, Netlify, or other Next.js compatible hosting.
    *   **Location:** Top-level folder `carepop-web/` in the main Git repository.

### C. Obsolete Frontend Structures

*   **`carepop-frontend` Monorepo:** The previous pnpm/Turborepo monorepo located at `carepop-frontend/` is now **DEPRECATED**. Its constituent parts have been handled as follows:
    *   `apps/nativeapp/`: Codebase migrated to the new top-level `carepop-nativeapp/`.
    *   `apps/web/` (Next.js with React Native for Web): This application is **DEPRECATED** and superseded by the new `carepop-web/` Next.js project.
    *   `packages/ui/`: Native UI components from this package are now integrated directly within `carepop-nativeapp/`. The shared package itself is **DEPRECATED**.
    *   `packages/eslint-config/`, `packages/typescript-config/`: These shared configurations are **DEPRECATED**. Each top-level project (`carepop-backend`, `carepop-nativeapp`, `carepop-web`) will manage its own linting and TypeScript configurations.
*   **Standalone `carepop-web-nextjs` project:** The code from this temporary project (used to initialize the Next.js app) has been migrated into the top-level `carepop-web/` folder. The temporary standalone project is no longer needed.

## 3. Backend Stack Details (`carepop-backend/`)

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

## 4. Development Setup & Tooling (Revised)

-   **Project Structure:** Three top-level directories in the main Git repository: `carepop-backend/`, `carepop-nativeapp/`, `carepop-web/`.
-   **Version Control:** Git, with a central repository on GitHub (`https://github.com/projectcarepop/carepop.git`). The `main` branch history will be reset (force-pushed) to reflect this new structure.
-   **Package Management:** Each of the three projects will use its own `package.json` and manage dependencies with `npm` (or `yarn`/`pnpm` if preferred *within* that specific project directory).
-   **No Root-Level Monorepo Tooling (Currently):** Tools like Turborepo or pnpm workspaces are *not* currently configured at the root level to manage these three projects as a single monorepo. They are treated as independent projects co-located in one Git repository.
-   **Local Development:**
    *   **Backend:** `cd carepop-backend && npm install && npm run dev` (or equivalent).
    *   **Native App:** `cd carepop-nativeapp && npm install && npx expo start` (or `npm run ios/android`). Requires Expo Go app or simulator/emulator.
    *   **Web App:** `cd carepop-web && npm install && npm run dev`.
-   **Linters/Formatters:** Each project will have its own ESLint, Prettier, and TypeScript configurations (e.g., `eslintrc.js`, `tsconfig.json` within each respective project folder).
-   **Environment Variables:** Each project will manage its own environment variables (e.g., via `.env` files, not committed to Git).

## 5. CI/CD & Deployment

-   **`carepop-nativeapp/`:** EAS Build & Submit for app store deployment.
-   **`carepop-web/`:** Vercel/Netlify (or similar) for web deployment.
-   **`carepop-backend/`:** Google Cloud Build & Cloud Run for backend service deployment.
-   CI/CD pipelines (e.g., GitHub Actions) will be set up to trigger builds and deployments based on changes within the respective `carepop-backend/`, `carepop-nativeapp/`, or `carepop-web/` directories.

## 6. API Documentation

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

## 7. Key Technical Decisions & Trade-offs (Summary)

-   **Simplified Top-Level Structure:** Chosen over a complex monorepo to reduce tooling overhead and simplify individual project development, at the cost of potentially needing to manage cross-project dependencies or shared code more manually if that need arises significantly.
-   **Force Push for History Reset:** Necessary to establish the clean new structure on `main`, accepting the loss of easily browsable prior monorepo history on that branch.
-   **Supabase + Cloud Run:** Balances BaaS speed with custom logic flexibility.
-   **Expo (Managed Workflow) for Native:** Simplifies native build and deployment.
-   **Next.js for Web:** Strong for SSR/SSG, SEO, and modern web development with a rich ecosystem (Tailwind, Shadcn UI).
-   **TypeScript:** For type safety and improved maintainability across all three projects.

## 8. Technical Constraints & Considerations

*   **Compliance:** Strict adherence to Philippines DPA is mandatory. HIPAA compliance is a strategic goal.
*   **Security:** High priority due to sensitive health data (SPI/PHI). Requires robust implementation of encryption, access control (RLS + backend checks), secure coding, etc., across both frontend applications and the backend.
*   **User Experience Across Platforms:** Aim for a consistent brand identity and core functional experience, while optimizing the UI/UX for each distinct platform (native mobile for focused, on-the-go tasks; web for broader access, detailed information, and administrative functions).
*   **Performance:** Needs proactive optimization for both the native mobile app (rendering, startup time) and the web application (Core Web Vitals, server response times), as well as backend query/RLS performance.
*   **Scalability:** Leverage managed services (Supabase, Cloud Run, and web app hosting platform) but requires monitoring and appropriate configuration.
*   **SEO:** Public pages on the **new, separate Next.js web application** (Landing Pages, Directory) must be discoverable, achieved via Next.js SSR/SSG and other SEO best practices.
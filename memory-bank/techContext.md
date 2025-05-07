\# Technical Context: CarePop/QueerCare

This document outlines the primary technologies, stacks, and key technical decisions governing the development of the CarePoP/QueerCare platform.

\#\# 1\. Core Technologies & Platforms

\-   \*\*Cloud Infrastructure:\*\* Google Cloud Platform (GCP) primarily for serverless compute, secrets management, logging, monitoring, and scheduled tasks.  
\-   \*\*Backend-as-a-Service (BaaS):\*\* Supabase providing managed PostgreSQL database, Authentication, Storage, Realtime subscriptions, Row Level Security (RLS), and Database Triggers/Functions.  
\-   \*\*Native Mobile Platform:\*\* Expo (Managed Workflow) using React Native.  
\-   \*\*Web Platform:\*\* Next.js (App Router) using React.  
\-   \*\*Version Control:\*\* Git / GitHub (\`https://github.com/projectcarepop/carepop.git\`).  
\-   \*\*Language:\*\* TypeScript (used across all three projects: backend, native app, web app).  
\-   \*\*Package Management:\*\* npm (managed independently within each project directory).

\#\# 2\. Project Structure (Post-Refactor)

The project codebase resides in a single Git repository structured into three distinct top-level application directories:

1\.  \*\*\`carepop-backend/\`\*\*: Contains all backend code (Node.js/TypeScript services for Cloud Run, Supabase configurations/migrations).  
2\.  \*\*\`carepop-nativeapp/\`\*\*: Contains the Expo/React Native application code for \*\*iOS and Android ONLY\*\*.  
3\.  \*\*\`carepop-web/\`\*\*: Contains the Next.js application code for the comprehensive \*\*web application\*\* (public pages, user functional modules, admin interfaces).

\*\*Note:\*\* There is \*\*NO root-level monorepo tooling\*\* (like pnpm workspaces or Turborepo) currently configured to manage these three projects jointly. They are treated as independent projects within the same repository for organizational purposes.

\#\# 3\. Frontend Stack Details

\#\#\# A. Native Mobile Application (\`carepop-nativeapp/\` \- iOS & Android ONLY)  
    \*   \*\*Framework/Platform:\*\* React Native via Expo (Managed Workflow). Targets iOS and Android exclusively.  
    \*   \*\*Language:\*\* TypeScript.  
    \*   \*\*Navigation:\*\* React Navigation (likely \`@react-navigation/native-stack\`, potentially Drawer or Tabs).  
    \*   \*\*UI Components:\*\* Core React Native components, custom reusable components located within \`carepop-nativeapp/src/components/\` (migrated from previous shared package).  
    \*   \*\*Styling:\*\* React Native \`StyleSheet\` API, using a central theme defined in \`carepop-nativeapp/src/theme/\` (TypeScript constants/objects).  
    \*   \*\*State Management:\*\* React Context API for simpler global state (like Auth state). Consider Zustand or Redux Toolkit if complex state management becomes necessary later.  
    \*   \*\*API Interaction:\*\*  
        \*   \*\*Authentication:\*\* Directly uses \*\*Supabase JS SDK\*\* (\`supabase.auth.signUp\`, \`signInWithPassword\`, \`signOut\`, \`getSession\`, \`onAuthStateChange\`).  
        \*   \*\*Data:\*\* Direct Supabase JS SDK calls for simple, RLS-protected reads/writes where appropriate. Standard \`fetch\` API or \`axios\` for calls to custom backend APIs hosted on Cloud Run (\`carepop-backend/\`).  
    \*   \*\*Secure Storage:\*\* \`expo-secure-store\` for sensitive client-side storage (like refresh tokens if manually handled, though Supabase SDK aims to manage this).  
    \*   \*\*Build/Deployment:\*\* Expo Application Services (EAS) Build & Submit for creating \`.ipa\` and \`.apk\` files for app stores.

\#\#\# B. Web Application (\`carepop-web/\` \- Separate Project)  
    \*   \*\*Framework:\*\* Next.js (using App Router).  
    \*   \*\*Language:\*\* TypeScript.  
    \*   \*\*Styling:\*\* Tailwind CSS.  
    \*   \*\*UI Components:\*\* Shadcn UI (providing accessible, unstyled components built on Radix UI and styled with Tailwind CSS), custom React components.  
    \*   \*\*State Management:\*\* React Context API for simpler global state. \*\*React Query\*\* or \*\*SWR\*\* strongly recommended for managing server state, caching, and interactions with backend APIs. Consider Zustand or Redux Toolkit for complex global client state needs if they arise.  
    \*   \*\*API Interaction:\*\*  
        \*   \*\*Authentication:\*\* Directly uses \*\*Supabase JS SDK\*\* (\`supabase.auth.signUp\`, \`signInWithPassword\`, \`signOut\`, \`getSession\`, \`onAuthStateChange\`).  
        \*   \*\*Data:\*\* Next.js data fetching methods (Server Components fetching data server-side, Route Handlers potentially proxying to \`carepop-backend\` or interacting with Supabase), React Query/SWR for client-side data fetching from \`carepop-backend/\` APIs, direct Supabase JS SDK calls from client components for simple RLS-protected reads/writes where appropriate.  
    \*   \*\*Secure Storage:\*\* \*\*HttpOnly cookies\*\* recommended for managing session tokens if leveraging Next.js backend capabilities (like middleware or route handlers acting as auth proxies). If purely client-side interaction with Supabase, its SDK typically uses \`localStorage\` (ensure CSRF protection if applicable).  
    \*   \*\*Build/Deployment:\*\* Standard Next.js deployment targets (Vercel, Netlify, AWS Amplify, self-hosted on GCP Cloud Run/App Engine).

\#\#\# C. Obsolete Frontend Structures  
\*   \*\*\`carepop-frontend\` Monorepo:\*\* DEPRECATED.  
\*   \*\*React Native for Web (RNW):\*\* DEPRECATED. All web functionality is via \`carepop-web\`.  
\*   \*\*Shared \`packages/ui\`, \`packages/eslint-config\`, \`packages/typescript-config\`:\*\* DEPRECATED. Code integrated or config managed per-project.

\#\# 4\. Backend Stack Details (\`carepop-backend/\`)

\*   \*\*Primary BaaS:\*\* \*\*Supabase\*\*  
    \*   \*\*Database:\*\* Managed PostgreSQL. Schema defined via SQL migrations (\`carepop-backend/supabase/migrations/\`).  
    \*   \*\*Authentication:\*\* Supabase Auth service (identity, JWTs, password management, email confirmations, potentially OAuth). \*\*Clients interact directly via SDK for core auth.\*\*  
    \*   \*\*Authorization:\*\* Supabase Row Level Security (RLS) is the \*\*primary data access control mechanism\*\* enforced at the database level.  
    \*   \*\*Triggers/Functions:\*\* Supabase Database Functions (PL/pgSQL) and Triggers used for automated database operations (e.g., \`handle\_new\_user\` profile creation). Supabase Edge Functions (Deno) might be used for very simple, data-proximate HTTP endpoints if needed later.  
    \*   \*\*Storage:\*\* Supabase Storage for file uploads, secured by Storage policies.  
    \*   \*\*SDK:\*\* Supabase JS SDK (\`@supabase/supabase-js\`) used by clients and Cloud Run services. Separate \`anon\` (public/client-safe) and \`service\_role\` (privileged, bypasses RLS, \*\*used ONLY within secure Cloud Run functions after explicit authorization checks\*\*) client instances initialized (\`carepop-backend/src/config/supabaseClient.ts\`).

\*   \*\*Custom Logic Host:\*\* \*\*Google Cloud Platform (GCP) \- Cloud Run\*\*  
    \*   \*\*Runtime:\*\* Node.js (with TypeScript). Containerized applications/services.  
    \*   \*\*Purpose:\*\* Executes custom backend logic \*not\* handled by direct Supabase interactions or triggers. Key uses include:  
        \*   Implementing complex RESTful APIs serving both native and web clients.  
        \*   Performing application-level data encryption/decryption using custom keys before/after Supabase storage.  
        \*   Executing logic requiring elevated \`service\_role\` access to Supabase (after strict application-level authorization checks).  
        \*   Integrating with third-party services (AI/NLP, Payment Gateways, etc.).  
        \*   Running background jobs triggered by Cloud Scheduler.  
        \*   Handling specific administrative API functions.  
    \*   \*\*Framework:\*\* Minimal framework preferred (e.g., standard Node.js \`http\` module, optionally Express/Fastify for structure if needed).

\*   \*\*Supporting GCP Services:\*\*  
    \*   \*\*Cloud Secret Manager:\*\* Stores ALL sensitive credentials (Supabase \`service\_role\` key, Application Encryption Keys, 3rd party API keys). Accessed securely by Cloud Run services via IAM.  
    \*   \*\*Cloud Logging:\*\* Centralized logging sink for all Cloud Run service logs.  
    \*   \*\*Cloud Monitoring:\*\* Application/infrastructure monitoring and alerting for Cloud Run and potentially Supabase metrics (via integrations).  
    \*   \*\*Cloud Scheduler:\*\* Triggers scheduled Cloud Run jobs (reminders, retention, reporting).  
    \*   \*\*(Future):\*\* Google Cloud Storage (backups), Artifact Registry (container images), Cloud Build (CI/CD), Cloud Load Balancer/CDN.

\*   \*\*Backend Libraries:\*\*  
    \*   Node.js \`crypto\` module (for application-level encryption utility \- SEC-E-2).  
    \*   \`@supabase/supabase-js\` (for interacting with Supabase).  
    \*   Logging library (\`winston\` or \`pino\`) configured for Cloud Logging.  
    \*   Input validation library (\`joi\`, \`zod\`, or similar).  
    \*   \`(Potentially)\` Express/Fastify if a framework is used on Cloud Run.

\#\# 5\. Development Setup & Tooling (Revised)

\-   \*\*Project Structure:\*\* Independent development within the three top-level directories (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`).  
\-   \*\*Version Control:\*\* Git / GitHub. History reset via force push on \`\<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\>\`.  
\-   \*\*Package Management:\*\* \`npm\` used independently within each project (\`npm install\`, \`package.json\`, \`package-lock.json\`). No root monorepo management.  
\-   \*\*Local Development:\*\* Requires running \`npm install\` and the appropriate \`dev\` or \`start\` script within each respective project directory.  
\-   \*\*Linters/Formatters:\*\* Independent ESLint, Prettier, TypeScript config (\`eslintrc.js\`, \`tsconfig.json\`, \`.prettierrc\`) within each project.  
\-   \*\*Environment Variables:\*\* Handled via \`.env\` files (not committed) within each project directory, loaded appropriately (e.g., \`dotenv\` for local Node.js, Expo's \`.env\` handling, Next.js's \`.env.local\` handling). Production secrets loaded from Cloud Secret Manager by Cloud Run.

\#\# 6\. CI/CD & Deployment

\-   Independent pipelines for each project, likely triggered by path changes:  
    \*   \`carepop-nativeapp/\`: EAS Build (triggered by CI/CD) \-\> EAS Submit.  
    \*   \`carepop-web/\`: CI/CD builds Next.js app \-\> Deploys to Vercel/Netlify/GCP hosting.  
    \*   \`carepop-backend/\`: CI/CD builds Docker image \-\> Pushes to Artifact Registry \-\> Deploys new revision to Cloud Run.  
\-   Platforms: GitHub Actions, GitLab CI, Jenkins, Google Cloud Build.

\#\# 7\. Key Technical Decisions & Trade-offs (Summary)

\-   \*\*Three Separate Projects:\*\* Simplifies build/dev for each platform, avoids monorepo/RNW complexity. Requires explicit API contracts and separate UI development.  
\-   \*\*Direct Client-Supabase Auth:\*\* Faster auth flow, simpler backend for core auth. Relies on client security and DB trigger reliability.  
\-   \*\*Supabase \+ Cloud Run:\*\* Balances BaaS speed/features (DB, Auth, RLS) with custom logic flexibility (Cloud Run for complex tasks, encryption, secure \`service\_role\` usage, scheduled jobs). Requires managing two cloud platforms.  
\-   \*\*Expo (Managed Workflow) for Native:\*\* Simplifies native builds/deployment. Relies on Expo SDK/EAS capabilities.  
\-   \*\*Next.js/Tailwind/Shadcn UI for Web:\*\* Optimizes for web performance, SEO, DX, and modern aesthetics. No UI code sharing with native.  
\-   \*\*TypeScript Everywhere:\*\* Improves code quality and maintainability.  
\-   \*\*NPM Per Project:\*\* Simple dependency management. No automatic cross-project linking (must rely on published packages or manual linking if extensive sharing between \*backend\* and \*web\* becomes needed later, but currently avoided).

\#\# 8\. Technical Constraints & Considerations

\*   \*\*Compliance:\*\* DPA (Mandatory), HIPAA (Goal). Must be designed into Supabase RLS, Cloud Run logic, encryption strategy, etc.  
\*   \*\*Security:\*\* High priority. Requires layered security across Supabase, Cloud Run, GCP, and client applications. Application-level encryption and careful \`service\_role\` key handling are critical.  
\*   \*\*User Experience:\*\* Native app optimized for mobile use cases; Web app optimized for desktop/browser access, public info, and admin tasks. Maintain brand consistency.  
\*   \*\*Performance:\*\* Optimize Supabase queries/RLS, Cloud Run function performance, native app startup/rendering, and web app Core Web Vitals/SSR/SSG.  
\*   \*\*Scalability:\*\* Rely on Supabase, Cloud Run, and web host scaling capabilities.  
\*   \*\*SEO:\*\* Handled primarily by the \`carepop-web\` (Next.js) application.

\---  
\*\*END OF DOCUMENT\*\*  

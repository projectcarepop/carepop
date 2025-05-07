\# Conceptual Change Log: CarePoP/QueerCare

\*This log tracks significant decisions, architectural changes, and implementation milestones throughout the project lifecycle.\*

\---

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Finalized Authentication Flow Plan & Updated Memory Bank (Current State).  
    \*   \*\*Description:\*\* Confirmed the implementation plan to use direct client-Supabase Auth SDK calls for registration/login, with a Supabase database trigger handling initial profile creation. Removed dedicated Cloud Run endpoints (original FOUND-9/10) for these core auth actions from the plan. Updated all relevant Memory Bank files (\`activeContext.md\`, \`progress.md\`, \`techContext.md\`, \`systemPatterns.md\`) and \`epics\_and\_tickets.md\` to reflect this finalized approach.  
    \*   \*\*Reason:\*\* Optimize for implementation speed and simplicity for the core auth flow, leveraging Supabase BaaS capabilities directly.  
    \*   \*\*Next Step:\*\* Implement code changes (apply trigger, refactor frontend auth calls/state).

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Completed Major Project Restructure & Git History Reset.  
    \*   \*\*Description:\*\* Successfully reorganized the project into three top-level directories (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`) within the single main Git repository. Abandoned the previous \`carepop-frontend\` monorepo structure. \*\*Performed a force push to the \`main\` branch on GitHub (\`https://github.com/projectcarepop/carepop.git\`)\*\*, establishing this new structure as the baseline and resetting the \`main\` branch commit history. Completed Memory Bank documentation update reflecting this.  
    \*   \*\*Reason:\*\* Simplify development workflows, reduce monorepo tooling overhead, clarify project boundaries, and provide a cleaner baseline for future development.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Initiated Major Project Restructure Planning.  
    \*   \*\*Description:\*\* Decision made to restructure the project into three top-level applications (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`). Planning phase involved documenting the target structure (\`activeContext.md\`, etc.) and preparing for the manual file migration and force push.  
    \*   \*\*Reason:\*\* Address ongoing complexities and developer friction perceived with the previous monorepo setup, especially managing different frontend technologies and native builds.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Refined Web Application Scope.  
    \*   \*\*Description:\*\* Clarified that the separate \`carepop-web\` application will be a comprehensive web app mirroring native app functionality (including user login, modules like Directory, Appointments, Trackers) \*in addition\* to public landing pages and admin interfaces. Confirmed tech stack as Next.js, Tailwind CSS, Shadcn UI for a modern look and feel. Updated Memory Bank docs accordingly.  
    \*   \*\*Reason:\*\* Ensure full feature parity (where applicable) on web platform, distinct from native app development.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Completed Architectural Documentation Update for Dual-Frontend Approach.  
    \*   \*\*Description:\*\* All core Memory Bank files and \`epics\_and\_tickets.md\` were revised at this point to reflect the \*previous\* pivot to a dual-frontend architecture: Native Mobile App (Expo) and a separate Web Application (Next.js). Backend (Supabase \+ Cloud Run) to serve both. (This documentation was superseded by the subsequent project restructure).

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Architectural Pivot Decision: Separate Web Application.  
    \*   \*\*Description:\*\* Decided to abandon React Native for Web approach entirely. Plan adopted to build a \*separate\* web application using Next.js, Tailwind CSS, and Shadcn UI. Native application (\`carepop-nativeapp\` within the \*then-existing\* monorepo) to focus solely on iOS/Android via Expo.  
    \*   \*\*Reason:\*\* Persistent difficulties with RNW within the monorepo, desire for optimal web performance, SEO capabilities, and a visually distinct, modern web presence achievable more easily with dedicated web technologies.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Finalized Core Authentication Flow Logic (Direct Client-Supabase \+ Trigger).  
    \*   \*\*Description:\*\* Based on successful Supabase trigger test for profile creation and considering implementation speed, decided to proceed \*without\* the Cloud Run wrapper functions (original FOUND-9/FOUND-10) for core registration/login. Clients will call Supabase Auth SDK directly. Initiated update to documentation (\`epics\_and\_tickets.md\`, Memory Bank).  
    \*   \*\*Reason:\*\* Simplification of core auth path, reduction of backend code/infra for basic auth, leverage Supabase features directly.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Diagnosed & Resolved Profile Creation Trigger Error.  
    \*   \*\*Description:\*\* Identified root cause of \`handle\_new\_user\` trigger failing: attempt to insert into \`email\` column which did not exist in \`profiles\` table schema. Chosen solution: Create and apply a new Supabase migration (\`add\_email\_to\_profiles\`) to add the missing \`email\` column. Successfully tested user registration afterwards; profile including email is now created by the trigger.  
    \*   \*\*Reason:\*\* Align database schema with function expectation and likely frontend type definitions.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* RLS Policy Verification (Manual).  
    \*   \*\*Description:\*\* Manually tested implemented RLS policies (self read/update on \`profiles\`) via Supabase SQL Editor using \`SET ROLE authenticated; SET request.jwt.claims...\`. Confirmed policies correctly restrict access.  
    \*   \*\*Reason:\*\* Ensure foundational RLS security is working as expected before building dependent features.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Resolved Profile Creation RLS Error.  
    \*   \*\*Description:\*\* Profile creation via \`registerUserService\` (Cloud Run) failed due to RLS violation. Updated backend \`supabaseClient.ts\` to include a separate client instance initialized with the \`service\_role\` key. Modified \`registerUserService\` to use this \`supabaseServiceRole\` client specifically for the \`profiles\` table insertion after successful \`supabase.auth.signUp\`.  
    \*   \*\*Reason:\*\* Profile insertion needs to happen reliably regardless of \`profiles\` table RLS for regular users; the backend service performing this system action requires elevated privileges (service role) for this specific step.

\*   \*\*(Historical Entries Below Reflecting Previous Monorepo/RNCLI/RNW Attempts)\*\*

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Switched Native App Development from RN CLI to Expo CLI.  
    \*   \*\*Description:\*\* Re-initialized the native app project (\`apps/nativeapp\` within the \*then-existing\* \`carepop-frontend\` monorepo) using Expo managed workflow (\`npx create-expo-app\`). Kept pnpm/Turborepo for monorepo management.  
    \*   \*\*Reason:\*\* Persistent, difficult-to-resolve native build errors (Gradle/CMake/Metro) when using React Native CLI within the pnpm monorepo setup. Expo provides a simplified native build/runtime environment, aiming to reduce this friction.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Implemented Supabase Foundational Schema & RLS (FOUND-8).  
    \*   \*\*Description:\*\* Created \`profiles\` table via Supabase migration, linked to \`auth.users\`. Implemented basic RLS policy allowing users to select/update their own profile row. Applied via \`supabase db push\`.  
    \*   \*\*Reason:\*\* Establish core user data structure and baseline security for authentication flow.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Implemented Backend Login API (Cloud Run \- Original FOUND-10).  
    \*   \*\*Description:\*\* Created \`/api/auth/login\` endpoint in \`carepop-backend\` Cloud Run service. Uses Supabase JS SDK (\`signInWithPassword\`) to verify credentials and returns JWT. Added unit tests.  
    \*   \*\*Reason:\*\* Provide backend endpoint for clients to authenticate. \*(Decision later revised to use direct client-Supabase calls).\*

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Implemented Backend Registration API (Cloud Run \- Original FOUND-9).  
    \*   \*\*Description:\*\* Created \`/api/auth/register\` endpoint in \`carepop-backend\` Cloud Run service. Uses Supabase JS SDK (\`signUp\`). Added unit tests. \*(Initially without profile creation logic)\*.  
    \*   \*\*Reason:\*\* Provide backend endpoint for clients to register. \*(Decision later revised to use direct client-Supabase calls).\*

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Configured Supabase Authentication (FOUND-7).  
    \*   \*\*Description:\*\* Enabled Supabase Auth in the project dashboard. Configured Email/Password provider. Initialized Supabase JS SDK client in backend.  
    \*   \*\*Reason:\*\* Set up the core BaaS authentication provider.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Set Up Basic Testing Frameworks (FOUND-6).  
    \*   \*\*Description:\*\* Integrated Jest for both backend (Node.js/TS) and frontend (RN). Created basic passing tests.  
    \*   \*\*Reason:\*\* Establish testing foundation early.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Configured Backend CI/CD to Cloud Run (FOUND-5 Part 1).  
    \*   \*\*Description:\*\* Set up Dockerfile for backend, Artifact Registry, GitHub Actions workflow (\`deploy-backend-staging.yml\`) using Workload Identity Federation. Verified deployment to Cloud Run staging.  
    \*   \*\*Reason:\*\* Automate backend deployment.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Implemented Backend Logging & Config (FOUND-4).  
    \*   \*\*Description:\*\* Integrated Winston for structured logging to Cloud Logging. Set up config loading from GCP Secret Manager / \`.env\`.  
    \*   \*\*Reason:\*\* Establish robust logging and secure configuration practices for backend.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Provisioned Cloud Infrastructure (FOUND-3).  
    \*   \*\*Description:\*\* Created Supabase project, GCP project, enabled Cloud Run, Secret Manager, Logging. Configured basic network access.  
    \*   \*\*Reason:\*\* Set up foundational cloud resources for staging environment.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Configured Basic Dev Environments (FOUND-2).  
    \*   \*\*Description:\*\* Set up local Node.js/TS environment for backend and initial RN CLI environment for frontend (within monorepo). Installed core dependencies. Created basic run scripts.  
    \*   \*\*Reason:\*\* Enable local development.

\*   \*\*Timestamp:\*\* \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- \*\*Action:\*\* Initial Project & Repository Setup (FOUND-1).  
    \*   \*\*Description:\*\* Created initial Git repository and monorepo structure (\`carepop-frontend\`, \`carepop-backend\`).  
    \*   \*\*Reason:\*\* Project inception.


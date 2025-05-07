\# Project Progress: CarePop/QueerCare

\#\# Current Status (As of \<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\>)

\*\*Major project restructure completed.\*\* The project now exists in a single Git repository (\`https://github.com/projectcarepop/carepop.git\`) with three distinct top-level application directories: \`carepop-backend/\`, \`carepop-nativeapp/\`, and \`carepop-web/\`. The \`main\` branch history has been reset via force push to reflect this structure. Project documentation (\`epics\_and\_tickets.md\`, Memory Bank files) has been updated to align with this new architecture and the finalized decision to use \*\*direct Client-Supabase Authentication\*\* with a database trigger for profile creation.

\*\*Current focus is on implementing the core authentication flow\*\* within this new structure, primarily in \`carepop-nativeapp\` and the Supabase backend trigger.

\#\# What Works (Verified in New Structure)

\-   \*\*Project Structure:\*\* The three top-level directories are in place in the Git repository.  
\-   \*\*Basic Initialization:\*\*  
    \*   \`carepop-backend/\`: Basic Node.js/TypeScript setup, Supabase client config present. Staging deployment via CI/CD to Cloud Run is functional.  
    \*   \`carepop-nativeapp/\`: Expo project initializes, core dependencies installed. Basic "blank" app renders in Expo Go/simulator. Basic theme and integrated UI components (Button, Input, Card using StyleSheet) are present.  
    \*   \`carepop-web/\`: Next.js project initializes with TypeScript, Tailwind CSS, Shadcn UI. Basic placeholder page runs via dev server.  
\-   \*\*Core Infrastructure:\*\* Supabase project (Staging), GCP project with Cloud Run, Secret Manager, Logging configured for staging.  
\-   \*\*Foundational Auth Setup (Backend):\*\* Supabase Auth configured with Email/Password provider. Foundational \`profiles\` table created with RLS allowing self-read/write (migration applied).

\#\# What's Left to Build (Immediate Focus from \`tracker.md\`)

\*Primary Focus: Core Authentication Flow\*

1\.  \*\*Apply Supabase Profile Trigger (Revised FOUND-9):\*\* Implement and test the SQL trigger function (\`handle\_new\_user\`) in the Supabase project. \*\*Status: To Do\*\*  
2\.  \*\*Refactor Native App Auth Service/Context (AUTH-1, AUTH-2, AUTH-3):\*\* Rewrite \`carepop-nativeapp\` auth logic to use direct Supabase JS SDK calls (\`signUp\`, \`signInWithPassword\`, \`onAuthStateChange\`, etc.) and manage session state. \*\*Status: To Do\*\*  
3\.  \*\*Implement Secure Token Storage (Native App \- SEC-FE-1 / AUTH-3):\*\* Integrate \`expo-secure-store\` or verify Supabase SDK session persistence. \*\*Status: To Do\*\*  
4\.  \*\*Connect Native Auth UI (AUTH-4, AUTH-5):\*\* Link the Login/Register screens in \`carepop-nativeapp\` to the refactored auth logic. Remove any existing bypasses. \*\*Status: To Do\*\*  
5\.  \*\*End-to-End Auth Test (Native App):\*\* Verify Signup \-\> Trigger \-\> Profile \-\> Login \-\> Session \-\> Logout flow. \*\*Status: To Do\*\*  
6\.  \*\*(Next Priority) Web App Auth Implementation:\*\* Implement equivalent auth flow (direct SDK calls, context, UI connection) in \`carepop-web\`. \*\*Status: To Do\*\*  
7\.  \*\*(Parallel/Next) Backend Enhancements:\*\* Implement RLS beyond basic profile access (COMPLIANCE-2), Cloud Run Auth Middleware (SEC-BE-2), Core RBAC Enforcement logic (SEC-BE-3). \*\*Status: Partially Done (RLS basics) / To Do\*\*

\*(Other features from \`epics\_and\_tickets.md\` like Appointments, Directory, Tracking, Admin Portal, etc., remain largely "To Do" pending the completion of the core authentication flow and further backend/frontend implementation)\*

\#\# Known Issues & Blockers (Current)

\-   \*\*Native App Build Issues (Previously Resolved):\*\* Past issues with Android builds (linker errors, path issues) were resolved by moving to Expo and simplifying the structure. Need to monitor stability. \*\*Risk: Low (Post-Refactor)\*\*  
\-   \*\*Authentication Logic:\*\* Core authentication flow needs implementation in the native app codebase based on the new direct-Supabase approach. \*\*Current Blocker for User Interaction.\*\*  
\-   \*\*CI/CD for Native App:\*\* Pipeline setup for \`carepop-nativeapp\` using EAS Build needs full implementation and testing (FOUND-5). \*\*Blocker for Staging Deployments.\*\*  
\-   \*\*Web Application Development:\*\* The \`carepop-web\` application is largely un-implemented beyond basic initialization. \*\*Needs Dedicated Effort.\*\*

\#\# Key Decisions & Evolutions Log

\-   \*\*\<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- Decision:\*\* Finalized authentication flow: Direct Client-Supabase Auth SDK calls \+ Supabase DB Trigger for profile creation. Removed dedicated Cloud Run auth endpoints (original FOUND-9/10). \*\*(Implementation Pending)\*\*  
\-   \*\*\<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- Action:\*\* Completed Major Project Restructure. Established three top-level directories (\`carepop-backend\`, \`carepop-nativeapp\`, \`carepop-web\`). Force pushed new structure to \`main\` branch. Updated all Memory Bank docs.  
\-   \*\*\<YYYY-MM-DDTHH:MM:SSZ\_PLACEHOLDER\> \- Decision:\*\* Adopt a simplified three-pillar top-level folder structure. Abandon the \`carepop-frontend\` monorepo. Plan to force push the new structure to \`main\`, resetting its history.  
\-   \*\*(Previous Decision \- Documented):\*\* Shifted from React Native for Web to a separate Next.js/Tailwind/Shadcn UI web application. Native app to use Expo for iOS/Android only.  
\-   \*\*(Previous Decision \- Documented):\*\* Shifted Native App Development from RN CLI to Expo CLI (Managed Workflow) due to persistent monorepo/native build difficulties.


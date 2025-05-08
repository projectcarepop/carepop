# Conceptual Change Log: CarePoP/QueerCare

*This log tracks significant decisions, architectural changes, and implementation milestones throughout the project lifecycle.*

---

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Finalized Authentication Flow Plan & Updated Memory Bank (Current State).  
    *   Description: Confirmed the implementation plan to use direct client-Supabase Auth SDK calls for registration/login, with a Supabase database trigger handling initial profile creation. Removed dedicated Cloud Run endpoints (original FOUND-9/10) for these core auth actions from the plan. Updated all relevant Memory Bank files (\`activeContext.md\`, \`progress.md\`, \`techContext.md\`, \`systemPatterns.md\`) and \`epics_and_tickets.md\` to reflect this finalized approach.  
    *   Reason: Optimize for implementation speed and simplicity for the core auth flow, leveraging Supabase BaaS capabilities directly.  
    *   Next Step: Implement code changes (apply trigger, refactor frontend auth calls/state).

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Completed Major Project Restructure & Git History Reset.  
    *   Description: Successfully reorganized the project into three top-level directories (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`) within the single main Git repository. Abandoned the previous \`carepop-frontend\` monorepo structure. Performed a force push to the \`main\` branch on GitHub (\`https://github.com/projectcarepop/carepop.git\`), establishing this new structure as the baseline and resetting the \`main\` branch commit history. Completed Memory Bank documentation update reflecting this.  
    *   Reason: Simplify development workflows, reduce monorepo tooling overhead, clarify project boundaries, and provide a cleaner baseline for future development.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Initiated Major Project Restructure Planning.  
    *   Description: Decision made to restructure the project into three top-level applications (\`carepop-backend/\`, \`carepop-nativeapp/\`, \`carepop-web/\`). Planning phase involved documenting the target structure (\`activeContext.md\`, etc.) and preparing for the manual file migration and force push.  
    *   Reason: Address ongoing complexities and developer friction perceived with the previous monorepo setup, especially managing different frontend technologies and native builds.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Refined Web Application Scope.  
    *   Description: Clarified that the separate \`carepop-web\` application will be a comprehensive web app mirroring native app functionality (including user login, modules like Directory, Appointments, Trackers) *in addition* to public landing pages and admin interfaces. Confirmed tech stack as Next.js, Tailwind CSS, Shadcn UI for a modern look and feel. Updated Memory Bank docs accordingly.  
    *   Reason: Ensure full feature parity (where applicable) on web platform, distinct from native app development.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Completed Architectural Documentation Update for Dual-Frontend Approach.  
    *   Description: All core Memory Bank files and \`epics_and_tickets.md\` were revised at this point to reflect the *previous* pivot to a dual-frontend architecture: Native Mobile App (Expo) and a separate Web Application (Next.js). Backend (Supabase + Cloud Run) to serve both. (This documentation was superseded by the subsequent project restructure).

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Architectural Pivot Decision: Separate Web Application.  
    *   Description: Decided to abandon React Native for Web approach entirely. Plan adopted to build a *separate* web application using Next.js, Tailwind CSS, and Shadcn UI. Native application (\`carepop-nativeapp\` within the *then-existing* monorepo) to focus solely on iOS/Android via Expo.  
    *   Reason: Persistent difficulties with RNW within the monorepo, desire for optimal web performance, SEO capabilities, and a visually distinct, modern web presence achievable more easily with dedicated web technologies.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Finalized Core Authentication Flow Logic (Direct Client-Supabase + Trigger).  
    *   Description: Based on successful Supabase trigger test for profile creation and considering implementation speed, decided to proceed *without* the Cloud Run wrapper functions (original FOUND-9/FOUND-10) for core registration/login. Clients will call Supabase Auth SDK directly. Initiated update to documentation (\`epics_and_tickets.md\`, Memory Bank).  
    *   Reason: Simplification of core auth path, reduction of backend code/infra for basic auth, leverage Supabase features directly.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Diagnosed & Resolved Profile Creation Trigger Error.  
    *   Description: Identified root cause of \`handle_new_user\` trigger failing: attempt to insert into \`email\` column which did not exist in \`profiles\` table schema. Chosen solution: Create and apply a new Supabase migration (\`add_email_to_profiles\`) to add the missing \`email\` column. Successfully tested user registration afterwards; profile including email is now created by the trigger.  
    *   Reason: Align database schema with function expectation and likely frontend type definitions.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: RLS Policy Verification (Manual).  
    *   Description: Manually tested implemented RLS policies (self read/update on \`profiles\`) via Supabase SQL Editor using \`SET ROLE authenticated; SET request.jwt.claims...\`. Confirmed policies correctly restrict access.  
    *   Reason: Ensure foundational RLS security is working as expected before building dependent features.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Resolved Profile Creation RLS Error.  
    *   Description: Profile creation via \`registerUserService\` (Cloud Run) failed due to RLS violation. Updated backend \`supabaseClient.ts\` to include a separate client instance initialized with the \`service_role\` key. Modified \`registerUserService\` to use this \`supabaseServiceRole\` client specifically for the \`profiles\` table insertion after successful \`supabase.auth.signUp\`.  
    *   Reason: Profile insertion needs to happen reliably regardless of \`profiles\` table RLS for regular users; the backend service performing this system action requires elevated privileges (service role) for this specific step.

*   (Historical Entries Below Reflecting Previous Monorepo/RNCLI/RNW Attempts)*

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Switched Native App Development from RN CLI to Expo CLI.  
    *   Description: Re-initialized the native app project (\`apps/nativeapp\` within the *then-existing* \`carepop-frontend\` monorepo) using Expo managed workflow (\`npx create-expo-app\`). Kept pnpm/Turborepo for monorepo management.  
    *   Reason: Persistent, difficult-to-resolve native build errors (Gradle/CMake/Metro) when using React Native CLI within the pnpm monorepo setup. Expo provides a simplified native build/runtime environment, aiming to reduce this friction.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Implemented Supabase Foundational Schema & RLS (FOUND-8).  
    *   Description: Created \`profiles\` table via Supabase migration, linked to \`auth.users\`. Implemented basic RLS policy allowing users to select/update their own profile row. Applied via \`supabase db push\`.  
    *   Reason: Establish core user data structure and baseline security for authentication flow.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Implemented Backend Login API (Cloud Run - Original FOUND-10).  
    *   Description: Created \`/api/auth/login\` endpoint in \`carepop-backend\` Cloud Run service. Uses Supabase JS SDK (\`signInWithPassword\`) to verify credentials and returns JWT. Added unit tests.  
    *   Reason: Provide backend endpoint for clients to authenticate. *(Decision later revised to use direct client-Supabase calls).*

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Implemented Backend Registration API (Cloud Run - Original FOUND-9).  
    *   Description: Created \`/api/auth/register\` endpoint in \`carepop-backend\` Cloud Run service. Uses Supabase JS SDK (\`signUp\`). Added unit tests. *(Initially without profile creation logic)*.  
    *   Reason: Provide backend endpoint for clients to register. *(Decision later revised to use direct client-Supabase calls).*

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Configured Supabase Authentication (FOUND-7).  
    *   Description: Enabled Supabase Auth in the project dashboard. Configured Email/Password provider. Initialized Supabase JS SDK client in backend.  
    *   Reason: Set up the core BaaS authentication provider.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Set Up Basic Testing Frameworks (FOUND-6).  
    *   Description: Integrated Jest for both backend (Node.js/TS) and frontend (RN). Created basic passing tests.  
    *   Reason: Establish testing foundation early.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Configured Backend CI/CD to Cloud Run (FOUND-5 Part 1).  
    *   Description: Set up Dockerfile for backend, Artifact Registry, GitHub Actions workflow (\`deploy-backend-staging.yml\`) using Workload Identity Federation. Verified deployment to Cloud Run staging.  
    *   Reason: Automate backend deployment.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Implemented Backend Logging & Config (FOUND-4).  
    *   Description: Integrated Winston for structured logging to Cloud Logging. Set up config loading from GCP Secret Manager / \`.env\`.  
    *   Reason: Establish robust logging and secure configuration practices for backend.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Provisioned Cloud Infrastructure (FOUND-3).  
    *   Description: Created Supabase project, GCP project, enabled Cloud Run, Secret Manager, Logging. Configured basic network access.  
    *   Reason: Set up foundational cloud resources for staging environment.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Configured Basic Dev Environments (FOUND-2).  
    *   Description: Set up local Node.js/TS environment for backend and initial RN CLI environment for frontend (within monorepo). Installed core dependencies. Created basic run scripts.  
    *   Reason: Enable local development.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Initial Project & Repository Setup (FOUND-1).  
    *   Description: Created initial Git repository and monorepo structure (\`carepop-frontend\`, \`carepop-backend\`).  
    *   Reason: Project inception.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Initial Project Setup & CI/CD (SETUP-1, SETUP-2).
*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Authentication Setup (MVP-AUTH-1, MVP-AUTH-2).
*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Successfully built and ran `carepop-mobile` on Android after extensive debugging.
    *   Description: Attempting initial run (`npm run android`) after basic setup.
    *   Problem: Encountered multiple native build failures.
    *   Resolution Steps:
        *   Fixed dependency mismatches using `npx expo install --check` (React Navigation).
        *   Resolved `react-native-reanimated` C++ linker errors (`undefined symbol std::...`) by:
            *   Experimenting with `android.stl=c++_shared` (ineffective).
            *   Experimenting with explicitly setting AGP version (ineffective, caused other conflicts).
            *   Identifying via web search that specific NDK versions are often required.
            *   Explicitly setting `ndkVersion = "26.1.10909125"` in root `android/build.gradle` `ext` block (Effective).
        *   Resolved subsequent Android manifest merger/SDK version conflicts by updating `compileSdkVersion`, `targetSdkVersion`, `buildToolsVersion`, and `minSdkVersion` in root `android/build.gradle` `ext` block.
        *   Troubleshot Metro bundler errors related to `ws`/`stream` incompatibility by configuring `metro.config.js` with `unstable_conditionNames = ['browser', 'require']`.
        *   Resolved Metro module resolution error for `../utils/supabase` by creating the file and installing missing `react-native-url-polyfill` dependency.
        *   Debugged `TypeError: Cannot read property 'profile' of null` by tracing error source to `DashboardScreen.tsx` incorrectly re-fetching profile instead of using `AuthContext`; refactored `DashboardScreen` to use context.
    *   Outcome: Android build successful, app runs, Metro bundler stable. (FOUND-MOBILE-SETUP)
*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Refactored `CreateProfileScreen` UI and implemented address handling.
    *   Description: Post-login, user needs to create a profile.
    *   Actions:
        *   Added numerous fields (DOB, Age, Civil Status, Religion, Occupation, Address components, Contact, PhilHealth).
        *   Implemented `DateTimePicker` for Date of Birth and auto-calculated Age.
        *   Implemented `Picker` for Civil Status, troubleshooting display issues.
        *   Refactored Address input into separate fields (Street, Province, City, Barangay).
        *   Switched address data source from failed API attempt to local JSON (`isaacdarcilla/philippine-addresses`) due to API pagination/availability concerns.
        *   Implemented cascading dropdowns for Province -> City -> Barangay using local JSON data and `useEffect` hooks.
        *   Refactored all pickers (`DateTimePicker`, `Picker`) to use a consistent "tap-to-show" UI interaction pattern.
        *   Updated `handleCreateProfile` to send separate address codes (`province_code`, `city_municipality_code`, `barangay_code`) to Supabase.
    *   Outcome: Feature-rich `CreateProfileScreen` UI implemented. Address selection fully functional using local data. Requires backend `profiles` table schema update to save data. (FEAT-AUTH-CREATEPROFILE)
*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Restored standard auth flow navigation in `App.tsx`.
    *   Description: `App.tsx` was temporarily modified to always show `CreateProfileScreen` for testing.
    *   Action: Reverted temporary changes, uncommented original logic checking `session` and `profile` from `AuthContext` to determine initial route.
    *   Outcome: App navigation now correctly reflects user authentication and profile status. (FOUND-MOBILE-NAV)

*   Timestamp: 2024-08-01 10:00 - Action: Initialized `activeContext.md` and `progress.md` based on `tracker.md` and ongoing component refactoring in `carepop-mobile`.
    *   Description: Focused on completing JSDoc and minor refactors for `AuthContext`, `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, and core UI components (`Button`, `TextInput`, `Card`, `Checkbox`, `RadioButton`, `RadioGroup`, `Switch`).
    *   Rationale: Establish a baseline for current work and ensure context is captured before tackling larger refactors like `CreateProfileScreen`.
    *   Impact: Clearer view of immediate tasks and component status.
    *   Ticket(s) Referenced: UI-IMPROVE-1 to UI-IMPROVE-8, AUTH-M-1 to AUTH-M-4.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Refactored `carepop-mobile/screens/CreateProfileScreen.tsx`.
    *   Details:
        *   Converted state management from multiple `useState` hooks to a single `useReducer` hook (`formReducer`) for improved clarity and centralized logic.
        *   Implemented a `ProfileFormData` interface for form state and `FormAction` types.
        *   Enhanced validation with a `validateProfileForm` function, providing field-specific error messages. Errors are now displayed inline beneath each field.
        *   Added comprehensive JSDoc comments for the component, props, state, actions, and helper functions.
        *   Identified and added a prominent `IMPORTANT BACKEND BLOCKER` comment within `handleCreateProfile` regarding the necessary Supabase `profiles` table schema migration. The actual database insert is currently simulated to prevent runtime errors until the backend is updated.
        *   Corrected `middleInitial` maxLength to 1.
    *   Rationale: Improve code maintainability, readability, and robustness of the profile creation form. Centralize state and validation logic. Clearly document component and backend dependencies.
    *   Impact: `CreateProfileScreen.tsx` is now more structured and easier to debug. Profile creation is currently blocked pending backend schema changes.
    *   Ticket(s) Referenced: `USER-PROF-2` (primarily), potentially related UI improvement tickets.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Addressed `profiles` table schema mismatch and refactored `MyProfileScreen.tsx`.
    *   Details:
        *   Identified missing columns in `public.profiles` table based on frontend requirements (`CreateProfileScreen`, `MyProfileScreen`).
        *   Created a new Supabase migration file (`..._add_detailed_profile_fields.sql`) in `carepop-backend/supabase/migrations/` to add missing fields (`middle_initial`, `avatar_url`, `age`, `civil_status`, `religion`, `occupation`, `contact_no`, `street`, `barangay_code`, `city_municipality_code`, `province_code`, `philhealth_no`). Requires manual application via Supabase CLI (`db push` or `migration up`).
        *   Updated the `Profile` interface in `carepop-mobile/src/utils/supabase.ts` to include all fields defined in the new schema.
        *   Refactored `carepop-mobile/src/screens/MyProfileScreen.tsx`:
            *   Integrated `useAuth` to fetch and display profile data from context.
            *   Implemented loading and error states.
            *   Removed placeholder data and temporary `DisplayProfile` interface, now uses the updated `Profile` type.
            *   Ensured profile fields are accessed safely (handling nulls).
            *   Corrected the `signOut` function call, resolving previous linter errors.
            *   Added navigation to `EditProfileScreen`.
    *   Rationale: Align backend schema, frontend type definitions, and profile display component to resolve data inconsistencies and blockers. Improve code quality and robustness of `MyProfileScreen`.
    *   Impact: Backend schema now supports detailed profiles (pending migration application). `MyProfileScreen` correctly displays available profile data and handles loading/errors. The main blocker for `CreateProfileScreen` is now primarily the application of the DB migration. Linter errors in `MyProfileScreen` resolved.
    *   Ticket(s) Referenced: `USER-PROF-1` (Schema Definition - Now Addressed), `USER-PROF-3` (View Profile Screen - Now Addressed by `MyProfileScreen`), related to `USER-PROF-2` (Create Profile Blocker).

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Visually overhauled Onboarding Screens and temporarily set onboarding to always show.
    *   Description: 
        1.  Refactored `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, and `OnboardingScreenThree.tsx` to use full-screen `ImageBackground` components with PNG assets.
        2.  Adjusted text element styling (headlines, body text, taglines, progress indicators) for better readability over the background images, including adding a semi-transparent overlay.
        3.  Modified `App.tsx` to temporarily bypass the `AsyncStorage` check for `ONBOARDING_COMPLETE_KEY`. The `hasOnboarded` state is initialized to `false`, forcing the onboarding carousel to display every time the app starts before the authentication flow. The `handleOnboardingComplete` function in `App.tsx` still correctly sets this to `true` upon completion of the final onboarding screen to allow progression to auth/main app.
    *   Reason: Improve visual appeal and user experience of onboarding screens. Facilitate easier testing and iteration of the onboarding flow by making it always visible.
    *   Impact: Onboarding screens have a new full-screen background image design. `App.tsx` logic changed to always show onboarding for development/testing. `react-native-reanimated-carousel` is now directly used in `App.tsx` for the onboarding sequence.
    *   Ticket(s) Referenced: `ONBOARDING-1`, `ONBOARDING-2`, `ONBOARDING-3`, `ONBOARDING-4`, `ONBOARDING-5` (related to flow control).

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Reverted Onboarding Screen design to smaller images and separate text.
    *   Description: 
        1.  Reverted `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, and `OnboardingScreenThree.tsx` from using full-screen `ImageBackground` back to using standard `Image` components with a defined size (e.g., 250x250).
        2.  Adjusted stylesheets to position the image, text content (headline, body, tagline), and progress indicator/button as distinct blocks, typically with the image at the top, followed by text, and then the button/indicator.
        3.  Removed the semi-transparent overlay and reverted text colors to their original theme colors (e.g., primary for headlines, default text color for body).
    *   Reason: User request to change the visual style back from full-screen backgrounds to smaller, distinct images.
    *   Impact: Onboarding screens now display images as separate elements rather than backgrounds. Overall layout and styling adjusted to accommodate this change. The temporary `App.tsx` modification to always show onboarding remains in place for testing.
    *   Ticket(s) Referenced: `ONBOARDING-1`, `ONBOARDING-2`, `ONBOARDING-3`, `ONBOARDING-4`.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Modified App.tsx to display JS Splash Screen during initial loading.
    *   Description: Changed `App.tsx` to render the `CustomSplashScreen` component (from `screens/Onboarding/SplashScreen.tsx`) when the `isAppLoading` state is true. This replaces the previous `ActivityIndicator` view, ensuring the designed JS splash screen is shown after the native splash hides and before the onboarding/main app content is ready.
    *   Reason: User reported not seeing the designed splash screen. This change ensures its visibility during the app's JavaScript loading phase.
    *   Impact: The JS-based splash screen will now be visible. The temporary modification to always show onboarding remains.
    *   Ticket(s) Referenced: `ONBOARDING-1`, `ONBOARDING-5` (related to app flow).

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Extended JS Splash Screen duration in App.tsx.
    *   Description: Introduced a new state `showCustomSplashOverride` in `App.tsx`. After technical loading finishes (`isAppLoading` becomes false), a timer is set. The `CustomSplashScreen` is now rendered if either `isAppLoading` OR `showCustomSplashOverride` is true. This keeps the JS splash visible for a set duration (e.g., 2 seconds) after initial assets are loaded.
    *   Reason: Ensure the designed JS splash screen is visible for a noticeable period before transitioning to onboarding.
    *   Impact: JS splash screen duration is extended. Also reviewed relevant JSX for potential causes of "Text strings must be rendered within a <Text> component" error, but no obvious issues found in this pass.
    *   Ticket(s) Referenced: `ONBOARDING-1`, `ONBOARDING-5`.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Replaced text title with logo image on Auth screens.
    *   Description: Modified `LoginScreen.tsx` and `RegisterScreen.tsx` to replace the `<Text>` component displaying "CarePoP"/"carepop" with an `<Image>` component using the `carepop-logo-pink.png` asset. Adjusted styles for logo size and spacing.
    *   Reason: User request to use the logo instead of text for branding on authentication screens.
    *   Impact: Login and Register screens now display the pink logo at the top instead of text.
    *   Ticket(s) Referenced: `AUTH-4`, `AUTH-5` (UI aspects).

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Changed primary application font from Inter to Space Grotesk.
    *   Description: Installed `@expo-google-fonts/space-grotesk`. Updated `App.tsx` to load `SpaceGrotesk_400Regular` and `SpaceGrotesk_700Bold` instead of the Inter variants. Updated `src/components/theme.ts` to reference the Space Grotesk font names in the `typography` section.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Resolved 'Text string' warning and standardized icons.
    *   Description: Debugged the `Warning: Text strings must be rendered within a <Text> component.` The warning was unexpectedly resolved by removing specific comment patterns (`{/* --- ... --- */}`) from the onboarding screen components. Unused `navigation` props were removed from onboarding screens. Drawer icons in `App.tsx` were standardized to use `Ionicons` instead of `MaterialIcons`.
    *   Reason: Eliminate warning, improve code cleanliness and UI consistency.
    *   Impact: Text warning resolved. Onboarding components cleaner. Drawer UI uses consistent icon set.

*   Timestamp: TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - Action: Committed and pushed Memory Bank updates and recent code changes.
    *   Description: Staged and committed changes including Memory Bank reformatting/updates, `App.tsx` navigation structure changes, `ForgotPasswordScreen` UI update, icon standardization, and onboarding prop cleanup. Pushed commit 9b848e6 to `origin main`.
    *   Reason: Save progress and synchronize with remote repository.
    *   Impact: Local and remote repositories reflect the latest state.

---
## Archived Context Snapshots from activeContext.md

*   **Timestamp:** TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - **Action:** Archived historical context snapshot.
    *   **Source:** `activeContext.md`
    *   **Snapshot Title:** Active Context - 2024-07-09 (End of Session)
    *   **Content Archived:**
        Previous Focus: Debugging Android build errors and refining `CreateProfileScreen` UI in `carepop-mobile`.

        Current State & Accomplishments:
        *   Successfully resolved Android build issues (dependencies, NDK, Reanimated linking).
        *   Successfully resolved Metro bundler issues (module resolution, `ws`/`stream`).
        *   `carepop-mobile` now builds and runs on Android.
        *   `CreateProfileScreen.tsx` UI significantly updated:
            *   Added fields: Middle Initial, DOB, Age (calculated), Civil Status, Religion, Occupation, Address (Street, Province, City, Barangay), Contact No., PhilHealth No.
            *   Implemented `DateTimePicker` for DOB.
            *   Implemented `Picker` for Civil Status.
            *   Switched address data source from API attempt to local JSON files (`src/data/*.json` from `isaacdarcilla/philippine-addresses`).
            *   Implemented cascading `Picker` components for Province -> City/Municipality -> Barangay using local JSON.
            *   Refactored pickers to use consistent "tap-to-show" UI pattern.
        *   Restored normal authentication flow logic in `App.tsx`, removing temporary override.

        Immediate Next Steps (Logical):
        1.  Backend: Update Supabase `profiles` table schema to include all new columns required by `CreateProfileScreen` (middle_initial, date_of_birth, age, civil_status, religion, occupation, street, province_code, city_municipality_code, barangay_code, contact_no, philhealth_no). This is a blocker for saving profiles.
        2.  Mobile: Implement UI for `FEAT-AUTH-SIGNUP` and `FEAT-AUTH-LOGIN` screens.
        3.  Testing: Fully test the profile creation flow after the backend schema is updated.

        Open Questions/Considerations:
        *   Confirm exact Supabase column names match the keys used in `CreateProfileScreen`'s `profileData` object.
        *   Address potential app bundle size increase due to large address JSON files (post-MVP optimization).
        *   Test iOS build/run process.

*   **Timestamp:** TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW - **Action:** Archived historical context snapshot.
    *   **Source:** `activeContext.md`
    *   **Snapshot Title:** Active Context (CarePoP Mobile & Web)
    *   **Content Archived:**
        Project Goal Focus: Continue refactoring `carepop-mobile` for clarity, efficiency, and robustness, while preparing for `carepop-web` development.

        Current Focus:
        *   Verifying the fix for the `ExpoLinearGradient` error.
        *   Finalizing Memory Bank updates for recent Onboarding and Auth UI changes, and the SplashScreen refactor.
        *   Next planned step: Refactor `EditProfileScreen.tsx` (USER-PROF-4) in `carepop-mobile`.

        Last Action Taken (Summary):
        *   Corrected relative image path for logo on `LoginScreen.tsx` and `RegisterScreen.tsx`.
        *   Changed application font from Inter to Space Grotesk.
        *   Replaced text title with pink logo image on `LoginScreen.tsx` and `RegisterScreen.tsx`. (Previous step, path was incorrect)
        *   Extended `CustomSplashScreen` visibility using a timer in `App.tsx` after initial loading.
        *   Modified `App.tsx` to render `CustomSplashScreen` during initial app loading phase (`isAppLoading` true).
        *   Reverted Onboarding Screen design to use smaller, distinct `Image` components instead of `ImageBackground`. Text and images are now separate elements.
        *   Visually overhauled Onboarding Screens (`One`, `Two`, `Three`) to use full-screen `ImageBackground` and styled text for readability. (Previous step, now reverted).
        *   Temporarily modified `App.tsx` to always show the onboarding flow before authentication for testing purposes. (This change remains).
        *   Adjusted onboarding screen visuals: Increased PNG image sizes and re-added 'Get Started' button to screen 3.
        *   Switched onboarding screen assets from SVG to PNG (`assets/onboarding-X.png`) in `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, `OnboardingScreenThree.tsx`.
        *   Resolved `ExpoLinearGradient` error (FE-SETUP-7) by removing the component from `SplashScreen.tsx` and replacing it with a solid background color and the app logo.
        *   Detailed content and swipe-based navigation defined for Onboarding screens (`ONBOARDING-2`, `ONBOARDING-3`, `ONBOARDING-4`).
        *   Implemented SplashScreen and initial Onboarding screen structures (`ONBOARDING-1` to `ONBOARDING-4`) in `carepop-mobile/screens/Onboarding/`.
        *   Refactored `LoginScreen.tsx` (AUTH-4) and `RegisterScreen.tsx` (AUTH-5) for consistent aesthetics; removed First/Last Name from Register.
        *   Previously: Drafted Supabase DB migration, updated `Profile` type, refactored `MyProfileScreen.tsx`.

        Last Action Taken (Details):
        *   Updated `source` prop in `LoginScreen.tsx` and `RegisterScreen.tsx` from `require('../../assets/carepop-logo-pink.png')` to `require('../assets/carepop-logo-pink.png')`.
        *   Installed `@expo-google-fonts/space-grotesk`. Updated font loading in `App.tsx` and font references in `src/components/theme.ts`. (Previous step)
        *   Added `showCustomSplashOverride` state to `App.tsx`. Set a timer to turn this `false` 2 seconds after `isAppLoading` becomes false. Render `CustomSplashScreen` if `isAppLoading || showCustomSplashOverride`. (Previous step)
        *   Reverted `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, `OnboardingScreenThree.tsx` to use `Image` components (e.g., 250x250) and adjusted styles to position image and text separately. Removed `ImageBackground` and overlays.
        *   Refactored `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, `OnboardingScreenThree.tsx` to use `ImageBackground` with respective PNGs, adjusted styles for text overlay, including a semi-transparent background for content. (Previous step, now reverted).
        *   Modified `App.tsx`: Initialized `hasOnboarded` state to `false`, commented out `AsyncStorage` read for `ONBOARDING_COMPLETE_KEY` in `useEffect`, adjusted app loading dependency array. Re-integrated `Carousel` component for onboarding display.
        *   Increased `width` and `height` for the `illustration` style in `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, `OnboardingScreenThree.tsx` (previous step, now superseded by `ImageBackground`).
        *   Edited `carepop-mobile/screens/Onboarding/SplashScreen.tsx` to remove `LinearGradient` and add an `Image` component for the logo.
        *   Specified content and swipe navigation for `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, `OnboardingScreenThree.tsx`.
        *   Created `SplashScreen.tsx`, `OnboardingScreenOne.tsx`, `OnboardingScreenTwo.tsx`, `OnboardingScreenThree.tsx` in `carepop-mobile/screens/Onboarding/`.
        *   Updated UI of `LoginScreen.tsx` and `RegisterScreen.tsx`.
        *   Removed first name and last name fields from registration.
        *   Previously: Created `..._add_detailed_profile_fields.sql` migration, updated `Profile` interface, modified `MyProfileScreen.tsx`.

        Key Learnings/Observations from Last Action:
        *   Corrected image path should resolve the asset loading error on Auth screens.
        *   Application should now be using Space Grotesk as the primary font. (Previous step)
        *   `App.tsx` logic modified to ensure `CustomSplashScreen` remains visible for a minimum duration post-technical load. (Previous step)
        *   `App.tsx` now attempts to show the JS-based `CustomSplashScreen` during its loading phase, which should make it visible after the native splash screen.
        *   Onboarding screens display images as smaller, distinct elements, with text positioned separately.
        *   The styling has been reverted to accommodate this layout, removing overlays and adjusting text colors and spacing.
        *   `App.tsx` continues to be temporarily modified to always show the onboarding sequence for testing.
        *   The `react-native-reanimated-carousel`


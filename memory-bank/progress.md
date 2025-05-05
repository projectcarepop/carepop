# Progress: CarePoP/QueerCare

**IMPORTANT: Project Pivot (As of <Date_Placeholder>)**

> Due to persistent difficulties with the React Native CLI monorepo setup (detailed in historical context below), the project has **pivoted to using Expo CLI** for native application development. The following sections reflect the state *before* and *after* this pivot.

## Current Status (Expo CLI)

*   **Status:** Initializing new monorepo structure using Expo CLI.
*   **What Works (Expo):**
    *   (To be updated as setup progresses - e.g., Expo app initialized, monorepo structure configured)
*   **What's Left to Build (Immediate Focus - Expo Setup):**
    *   Finalize Expo monorepo initialization (e.g., `create-expo-app` template or manual Turborepo/pnpm integration).
    *   Configure shared packages (`ui`, `store`, etc.) for Expo compatibility.
    *   Determine and implement native styling strategy (Evaluate `expo-styling`, NativeWind v4, `StyleSheet`).
    *   Test basic shared UI component rendering in Expo Go / Dev Build.
    *   Integrate Expo Router (if chosen).
    *   Establish basic Expo build/dev workflows (`pnpm run dev`, EAS builds).
*   **Known Issues (Expo):**
    *   (To be updated as issues arise)
*   **Decisions/Evolutions (Expo):**
    *   Decision made to pivot from RN CLI to Expo CLI to mitigate build/config complexities.

---

## Historical Context (Pre-Expo Pivot - React Native CLI)

> _The following sections describe the progress, issues, and decisions related to the **previous React Native CLI-based monorepo attempt**, which has now been superseded by the pivot to Expo CLI._

### Progress Log (RN CLI)

**Last Status (RN CLI):** Completed styling enhancements for core UI components (`Button`, `Card`, `TextInput`, `Checkbox`, `RadioButton`, `RadioGroup`, `Switch`) in `packages/ui` based on UI design guidelines. Monorepo build/dev environment was stable for web; native app required setup/stabilization and faced significant blockers.

**What Worked (RN CLI):**
*   **FE Monorepo:** Turborepo structure stable and functional.
*   **FE Web (`apps/web`):
    *   Built and ran.
    *   Configured with Tailwind CSS and `react-native-web`.
    *   Rendered shared UI components correctly, including the latest styling enhancements.
*   **FE NativeApp (`apps/nativeapp` - RN CLI):
    *   Previous builds successful *after* significant Gradle/Metro configuration workarounds.
    *   Rendered basic shared UI (`StyleSheet`-based) after aggressive cleaning.
*   **Shared UI (`packages/ui` - RN CLI Context):
    *   `Button`, `Card`, `TextInput`, `Checkbox`, `RadioButton`, `RadioGroup`, `Switch` components implemented using `StyleSheet`.
    *   Styling Enhanced based on UI guidelines.
    *   Shared `theme.ts` defined and utilized.

**What Was Left (RN CLI Focus):**
*   Plan & Initialize Native App (Target RN version, setup).
*   Verify Native Rendering (Ensuring enhanced components worked reliably).
*   Resolve Native Metro Port Conflict (Port 8081 `EADDRINUSE`).
*   Implement Google OAuth (Web).
*   Expand Shared UI Library.
*   Integrate UI in Apps.
*   State Management setup.
*   Authentication Flow implementation.

**Known Issues (RN CLI):**
*   Persistent TS/Linter errors for module resolution in IDE.
*   Web app hydration errors sometimes.
*   **BLOCKER: Native Metro Port Conflict:** Port 8081 (`EADDRINUSE`) blocked native development.
*   Potential platform visual differences.
*   General build fragility requiring frequent aggressive cleaning.

**Decisions/Evolutions (RN CLI):**
*   Confirmed `StyleSheet` + theme tokens as the *only stable* styling approach found for `packages/ui` in the RN CLI context.
*   Completed styling enhancements for core UI components.
*   Multiple attempts/reverts for styling (NativeWind, styled-components failed).
*   Multiple monorepo restarts due to build/config issues.
*   Extensive manual configuration required (Gradle paths, Metro config, pnpm overrides).

### Progress & Current Status (RN CLI - Detailed Snapshot)

#### What Worked (RN CLI)

*   **Monorepo Structure:** Turborepo setup with pnpm was functional.
*   **Web App (`apps/web`):** Basic Next.js app with Tailwind CSS ran correctly.
*   **Native App (`apps/nativeapp` - RN CLI):
    *   Basic React Native app ran on Android.
    *   Builds succeeded *after* Gradle path modifications.
    *   Metro bundler configured for monorepo ran.
    *   Shared UI (`packages/ui`): Basic `Button` component using `StyleSheet` rendered correctly after resolving "Objects are not valid..." error.
*   **Shared Theme (`packages/ui/src/theme.ts`):** Basic theme tokens defined.
*   **Font Integration:** Inter font configured for web and native (manual linking).
*   **React Version:** Forced to `18.2.0` via `pnpm.overrides`.

#### What Was Left (RN CLI Immediate Focus)

*   Test `Radio*` components.
*   Expand Shared UI Library (`packages/ui`) using `StyleSheet`.
*   Integrate UI in Apps.
*   State Management (`packages/store`) setup.
*   Authentication Flow UI.

#### Current Status Summary (RN CLI - Before Pivot)

The foundational RN CLI monorepo setup was achieved, but was fragile and required significant workarounds. The primary blocker (rendering shared UI in native) was resolved by reverting to `StyleSheet`, but other issues (Metro port conflict, build stability) remained.

#### Known Issues (RN CLI - Before Pivot)

*   TypeScript IDE/Linter errors for module resolution.
*   Web app hydration errors.
*   **BLOCKER: Native Metro Port Conflict:** Port 8081 (`EADDRINUSE`).
*   Switch visual differences.

#### Evolution of Decisions (RN CLI - Before Pivot)

*   Abandonment of NativeWind and `styled-components` due to build/type/stability errors.
*   Confirmation of `StyleSheet` + theme tokens as the reluctant but working approach.

### What Worked (Overall - Before Pivot)

*   Backend Infrastructure & Core Logic (Supabase + Cloud Run).
*   Backend Auth Endpoints (Register, Login).
*   Backend Profiles Table & Basic RLS.
*   **Frontend Monorepo Structure (`carepop-monorepo`) established.**
*   **`apps/web` Development Server functional.**
*   **`apps/nativeapp` (RN CLI) Development Server started.**
*   **`apps/nativeapp` (RN CLI) Android Build succeeded (with hacks).**

### What Was Left (High Level - Before Pivot)

*   **Frontend Monorepo Setup (RN CLI):**
    *   Configure shared `packages/ui` (StyleSheet approach).
    *   Test Shared UI reliably.
    *   Configure shared `typescript-config`.
    *   Configure shared `packages/store`.
*   **Phase 1 (MVP) - Frontend Implementation (RN CLI):**
    *   Implement Auth UI.
    *   Implement Profile Management UI.
    *   Implement Basic Appointment Scheduling UI.
    *   Implement Basic Provider Directory UI.
    *   Implement DPA Consent UI flow.
*   **Phase 1 (MVP) - Backend Refinements:** (Unaffected by frontend pivot)
    *   Refine RLS policies (Epic 3).
    *   Implement Profile Update endpoint (Epic 4).
    *   Implement foundational DPA consent logic (Epic 3).
*   **Phase 2 & 3:** As previously outlined.

*(Refer to `epics_and_tickets.md` for detailed task breakdown)*

### Known Issues (RN CLI - Overall)

*   Previous BLOCKERS related to Gradle/Metro resolved via specific workarounds (modifying Gradle paths, commenting Metro `blockList`).
*   Peer Dependency Warnings.
*   Potential Production Build issues.

### Evolution of Project Decisions (RN CLI - Detailed)

*   Initial state: Supabase + Cloud Run architecture.
*   Initial Decision: Prioritize React Native CLI over Expo.
*   (Other backend/state decisions...)
*   **Decision:** Abandoned initial frontend attempts.
*   **Decision:** Restarted frontend using RN CLI Monorepo (Turborepo/pnpm), Next.js, NativeWind.
*   **Decision:** Multiple restarts/reconfigurations due to build errors (NativeWind, Gradle, Metro).
*   **Decision:** Removed NativeWind, switched to `StyleSheet` for native.
*   **Decision:** Resolved build issues via manual Gradle/Metro path/config adjustments.
*   **Outcome (RN CLI):** Monorepo *technically* functional but fragile and complex to maintain.

### Current Status (RN CLI - Component Level - Before Pivot)

*   **Core UI Components (@repo/ui):** (`Button`, `Card`, `TextInput`, `Checkbox`, `RadioButton`/`Group`, `Switch`) functional using `StyleSheet`.
*   **Platform Setup:** `apps/web` running. `apps/nativeapp` (RN CLI) setup, **Metro blocked by port 8081 conflict.**
*   **Tooling:** Icons (`react-native-vector-icons`) working after complex setup.

### What Worked (RN CLI - Component Level)

*   Basic UI components rendered/functioned on web and native (when Metro could run).
*   Theme colors applied.
*   Monorepo shared UI code.
*   Platform-specific file resolution worked.

### What Was Left / Next Steps (RN CLI - Before Pivot)

*   Implement User Registration Form.
*   **Resolve Native Metro Port Conflict (BLOCKER).**
*   Develop Core App Features.
*   Add State Management.
*   Backend Integration.
*   Testing.

## Progress: CarePoP/QueerCare

## Progress Log

**Current Status:** Completed styling enhancements for core UI components (`Button`, `Card`, `TextInput`, `Checkbox`, `RadioButton`, `RadioGroup`, `Switch`) in `packages/ui` based on UI design guidelines. Monorepo build/dev environment remains stable for web; native app requires setup/stabilization.

**What Works:**
*   **FE Monorepo:** Turborepo structure stable and functional.
*   **FE Web (`apps/web`):
    *   Builds and runs.
    *   Configured with Tailwind CSS and `react-native-web`.
    *   Renders shared UI components correctly, including the latest styling enhancements.
*   **FE NativeApp (`apps/nativeapp`):
    *   Previous builds successful after Gradle/Metro configuration.
    *   **Currently Needs Setup:** Requires setup/initialization for the target React Native version.
*   **Shared UI (`packages/ui`):
    *   `Button`, `Card`, `TextInput`, `Checkbox`, `RadioButton`, `RadioGroup`, `Switch` components implemented using `StyleSheet`.
    *   **Styling Enhanced:** All components updated based on UI guidelines (hierarchy, spacing, feedback, contrast, accessibility).
    *   Shared `theme.ts` defined and utilized.

**What's Left to Build (Immediate Focus):**
*   **Plan & Initialize Native App:** Determine target RN version and set up the `nativeapp` environment within the monorepo.
*   **Verify Native Rendering:** Ensure enhanced shared UI components render correctly in the native app.
*   **Resolve Native Metro Port Conflict:** Fix the port 8081 `EADDRINUSE` error.
*   **Implement Google OAuth (Web):** Connect "Sign up with Google" button.
*   **Expand Shared UI Library (`packages/ui`):** Implement next core components (e.g., `Form`, Modals).
*   **Integrate UI in Apps:** Start using shared components to build actual screens/pages (e.g., Registration, Login).
*   **State Management:** Set up shared state (`packages/store`).
*   **Authentication Flow:** Implement full UI screens and logic.

**Known Issues:**
*   Persistent TS/Linter errors for module resolution in IDE.
*   Web app hydration errors sometimes (likely browser extensions).
*   **Native Metro Port Conflict:** Port 8081 (`EADDRINUSE`) blocks native development.
*   Potential platform visual differences (e.g., Switch component).

**Decisions/Evolutions:**
*   Confirmed `StyleSheet` + theme tokens as the styling approach for `packages/ui`.
*   Completed styling enhancements for all core UI components based on provided guidelines.
*   Previous: Removed unused folders, configured RNW, added flags, reverted font changes.

## Progress & Current Status

### What Works

*   **Monorepo Structure:** Turborepo setup with pnpm is functional.
*   **Web App (`apps/web`):** Basic Next.js app with Tailwind CSS runs correctly.
*   **Native App (`apps/nativeapp`):**
    *   Basic React Native app runs on Android.
    *   Builds successfully after Gradle path modifications.
    *   Metro bundler configured for monorepo runs.
    *   **Shared UI (`packages/ui`):** Basic `Button` component using `StyleSheet` and theme tokens renders correctly in `nativeapp`. The previous rendering error ("Objects are not valid...") is resolved.
*   **Shared Theme (`packages/ui/src/theme.ts`):** Basic theme tokens (colors, spacing, etc.) are defined.
*   **Font Integration:** Inter font configured for web and native (manual linking).
*   **React Version:** Forced to `18.2.0` via `pnpm.overrides`.

### What's Left to Build (Immediate Focus)

*   **Test `Radio*`:** Integrate and test the new Radio components in both `nativeapp` and `apps/web`.
*   **Expand Shared UI Library (`packages/ui`):**
    *   Implement core components (Card, Input, Headers, etc.) using `StyleSheet`.
    *   Refine styling and variants for existing components (Button).
*   **Integrate UI in Apps:** Use the shared components consistently in both `web` and `nativeapp`.
*   **State Management (`packages/store`):** Set up shared state (e.g., Redux Toolkit).
*   **Authentication Flow:** Implement UI screens for login, registration, etc.

### Current Status Summary

The foundational monorepo setup for both web and native apps is stable. The primary blocker related to rendering shared UI components in the native app has been resolved by reverting to a known good state and confirming the `StyleSheet` approach works. The immediate next steps involve expanding the shared UI library using `StyleSheet` and theme tokens.

### Known Issues

*   TypeScript errors persist in IDE/Linter regarding inability to find `@repo/ui` modules and its contents, despite runtime success. Likely an IDE/TS server issue needing restart or further investigation if it causes problems later.
*   Web app sometimes shows hydration errors likely caused by browser extensions.
*   **Native Metro Port Conflict:** Port 8081 (`EADDRINUSE`) prevents Metro bundler from starting. User has deferred resolution.
*   **Switch Visual Difference:** Native switch doesn't have an icon in the thumb like the (now unused) web version design iteration.

### Evolution of Decisions

*   **Initial Plan:** Use NativeWind/Tailwind for native styling.
    *   **Outcome:** Abandoned due to intractable Babel errors.
*   **Second Attempt:** Use `styled-components` for shared UI theming.
    *   **Outcome:** Abandoned due to build/type errors and introduction of rendering instability.
*   **Current Approach:** Use React Native `StyleSheet` with shared theme tokens (`packages/ui/src/theme.ts`) for `packages/ui` components. This approach is currently stable and functional.

## What Works

*   Backend Infrastructure & Core Logic (Supabase + Cloud Run).
*   Backend Auth Endpoints (Register, Login).
*   Backend Profiles Table & Basic RLS.
*   **Frontend Monorepo Structure (`carepop-monorepo`).**
*   **`apps/web` Development Server (Next.js + Tailwind).**
*   **`apps/nativeapp` Development Server (React Native Metro Bundler).**
*   **`apps/nativeapp` Android Build (Gradle build succeeds).**

## What's Left to Build (High Level - Based on Epics/Phases)

*   **Frontend Monorepo Setup:**
    *   ~~Re-initialize Turborepo monorepo.~~ (Done)
    *   ~~Configure pnpm hoisting (`.npmrc`).~~ (Done, but ineffective for Gradle)
    *   ~~Initialize `apps/nativeapp` (RN CLI).~~ (Done)
    *   ~~Initialize `apps/web` (Next.js).~~ (Done)
    *   ~~Establish basic monorepo build/dev workflows, verifying native Android build succeeds.~~ (Done)
    *   **Configure shared `packages/ui`:** Create basic shared components (e.g., Button) using `StyleSheet`.
    *   **Test Shared UI:** Render shared components in both `apps/web` (using RNW) and `apps/nativeapp`.
    *   Configure shared `packages/typescript-config` usage consistency.
    *   Configure shared `packages/store`.
*   **Phase 1 (MVP) - Frontend Implementation within Monorepo:**
    *   Implement Auth UI.
    *   Implement Profile Management UI.
    *   Implement Basic Appointment Scheduling UI.
    *   Implement Basic Provider Directory UI.
    *   Implement DPA Consent UI flow.
*   **Phase 1 (MVP) - Backend Refinements:**
    *   Refine RLS policies (Epic 3).
    *   Implement Profile Update endpoint (Epic 4).
    *   Implement foundational DPA consent logic (Epic 3).
*   **Phase 2 & 3:** As previously outlined.

*(Refer to `epics_and_tickets.md` for detailed task breakdown)*

## Known Issues

*   ~~BLOCKER: React Native Android builds fail within the pnpm monorepo due to Gradle being unable to find required scripts.~~ (Resolved by modifying Gradle paths)
*   ~~Metro bundler fails to resolve internal RN modules.~~ (Resolved by modifying `metro.config.js` `blockList`)
*   ~~Web build/dev fails due to Tailwind config resolution / TS errors.~~ (Resolved)
*   Peer Dependency Warning in `apps/web`: Tailwind version mismatch (Low priority, may cause issues later).
*   Production build (`pnpm run build`) might still fail due to TypeScript/Next.js type resolution issues (Low priority for now).
*   Task Master AI tools fail (Low Priority).

## Evolution of Project Decisions

*   Initial state: Decision made to proceed with Supabase + Google Cloud Run hybrid architecture.
*   Decision made to prioritize React Native CLI over Expo.
*   Decision made to recommend Redux Toolkit for state management.
*   Decision made that application-level encryption (AES-256-GCM) is mandatory for SPI/PHI.
*   Decision made that SSR/SSG is required for public web pages.
*   Decision to handle auth via backend endpoints.
*   Decision to use `service_role` Supabase client for specific trusted server-side ops.
*   **Decision:** Abandoned initial frontend implementation due to build issues.
*   **Decision:** Restarted frontend using a Monorepo structure (Turborepo/pnpm) with Next.js (web), RN CLI (native), NativeWind styling, and shared packages, based on a detailed frontend plan.
*   **Decision:** Discarded first monorepo initialization attempt due to errors; proceeding with fresh `create-turbo` initialization.
*   **Decision:** Named the React Native application `nativeapp` during initialization.
*   **Decision:** Configured `metro.config.js` in `nativeapp` with monorepo settings (`watchFolders`, `nodeModulesPaths`, `extraNodeModules`, `blockList`, `server.enhanceMiddleware`).
*   **Decision:** Downgraded React/React-DOM to 18.2.0 across workspaces to match RN 0.73.8 dependency.
*   **Decision:** Removed NativeWind/Tailwind CSS from `apps/nativeapp` due to persistent build errors. Switched to standard React Native `StyleSheet` for native styling.
*   **Decision:** Re-initialized monorepo after resolving initial Babel errors.
*   **Decision:** Deleted the re-initialized monorepo again after encountering persistent Android Gradle build failures related to pnpm path resolution.
*   **Decision (Attempt 3):** Initialized monorepo, configured `.npmrc` (ineffective for Gradle), manually set up `apps/web`, created shared Tailwind config, initialized `apps/nativeapp`.
*   **Decision:** Resolved `web` dev issues by using relative path + `require` for Tailwind config and `React.FC` for layout type.
*   **Decision:** Resolved Android Gradle build issues by modifying `settings.gradle` and `app/build.gradle` to point directly to root `node_modules`.
*   **Decision:** Resolved Metro bundler issues by commenting out `blockList` entry for RN Devtools path.
*   **Outcome:** Monorepo development environment is now functional for both web and native apps.

## Current Status

*   **Core UI Components (@repo/ui):**
    *   `Button`: Functional (Primary, Secondary Solid/Outline, Destructive variants). Styles refined.
    *   `Card`: Basic container functional.
    *   `TextInput`: Functional with label, placeholder, helper text, error state, leading/trailing icons.
    *   `Checkbox`: Functional with label, disabled state. Style refined.
    *   `RadioButton`/`RadioGroup`: Functional with label, disabled state. Style refined.
    *   `Switch`: Functional. Uses platform-specific implementations (`.web.tsx`, `.native.tsx`) for consistent styling goals (pink 'on' track, white thumb). Native version uses standard `RNSwitch` (no thumb icon), Web uses custom divs/Tailwind.
*   **Platform Setup:**
    *   `apps/web`: Next.js app running, displaying UI components, Tailwind configured.
    *   `apps/nativeapp`: React Native app setup, dependencies linked. **Metro bundler currently blocked by port 8081 conflict (`EADDRINUSE`).**
*   **Tooling:** Icons (`react-native-vector-icons`) working on both platforms.

## What Works

*   Basic UI components render and function on both web and native (assuming native Metro can be started).
*   Theme colors are applied correctly.
*   Monorepo structure allows sharing UI code.
*   Platform-specific file resolution (`.web.tsx`, `.native.tsx`) is working for the Switch.

## What's Left / Next Steps

*   **Implement User Registration Form:** Utilize existing UI components.
*   **Resolve Native Metro Port Conflict:** The `EADDRINUSE` error for port 8081 needs to be fixed to allow native development/testing.
*   **Develop Core App Features:** Move beyond basic UI components.
*   **Add State Management:** Implement more robust state management if needed (beyond local component state).
*   **Backend Integration:** Connect forms/actions to the backend (Supabase).
*   **Testing:** Implement unit/integration/E2E tests.
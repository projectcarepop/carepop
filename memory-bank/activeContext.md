# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Goal:** Verify that `apps/nativeapp` starts correctly after removing NativeWind/Tailwind CSS.
*   **Action:** Checking Metro bundler output from `pnpm run dev`.

## Current Focus

*   **Verify `apps/nativeapp` build success.**

## Recent Changes & Decisions

*   **Decision:** Abandoned previous `carepop-frontend` implementation due to persistent build issues and desire for a cleaner setup.
*   **Decision:** Adopted a Monorepo structure (using Turborepo/pnpm) for frontend development (`carepop-monorepo`).
*   **Decision:** **Discarded the initial Turborepo setup attempt due to errors and opted for a complete re-initialization.**
*   **Decision:** Confirmed the detailed frontend architecture:
    *   `apps/nativeapp`: RN CLI (Initialized, BLOCKED by Babel error), React Navigation.
    *   `apps/web`: Next.js (Initialized, basic dev works), Next.js Router, React Native Web.
    *   `packages/ui`: Shared RN components styled with NativeWind `className`.
    *   `packages/config`: Shared Tailwind config.
    *   `packages/store`: Shared Redux Toolkit logic.
    *   `packages/types`: Shared TypeScript types.
    *   Separate Public Landing Pages / Admin UI project (likely using Next.js) to be created later.
*   Backend setup (Supabase + Cloud Run) remains as previously established.
*   **Decision:** Downgraded React/React-DOM to `18.2.0` across workspaces to align with `react-native@0.73.8`.
*   **Decision:** Configured `metro.config.js` and `babel.config.js` (including NativeWind plugin) for monorepo setup.
*   **Decision:** Tested shared component (`@repo/ui/button`) usage in both apps (initially with NativeWind).
*   **Decision:** Abandoned NativeWind/Tailwind CSS for `apps/nativeapp` due to persistent Babel errors (`.plugins is not a valid Plugin property`). Shifted to standard `StyleSheet` styling for native components.

## Next Steps

1.  ~~Initialize the Turborepo monorepo structure using `npx create-turbo@latest` (using `pnpm`).~~ (Done)
2.  ~~Remove `apps/docs`.~~ (Done)
3.  ~~Initialize `apps/nativeapp` (React Native CLI).~~ (Done)
4.  ~~Ensure basic monorepo build/dev commands work.~~ (Web works, Native blocked)
5.  ~~Refine `apps/web` (Next.js setup, TypeScript, Tailwind integration).~~ (Basic Tailwind setup done)
6.  ~~Configure shared `packages/config` (Tailwind, TSConfig) and `packages/ui` (basic setup).~~ (Tailwind config now only applies to web, UI uses StyleSheet for native)
7.  ~~Diagnose and fix the `apps/nativeapp` Babel error (`.plugins is not a valid Plugin property`).~~ (Resolved by removing NativeWind)
8.  **Verify `apps/nativeapp` starts correctly with Metro bundler.**
9.  Test the updated shared Button component in `apps/nativeapp`.
10. Test the shared Button component in `apps/web` (may require adjustments as it still uses Tailwind/NativeWind via RNW).
11. Address peer dependency warnings (related to Tailwind v4 in web context).
12. Define a consistent styling strategy for shared components across `apps/web` (Tailwind/RNW) and `apps/nativeapp` (StyleSheet).

## Active Decisions & Considerations

*   **Frontend Architecture:** Committed to the Monorepo structure and detailed frontend plan (Next.js + RN CLI + NativeWind + Shared Packages).
*   **State Management:** Redux Toolkit remains the recommended choice for shared state (`packages/store`).
*   **Styling:** NativeWind with a shared Tailwind config is the standard (`packages/ui`, `packages/config`).
*   **Backend Architecture:** Supabase + Google Cloud Run hybrid remains unchanged.
*   **Access Control:** Supabase RLS + Cloud Run checks remain the standard.
*   **Encryption:** Application-level AES-256-GCM for SPI/PHI remains required.

## Important Patterns & Preferences

*   **Monorepo Structure:** `apps/nativeapp`, `apps/web`, `packages/ui`, `packages/config`, `packages/store`, `packages/types` managed by Turborepo/pnpm.
*   **Styling:** 
    *   `apps/nativeapp`: Standard React Native `StyleSheet`.
    *   `apps/web`: Tailwind CSS (via `packages/config`) potentially using React Native Web for component compatibility.
    *   `packages/ui`: Components primarily use `StyleSheet`. Need strategy for web compatibility/styling overrides (e.g., platform-specific files, conditional styling).
*   **Navigation:** React Navigation in `apps/nativeapp`, Next.js Router in `apps/web`. Callbacks for shared components.
*   **State:** Shared RTK slices in `packages/store`, Provider setup in each app.
*   **Backend:** Node.js/TypeScript on Google Cloud Run, using Express. Supabase (PostgreSQL, Auth, RLS).
*   **Security:** SPI/PHI requires application-level AES-256-GCM encryption. RLS primary access control. Secrets in GCP Secret Manager.
*   **Infrastructure:** Staging environment (Supabase project, GCP Cloud Run) provisioned.
*   **CI/CD:** Backend pipeline exists. Frontend TBD.

## Learnings & Insights

*   Attempting complex cross-platform builds (RNW + NativeWind + Webpack) without a structured monorepo and clear configuration strategy led to persistent issues.
*   Adopting a standard monorepo setup (Turborepo) and leveraging framework conventions (Next.js for web) should provide a more stable foundation.
*   **React Native Metro bundler requires specific `watchFolders` and `nodeModulesPaths` configuration in `metro.config.js` for pnpm monorepos.**
*   React Native CLI init seems sensitive to command-line arguments in this environment; interactive prompts may be more reliable.
*   Clear definition of shared vs. app-specific code is crucial.
*   **Android SDK path in `local.properties` requires escaped backslashes (`\\`) and no trailing spaces.**
*   **Persistent Babel Error:** `.plugins is not a valid Plugin property` error in `apps/nativeapp` build was directly caused by the `nativewind/babel` plugin in the monorepo setup.
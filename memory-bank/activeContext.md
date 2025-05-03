# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Goal:** Successfully initialize a clean frontend monorepo structure.
*   **Action:** Prepare to re-run Turborepo initialization.

## Current Focus

*   **Re-initializing `carepop-monorepo`.**

## Recent Changes & Decisions

*   **Decision:** Re-initialized `carepop-monorepo` using `pnpx create-turbo` after initial Babel errors were resolved by removing NativeWind from `nativeapp`.
*   **Encountered Blocker:** Persistent Android build errors (`Could not read script ... native_modules.gradle`) due to path resolution conflicts between React Native's Gradle scripts and pnpm's hoisted `node_modules` structure.
    *   Attempts to fix by adjusting `settings.gradle` paths or adding local dependencies failed.
*   **Decision:** Deleted the `carepop-monorepo` directory *again* to ensure a completely clean slate before trying a different setup strategy (e.g., configuring pnpm hoisting via `.npmrc` immediately after initialization).

## Next Steps

1.  **Re-run `pnpx create-turbo@latest carepop-monorepo`.**
2.  Immediately configure pnpm hoisting via `.npmrc` (e.g., `public-hoist-pattern[]=*react-native*`).
3.  Perform basic monorepo cleanup (remove `apps/docs`).
4.  Initialize `apps/nativeapp` (RN CLI, skip install).
5.  Initialize `apps/web` (Next.js).
6.  Run `pnpm install`.
7.  Configure `apps/nativeapp/android/settings.gradle` to use *local* `../node_modules` paths (as hoisting should be disabled for RN packages).
8.  Configure `apps/nativeapp/metro.config.js` for monorepo.
9.  Attempt `pnpm --filter nativeapp run android` build.

## Active Decisions & Considerations

*   **Frontend Architecture:** Still aiming for Monorepo (Next.js + RN CLI + Shared Packages), but acknowledging the friction between RN and pnpm.
*   **Styling:** Standard `StyleSheet` for `nativeapp`. Tailwind CSS for `apps/web`.
*   **Package Manager:** Sticking with pnpm for now, but attempting to configure hoisting explicitly via `.npmrc` as the next mitigation strategy.

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
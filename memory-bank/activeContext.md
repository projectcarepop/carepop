# Active Context: CarePop/QueerCare

## Current Work Focus

*   **Goal:** Restart frontend development using a Monorepo structure (Turborepo/pnpm) with Next.js (web), React Native CLI (native), and NativeWind, based on the detailed frontend plan provided.
*   **Action:** **Initialize a *new* Turborepo monorepo from scratch using `create-turbo`.**

## Current Focus

*   **Executing the `npx create-turbo@latest` command to scaffold the foundational monorepo structure (`carepop-monorepo`).**
*   Setting up the foundational monorepo structure (`carepop-monorepo`).
*   Configuring the `apps/web` (Next.js) and initializing `apps/native` (React Native CLI) applications.
*   Establishing shared packages (`packages/ui`, `packages/config`, `packages/store`, `packages/types`).

## Recent Changes & Decisions

*   **Decision:** Abandoned previous `carepop-frontend` implementation due to persistent build issues and desire for a cleaner setup.
*   **Decision:** Adopted a Monorepo structure (using Turborepo/pnpm) for frontend development (`carepop-monorepo`).
*   **Decision:** **Discarded the initial Turborepo setup attempt due to errors and opted for a complete re-initialization.**
*   **Decision:** Confirmed the detailed frontend architecture:
    *   `apps/native`: RN CLI, React Navigation.
    *   `apps/web`: Next.js, Next.js Router, React Native Web.
    *   `packages/ui`: Shared RN components styled with NativeWind `className`.
    *   `packages/config`: Shared Tailwind config.
    *   `packages/store`: Shared Redux Toolkit logic.
    *   `packages/types`: Shared TypeScript types.
    *   Separate Public Landing Pages / Admin UI project (likely using Next.js) to be created later.
*   Backend setup (Supabase + Cloud Run) remains as previously established.

## Next Steps

1.  **Initialize the Turborepo monorepo structure using `npx create-turbo@latest` (using `pnpm`).**
2.  Refine `apps/web` (Next.js setup, TypeScript, Tailwind integration).
3.  Remove `apps/docs` (if created by default) and initialize `apps/native` (React Native CLI).
4.  Configure shared `packages/config` (Tailwind, TSConfig) and `packages/ui` (basic setup).
5.  Ensure basic monorepo build/dev commands work.

## Active Decisions & Considerations

*   **Frontend Architecture:** Committed to the Monorepo structure and detailed frontend plan (Next.js + RN CLI + NativeWind + Shared Packages).
*   **State Management:** Redux Toolkit remains the recommended choice for shared state (`packages/store`).
*   **Styling:** NativeWind with a shared Tailwind config is the standard (`packages/ui`, `packages/config`).
*   **Backend Architecture:** Supabase + Google Cloud Run hybrid remains unchanged.
*   **Access Control:** Supabase RLS + Cloud Run checks remain the standard.
*   **Encryption:** Application-level AES-256-GCM for SPI/PHI remains required.

## Important Patterns & Preferences

*   **Monorepo Structure:** `apps/native`, `apps/web`, `packages/ui`, `packages/config`, `packages/store`, `packages/types` managed by Turborepo/pnpm.
*   **Styling:** NativeWind `className` props on RN primitives in `packages/ui`, shared `tailwind.config.js` in `packages/config`.
*   **Navigation:** React Navigation in `apps/native`, Next.js Router in `apps/web`. Callbacks for shared components.
*   **State:** Shared RTK slices in `packages/store`, Provider setup in each app.
*   **Backend:** Node.js/TypeScript on Google Cloud Run, using Express. Supabase (PostgreSQL, Auth, RLS).
*   **Security:** SPI/PHI requires application-level AES-256-GCM encryption. RLS primary access control. Secrets in GCP Secret Manager.
*   **Infrastructure:** Staging environment (Supabase project, GCP Cloud Run) provisioned.
*   **CI/CD:** Backend pipeline exists. Frontend TBD.

## Learnings & Insights

*   Attempting complex cross-platform builds (RNW + NativeWind + Webpack) without a structured monorepo and clear configuration strategy led to persistent issues.
*   Adopting a standard monorepo setup (Turborepo) and leveraging framework conventions (Next.js for web) should provide a more stable foundation.
*   Clear definition of shared vs. app-specific code is crucial.
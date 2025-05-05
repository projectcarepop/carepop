# Technology Context: CarePoP/QueerCare

## 1. Core Technologies

*   **Frontend Framework:** React Native (using CLI)
*   **Frontend Language:** TypeScript
*   **Backend Language:** Node.js (with TypeScript)
*   **Backend Hosting (Custom Logic):** Google Cloud Run
*   **Database / BaaS:** Supabase (providing PostgreSQL, Authentication, RLS, Storage, Edge Functions)

## 2. Frontend Stack Details

*   **Monorepo:** Turborepo / pnpm monorepo (`carepop-monorepo`).
*   **Package Manager:** pnpm (Note: Required specific Gradle path adjustments for RN Android).
*   **Web App (`apps/web`):**
    *   Framework: Next.js (v15.3.0, App Router)
    *   Language: TypeScript
    *   Styling: Tailwind CSS (v3.4.6, via `packages/config`, using relative path `require` in `tailwind.config.ts`).
    *   State Management: Redux Toolkit (planned).
    *   UI Components: Next.js components, shared components from `packages/ui` (via RNW).
*   **Native App (`apps/nativeapp`):**
    *   **Main Component File:** `apps/nativeapp/App.tsx` (Note: NOT `apps/nativeapp/src/App.tsx`).
    *   Framework: React Native CLI (v0.73.8)
    *   Language: TypeScript
    *   Styling: **React Native `StyleSheet` confirmed as the stable approach.**
    *   Navigation: React Navigation (planned).
    *   State Management: Redux Toolkit (planned).
    *   UI Components: Native components, shared components from `packages/ui` (using StyleSheet).
    *   **Android Build:** Requires paths in `settings.gradle` (line 2, 4) and `app/build.gradle` (line 118) to point to root `node_modules` (`../../../` and `../../../../` respectively) to find Gradle scripts.
    *   **Metro Config:** Requires `blockList` entry for `react-native/Libraries/Core/Devtools/` in `metro.config.js` to be commented out to prevent internal module resolution errors.
*   **Shared UI (`packages/ui`):**
    *   Purpose: Reusable React Native components.
    *   Styling: **`StyleSheet` confirmed as the stable approach, using tokens from `./theme.ts`.** Previous attempts with NativeWind/styled-components were reverted due to instability.
*   **Shared Tailwind Config (`packages/tailwind-config`):**
    *   Purpose: Base Tailwind config for `apps/web`.
    *   Structure: `package.json` (no `type: module`), `tailwind.config.js` (CommonJS).
*   **Shared TS Config (`packages/typescript-config`):** Planned.
*   **Shared State (`packages/store`):** Planned (Redux Toolkit).
*   **Shared Types (`packages/types`):** Planned.
*   **Build/Dev:** Turborepo, `pnpm run dev`, `pnpm run build` (Note: Production build currently has TS issues).

## 3. Backend Stack Details

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

## 4. Development Setup & Tooling

*   **Source Control:** Git.
*   **Monorepo Management:** Turborepo.
*   **Package Management:** pnpm (with `.npmrc` for non-Gradle related hoisting, e.g., `public-hoist-pattern[]=*react-native*`).
*   **CI/CD:** GitHub Actions (backend). Frontend TBD.
*   **Testing:** Jest.
*   **Local Development:** `pnpm run dev` starts both app servers. Requires emulator/device and browser.
*   **Debugging:** Flipper, Reactotron (Native); Next.js/React DevTools (Web); Standard Node.js debugging tools, Cloud Logging/Monitoring (Backend).
*   **Secrets:** GCP Secret Manager for cloud credentials, `.env` files within specific apps/packages for local development as needed.

## 5. Key Third-Party Services (Requires Vetting)

*   **Supabase:** (Core platform dependency)
*   **Google Cloud Platform:** (Core infrastructure dependency)
*   **Google Maps Platform:** (Mapping and Geocoding)
*   **Notification Provider:** (TBD - e.g., Twilio, AWS SNS/FCM)
*   **AI/NLP Service:** (TBD - e.g., AWS Comprehend Medical)
*   **Payment Gateway:** (TBD - if needed)

*Vetting Criteria:* Security posture, reliability, cost, and critically, compliance support (DPA guarantees, HIPAA BAA availability).

## 6. Technical Constraints & Considerations

*   **Compliance:** Strict adherence to Philippines DPA is mandatory. HIPAA compliance is a strategic goal.
*   **Security:** High priority due to sensitive health data (SPI/PHI). Requires robust implementation of encryption, access control (RLS + backend checks), secure coding, etc.
*   **Cross-Platform Consistency:** Core goal achieved via shared `packages/ui` styled with NativeWind. Requires careful component design and testing.
*   **Performance:** Needs proactive optimization (native rendering, web vitals, backend query/RLS performance).
*   **Scalability:** Leverage managed services (Supabase, Cloud Run) but requires monitoring and appropriate configuration.
*   **SEO:** Public web pages (Landing Pages, Directory in `apps/web`) must be discoverable, achieved via Next.js SSR/SSG.

### Frontend (`carepop-monorepo`)

*   **Structure:** Turborepo / pnpm monorepo.
*   **Web App (`apps/web`):**
    *   Framework: Next.js (App Router)
    *   Language: TypeScript
    *   Styling: Tailwind CSS (via `packages/config`), React Native Web (for potential `@repo/ui` component usage).
    *   State Management: Redux Toolkit (planned, via `packages/store`).
    *   UI Components: Primarily Next.js components, potentially shared components from `packages/ui`.
*   **Native App (`apps/nativeapp`):**
    *   Framework: React Native CLI (v0.73.8)
    *   Language: TypeScript
    *   Styling: **React Native `StyleSheet` confirmed.**
    *   Navigation: React Navigation (planned).
    *   State Management: Redux Toolkit (planned, via `packages/store`).
    *   UI Components: Primarily native components, shared components from `packages/ui` (using StyleSheet).
*   **Shared UI (`packages/ui`):**
    *   Purpose: House reusable React Native components for both web and native apps.
    *   Styling: **Primarily uses React Native `StyleSheet` confirmed.** Requires a strategy for web compatibility/styling (e.g., platform-specific files, conditional logic, potentially leveraging RNW + Tailwind on web).
*   **Shared Config (`packages/config`):**
    *   `tailwind-config`: Shared Tailwind CSS configuration (used by `apps/web`).
    *   `typescript-config`: Shared `tsconfig.json` presets (planned).
*   **Shared State (`packages/store`):** Redux Toolkit slices and store configuration (planned).
*   **Shared Types (`packages/types`):** TypeScript interfaces and types (planned).
*   **Build/Dev:** Turborepo orchestrates builds, `pnpm run dev` starts both apps.

**Frontend - Native (`apps/nativeapp`):**
*   **Framework:** React Native (v0.73.8)
*   **Language:** TypeScript
*   **Styling:** **Standard `StyleSheet` confirmed.** (Removed ambiguity about pending decision).
*   **Bundler:** Metro
*   **Build:** Android build successful via Gradle (requires manual path adjustments in `settings.gradle` and `app/build.gradle` for monorepo `node_modules`).
*   **Troubleshooting Notes:**
    *   Metro `blockList` might need adjustments if core RN modules fail to resolve.
    *   Persistent rendering errors (even with standard components) can indicate deep caching/build issues requiring aggressive cleaning (Gradle clean, delete `android/build` & `app/build`, delete all `node_modules` via explicit `rimraf` commands on Windows, reinstall). Monitor for `ERR_PNPM_EBUSY` on Windows and terminate blocking processes.

**Frontend - Web (`apps/web`):**
*   **Framework:** Next.js (v?.? - Check package.json)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (configured via `postcss.config.mjs` and `tailwind.config.ts`)

**Backend (`carepop-backend`):**
*   **Framework:** Node.js / Express
*   **Language:** TypeScript
*   **Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth
*   **Deployment:** (Likely GCP Cloud Run/Functions - TBD)

**Shared Packages:**
*   `packages/ui`:
    *   Targeting both React Native and React (Web).
    *   Currently uses basic `StyleSheet` for Button component (pending styling strategy decision).
    *   `theme.ts` exists with basic tokens.
*   Config packages (`eslint`, `typescript`, `tailwind`) ensure consistency.

**Development Environment:**
*   OS: Windows (requires careful handling of paths and processes, e.g., `rimraf` usage, `EBUSY` errors).
*   Editor: (User's choice, e.g., VS Code)
*   Version Control: Git / GitHub

**Tooling:**
*   `pnpm` for package management.
*   `Turborepo` for build/task orchestration.
*   `eslint`, `prettier` for code quality.
*   `typescript` for static typing.

## Learnings & Insights

*   Monorepo setups with RN + Web require careful configuration (`next.config.js` / `next.config.mjs` including `transpilePackages`, webpack aliases/loaders, `metro.config.js` settings, `pnpm` hoisting awareness in native build files like `build.gradle`).
*   `react-native-vector-icons` is generally preferred over `@expo/vector-icons` in bare RN CLI projects to avoid needing extra Expo modules/config. Requires native setup (`fonts.gradle`) and web setup (`transpilePackages`, webpack font loader, potentially explicit `loadFont()` or `@font-face` CSS).
*   ES Module (`"type": "module"`) in `package.json` requires config files like `next.config` to use `.mjs` extension and `import`/`export default` syntax. `__dirname` is not available.
*   Next.js config files must use `.js`, `.mjs`, or `.ts` extensions; `.cjs` is not supported.
*   Web hydration errors can often be caused by browser extensions modifying the DOM.
*   Aggressive caching (Metro, Next.js, Gradle, node_modules) can mask file changes and require thorough cleaning. 
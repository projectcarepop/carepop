# Active Context: CarePop/QueerCare

## Current Work Focus

**Restructuring the project into three distinct top-level applications (`carepop-backend/`, `carepop-nativeapp/`, `carepop-web/`) within the main Git repository. Preparing for a fresh Git history on the `main` branch via a force push to reflect this new simplified structure.**

## Recent Changes & Decisions

-   **MAJOR STRUCTURAL PIVOT (Current):**
    *   Abandoning the previous complex `carepop-frontend` monorepo structure (which included `apps/nativeapp`, `apps/web` (RNW), and `packages/ui`).
    *   Adopting a simplified top-level folder structure within the single `carepop` Git repository:
        1.  `carepop-backend/`: Existing backend application.
        2.  `carepop-nativeapp/`: The Expo (React Native) mobile application (contents migrated from `carepop-frontend/apps/nativeapp/`, with shared UI components from `carepop-frontend/packages/ui/` now integrated directly within it).
        3.  `carepop-web/`: The new Next.js, Tailwind CSS, Shadcn UI web application (contents migrated from the standalone `carepop-web-nextjs` project).
    *   This decision aims to simplify individual project development, build processes, and reduce monorepo tooling overhead while keeping all project code in one repository.
    *   **A force push to the `main` branch of the GitHub repository will be performed** to establish this new structure as the baseline, overwriting previous monorepo history.
    *   Updating all Memory Bank files to reflect this new architecture (IN PROGRESS).

-   **Previous Architectural Shift (Documentation Completed):**
    *   Decision to use Expo CLI for native mobile (iOS/Android only) and a separate Next.js/Tailwind/Shadcn UI web application.
    *   All Memory Bank files and `epics_and_tickets.md` were updated to reflect that dual-frontend approach, which is now being further refined by this structural simplification.

## Next Steps & Action Items

1.  **Finalize Manual File Organization (IMMEDIATE/IN PROGRESS):** Ensure `carepop-backend/`, `carepop-nativeapp/`, and `carepop-web/` directories in the local `carepop-final-structure` working copy contain all necessary files and no problematic nested `.git` or `node_modules` folders.
2.  **Initialize Git & Commit New Structure (IMMEDIATE):** In `carepop-final-structure`, initialize a new Git repository, add all files, and make an initial commit representing the new three-pillar structure.
3.  **Force Push to GitHub `main` (IMMEDIATE):** Add the remote `origin` and force push the new `main` branch to `https://github.com/projectcarepop/carepop.git`.
4.  **Complete Memory Bank Update (IN PROGRESS):** Finish updating all Memory Bank files to accurately reflect the new project structure and development approach.
5.  **Re-establish Local Development Workflows:** Document and test `npm install` / `npm run dev` (or equivalent) for `carepop-nativeapp` and `carepop-web` within the new structure.
6.  **Configure CI/CD:** Adapt or create new CI/CD pipelines for deploying `carepop-backend`, `carepop-nativeapp`, and `carepop-web` based on changes in their respective top-level directories.
7.  **Resume Feature Development:** Continue with planned feature development as outlined in `epics_and_tickets.md`, adjusting for the new structure.

## Active Decisions & Considerations

-   **Simplified Top-Level Structure:** The three distinct folders (`carepop-backend`, `carepop-nativeapp`, `carepop-web`) are the primary architectural pattern now.
-   **Force Push to `main`:** Acknowledged as necessary to reset the repository history to this cleaner structure. This requires coordination if other developers are involved.
-   **Independent Project Tooling:** Each of the three projects will largely manage its own dependencies (e.g., `package.json` in each) and build/dev scripts. Root-level monorepo tooling (like Turborepo or pnpm workspaces managing all three) is not currently planned unless a clear need for cross-project task running or linking arises (e.g., for shared types packages).
-   **Native App UI Integration:** Components from the old `packages/ui` are to be directly integrated into `carepop-nativeapp/src/...`.

## Learnings & Insights

-   Overly complex monorepo setups, especially with differing frontend technologies (RNW vs. Next.js) or when shared code is minimal, can introduce more overhead than benefit. Simplifying to distinct project folders within a single Git repository can be a pragmatic approach.
-   Clear communication and agreement are essential when planning repository history overwrites (force pushes).

*(Historical Context section from previous `activeContext.md` can be retained below if desired, but ensure it's clearly marked as pre-dating this latest structural pivot)*
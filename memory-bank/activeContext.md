\# Active Context: CarePoP/QueerCare

\#\# Current Work Focus

\*\*Implementing the core authentication flow based on the finalized three-pillar architecture.\*\* This involves:  
1\.  Applying the \`handle\_new\_user\` database trigger in the \*\*Supabase\*\* project (\`carepop-backend\`).  
2\.  Refactoring the authentication service/context and UI screens (Login, Registration) in the \*\*native mobile app\*\* (\`carepop-nativeapp/\`) to use direct Supabase JS SDK calls (\`signUp\`, \`signInWithPassword\`).  
3\.  Implementing secure session/token storage and management within the \*\*native mobile app\*\* (\`carepop-nativeapp/\`) using the Supabase JS SDK and potentially \`expo-secure-store\`.  
4\.  Thoroughly testing the end-to-end registration \-\> profile creation \-\> login \-\> session persistence \-\> logout flow on the native mobile app.

\#\# Recent Changes & Decisions

\-   \*\*MAJOR STRUCTURAL PIVOT (Completed):\*\*  
    \*   Abandoned the previous complex \`carepop-frontend\` monorepo structure.  
    \*   Adopted and implemented a simplified top-level folder structure within the single \`carepop\` Git repository:  
        1\.  \`carepop-backend/\`: Existing backend application (Node.js/Cloud Run \+ Supabase).  
        2\.  \`carepop-mobile/\`: The Expo (React Native) mobile application for iOS/Android ONLY. Code migrated from previous structure.  
        3\.  \`carepop-web/\`: The separate Next.js, Tailwind CSS, Shadcn UI web application. Code migrated from previous standalone project.  
    \*   This structure simplifies individual project development and build processes.  
    \*   \*\*A force push to the \`main\` branch of the GitHub repository (\`https://github.com/projectcarepop/carepop.git\`) was performed\*\*, establishing this new structure as the baseline and resetting the \`main\` branch commit history.  
    \*   All Memory Bank files (\`epics\_and\_tickets.md\`, \`techContext.md\`, \`systemPatterns.md\`, etc.) have been updated to reflect this new architecture.

\-   \*\*Authentication Flow Decision (Finalized):\*\*  
    \*   Removed the need for dedicated backend Cloud Run API endpoints for core User Registration and Login (originally FOUND-9, FOUND-10).  
    \*   Frontend clients (\`carepop-nativeapp\` and \`carepop-web\`) will interact \*\*directly with Supabase Authentication\*\* using the Supabase JS SDK.  
    \*   Initial user profile creation in the \`profiles\` table will be handled automatically by a \*\*Supabase database trigger\*\* linked to \`auth.users\` insertion (revised FOUND-9).

\-   \*\*Native App Styling Decision:\*\*  
    \*   \`carepop-nativeapp\` will use \*\*React Native \`StyleSheet\`\*\* for styling, leveraging a simple, centralized theme object (\`carepop-nativeapp/src/theme/\`), due to previous difficulties with more complex styling solutions in the monorepo context. NativeWind will not be used in the native app.

\#\# Next Steps & Action Items (Immediate Focus)

1\.  \*\*Apply Supabase Profile Trigger (Implement Revised FOUND-9):\*\* Execute the necessary SQL in the Supabase project to create the \`handle\_new\_user\` function and trigger. Verify its functionality.  
2\.  \*\*Refactor Native App Auth Service/Context (Implement AUTH-1, AUTH-2, AUTH-3):\*\* Update code in \`carepop-nativeapp\` to use direct Supabase SDK calls (\`signUp\`, \`signInWithPassword\`) and manage Supabase session state (\`onAuthStateChange\`, \`getSession\`, \`signOut\`).  
3\.  \*\*Implement Secure Token Storage (Implement SEC-FE-1 for Native):\*\* Integrate \`expo-secure-store\` or confirm Supabase SDK's default persistence mechanism is adequate for session tokens in Expo.  
4\.  \*\*Connect Native Auth UI (Implement AUTH-4, AUTH-5):\*\* Connect the existing Login and Registration screens in \`carepop-nativeapp\` to the refactored auth service/context. Remove bypass logic.  
5\.  \*\*End-to-End Authentication Test (Native App):\*\* Test the complete flow: Register \-\> Verify Profile Trigger \-\> Login \-\> Verify Session \-\> Logout.  
6\.  \*\*Begin Web App Auth Implementation (\`carepop-web/\`):\*\* Start implementing equivalent direct Supabase Auth integration (Tickets AUTH-6, AUTH-7, WEB-SETUP-2) in the Next.js application.  
7\.  \*\*Update \`tracker.md\`:\*\* Align the status and notes in \`tracker.md\` with these specific implementation tasks.

\#\# Active Decisions & Considerations

\-   \*\*Three-Pillar Structure:\*\* This is the confirmed architecture. No root-level monorepo tooling is used.  
\-   \*\*Direct Client-Supabase Auth \+ Trigger:\*\* The confirmed pattern for core authentication. Cloud Run's role is for other specific backend logic.  
\-   \*\*Independent Frontend Development:\*\* \`carepop-nativeapp\` and \`carepop-web\` development proceeds independently, using distinct UI stacks but consuming the same \`carepop-backend\` APIs where applicable.  
\-   \*\*Separate CI/CD:\*\* Pipelines need to be configured for each of the three projects.

\#\# Learnings & Insights

\-   Simplifying project structure, even if it means separating applications previously intended for a monorepo, can significantly reduce tooling friction and cognitive overhead, especially when dealing with complex native build systems alongside web technologies.  
\-   Leveraging BaaS features (like Supabase Auth and Triggers) directly can often simplify core application flows compared to building custom backend wrappers, provided the BaaS capabilities meet the requirements.  
\-   Force pushes require careful coordination but can be valuable for establishing a clean baseline after major architectural changes.


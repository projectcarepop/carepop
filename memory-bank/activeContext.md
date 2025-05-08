# Active Context: CarePoP/QueerCare

## Current Work Focus

Primary: Debugging the navigation error: \`The action 'NAVIGATE' with payload {"name":"EditProfile"} was not handled by any navigator.\` This occurs when \`MyProfileScreen\` attempts to navigate. Investigation is centered on \`carepop-mobile/App.tsx\`, specifically its navigation setup (\`MainAppDrawer\`, \`MyProfileStack\`) and conditional rendering logic in \`AppContent\` to ensure the correct navigator context is active.  
Secondary: Investigating the \`Warning: Text strings must be rendered within a <Text> component.\` The call stack points to \`App (<anonymous>)\`, suggesting an issue within \`App.tsx\` or components it directly renders.

## Recent Changes & Decisions

-   Supabase Trigger (FOUND-9): User confirmed the database trigger for automatic profile creation upon new user signup is implemented and functional.  
-   Primary Mobile Navigator: \`carepop-mobile/App.tsx\` has been identified as the active root for navigation logic, rather than \`src/navigation/RootNavigator.tsx\`. Debugging and configuration efforts are now focused here.  
-   Profile Navigation Setup (\`App.tsx\`):
    *   Defined \`MyProfileStackParamList\` and \`MyProfileStackNav\`.
    *   Implemented \`MyProfileStack()\` function, registering \`MyProfileScreen\` (as "MyProfileMain") and \`EditProfileScreen\` (as "EditProfile").
    *   Integrated \`MyProfileStack\` as the component for the "My Profile" item in \`MainAppDrawer\`.
    *   Imported \`EditProfileScreen\` into \`App.tsx\`.
-   Navigation Call (\`MyProfileScreen.tsx\`): Updated \`navigateToEditProfile\` to use \`navigation.navigate('EditProfile');\`.  
-   UI Update (\`ForgotPasswordScreen.tsx\`): Replaced the text title with an \`Image\` component displaying \`carepop-logo-pink.png\`.
-   Linter Fixes (\`App.tsx\`): Resolved issue with \`theme.colors.white\` by using \`'#FFFFFF'\`.

## Next Steps & Action Items (Immediate Focus)

1.  Analyze \`AppContent\` Logs (\`App.tsx\`): Carefully review the console output for \`session\`, \`profile\`, \`isLoadingAuth\`, \`isAppLoading\`, and \`hasOnboarded\` states at the time \`AppContent\` renders. This is critical to confirm that the conditional logic correctly leads to rendering \`MainAppDrawer\` when expected.  
2.  Debug "Text strings..." Warning:
    *   Scrutinize the JSX in \`AppContent\` (\`App.tsx\`), especially around the \`Carousel\` and \`CustomSplashScreen\` rendering.
    *   Inspect \`CustomSplashScreen.tsx\`, \`OnboardingScreenOne.tsx\`, \`OnboardingScreenTwo.tsx\`, \`OnboardingScreenThree.tsx\` for any direct string rendering outside \`<Text>\` components or issues with conditional string display.
3.  Verify Navigation Path (\`App.tsx\`):
    *   If console logs show \`MainAppDrawer\` *should* be active when \`MyProfileScreen\` is visible, but navigation still fails, re-verify that \`MyProfileScreen\` (rendered via \`MyProfileStack\` in \`MainAppDrawer\`) is indeed receiving its \`navigation\` prop from the \`MainAppDrawer\`'s navigation context.
    *   Consider temporarily simplifying the rendering logic in \`AppContent\` to *only* render \`NavigationContainer > RootStack > MainAppDrawer\` (assuming a valid session and profile) to isolate navigation testing.
4.  Address \`RootNavigator.tsx\`: Clarify the role of \`src/navigation/RootNavigator.tsx\`. If \`App.tsx\` is the definitive root, consider refactoring to remove redundant navigator definitions from \`RootNavigator.tsx\` or fully deprecate it to avoid future confusion.

## Active Decisions & Considerations

-   Three-Pillar Structure: This is the confirmed architecture. No root-level monorepo tooling is used.  
-   Direct Client-Supabase Auth + Trigger: The confirmed pattern for core authentication. Cloud Run's role is for other specific backend logic.  
-   Independent Frontend Development: \`carepop-nativeapp\` and \`carepop-web\` development proceeds independently, using distinct UI stacks but consuming the same \`carepop-backend\` APIs where applicable.  
-   Separate CI/CD: Pipelines need to be configured for each of the three projects.

## Learnings & Insights

-   Having multiple, potentially conflicting, root navigation setups (\`App.tsx\` vs. \`src/navigation/RootNavigator.tsx\`) can make debugging navigation context issues very challenging. A single, clear entry point and navigator hierarchy is crucial.  
-   Persistent errors, even after apparent fixes, often point to deeper issues like incorrect component hierarchy in the navigation tree, or stale state/props being used by the screen attempting to navigate.  
-   Console logging state variables at critical points in the rendering lifecycle is invaluable for debugging conditional navigation logic.
# Active Context: CarePoP/QueerCare

## Current Work Focus

Primary: Debugging the navigation error: \`The action 'NAVIGATE' with payload {"name":"EditProfile"} was not handled by any navigator.\` This occurs when \`MyProfileScreen\` attempts to navigate. Investigation is centered on \`carepop-mobile/App.tsx\`, specifically its navigation setup (\`MainAppDrawer\`, \`MyProfileStack\`) and conditional rendering logic in \`AppContent\` to ensure the correct navigator context is active.  

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
-   Text Rendering Warning Resolved: The \"Text strings must be rendered within a <Text> component\" warning (previously appearing during onboarding) was resolved by removing specific `{/* --- ... --- */}` comment patterns from onboarding screens.  
-   Code Cleanup: Removed unused `navigation` props from onboarding screens; standardized Drawer icons in `App.tsx` to use `Ionicons`.
-   Memory Bank Updated: All core files reviewed and updated to reflect current status (TIMESTAMP_OF_MEMORY_BANK_AUG_2_2024_REVIEW).
-   Git Commit/Push: Recent changes including Memory Bank updates, UI changes, and code cleanup were committed and pushed (Commit: 9b848e6).

## Next Steps & Action Items (Immediate Focus)

1.  Analyze \`AppContent\` Logs & Navigation Path (\`App.tsx\`): Focus on the persistent navigation error. Carefully review console output for \`session\`, \`profile\`, etc. states during rendering. Verify the navigation context received by \`MyProfileScreen\` when rendered via \`MainAppDrawer\`. Consider temporarily simplifying \`AppContent\` rendering logic *only* to the authenticated state (`NavigationContainer > RootStack > MainAppDrawer`) to isolate navigation testing.
2.  Address \`RootNavigator.tsx\`: After resolving the primary navigation error, clarify the role of \`src/navigation/RootNavigator.tsx\`. If \`App.tsx\` is the definitive root, refactor to remove redundancy or deprecate the file.

## Active Decisions & Considerations

-   Three-Pillar Structure: Confirmed architecture.
-   Direct Client-Supabase Auth + Trigger: Confirmed authentication pattern.
-   Independent Frontend Development: Confirmed approach.
-   Separate CI/CD: Required for each pillar.

## Learnings & Insights

-   Navigation context debugging in React Navigation with conditional rendering can be complex; isolating the active navigator is key.
-   Persistent errors often point to component hierarchy or state/prop issues.
-   Console logging is invaluable for debugging conditional logic.
-   Unexpected build/bundler behavior can sometimes occur (e.g., the warning resolved by removing specific comment syntax), suggesting potential tooling quirks or the need for cache clearing.
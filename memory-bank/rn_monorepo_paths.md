# React Native Monorepo Paths & Configuration (CarePoP)

This document summarizes key file paths and configuration settings specific to the React Native monorepo setup (`carepop-monorepo`) to avoid common errors.

## 1. Native App Entry Point

*   **File:** `carepop-monorepo/apps/nativeapp/App.tsx`
*   **Note:** This is the main component file loaded by `index.js`. Do **NOT** edit `/src/App.tsx` if it exists.

## 2. PNPM Hoisting Configuration (`.npmrc`)

*   **File:** `carepop-monorepo/.npmrc`
*   **Current State (Working):** Hoisting patterns are **commented out / disabled**.
    ```
    # .npmrc

    # Re-enabled hoist patterns to keep RN packages local to nativeapp
    # public-hoist-pattern[]=*react-native*
    # public-hoist-pattern[]=@react-native-community/*
    # public-hoist-pattern[]=@react-native/*

    # Add other settings if needed
    ```
*   **Rationale:** Allows pnpm to hoist React Native dependencies to the root `node_modules`, which is currently required by the Gradle configuration.

## 3. Gradle Script Paths (Android)

*   **Context:** These paths tell Gradle where to find necessary React Native build scripts.
*   **Current State (Working):** Paths point to the **root `node_modules`** directory (relative to the `android` or `android/app` folder).
*   **File:** `carepop-monorepo/apps/nativeapp/android/settings.gradle`
    ```gradle
    // Example Lines:
    apply from: file("../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
    includeBuild('../../../node_modules/@react-native/gradle-plugin')
    ```
*   **File:** `carepop-monorepo/apps/nativeapp/android/app/build.gradle`
    ```gradle
    // Example Line (near bottom):
    apply from: file("../../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
    ```
*   **Note:** These paths **depend** on the hoisting configuration in `.npmrc`. If hoisting is changed, these paths **must** be updated accordingly (e.g., to `../node_modules` if packages are kept local).

## 4. Metro Bundler Configuration (`metro.config.js`)

*   **File:** `carepop-monorepo/apps/nativeapp/metro.config.js`
*   **Key Settings:**
    *   `watchFolders`: Includes `path.resolve(workspaceRoot, 'node_modules')` and `path.resolve(workspaceRoot, 'packages')`.
    *   `resolver.nodeModulesPaths`: Includes project and workspace root `node_modules`.
    *   `resolver.extraNodeModules`: Explicitly maps `@repo/ui`, `react`, and `react-native` to the *root* `node_modules`.
        ```javascript
        extraNodeModules: {
          '@repo/ui': path.resolve(workspaceRoot, 'packages/ui'),
          'react': path.resolve(workspaceRoot, 'node_modules/react'),
          'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
        },
        ```
*   **Note:** The `metro-config/src/defaults/exclusionList` path might be brittle if `metro-config` updates its internal structure. We added `metro-config` as a direct dev dependency to `nativeapp` to help Metro find it.

## 5. Native App Development Script (`nativeapp/package.json`)

*   **File:** `carepop-monorepo/apps/nativeapp/package.json`
*   **Script:** `"dev": "react-native start --reset-cache"`
*   **Note:** This uses the default `react-native start` which relies on the environment correctly resolving the CLI. We previously tried an explicit path (`node ../../node_modules/...`) which failed when hoisting was disabled. 
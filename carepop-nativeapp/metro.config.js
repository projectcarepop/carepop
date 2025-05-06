// Learn more https://docs.expo.io/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config'); // Use the config bundled with expo
const path = require('path');

// Find the project root and monorepo root
const projectRoot = __dirname; // This should resolve to carepop-frontend/apps/nativeapp
// Assuming your monorepo root is two directories above the project root
const monorepoRoot = path.resolve(projectRoot, '../..'); // This should resolve to carepop-frontend

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'), // Check local first
  path.resolve(monorepoRoot, 'node_modules'), // Then check root
];

// 3. Force Metro to resolve modules from the root node_modules
// This prevents duplicate packages when using symlinks (like with pnpm)
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;

// 4. Explicitly resolve React and React Native from the app's node_modules
// This is crucial for preventing the "Invalid hook call" error
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Optional: If you have specific package name mappings (less common with modern pnpm/workspaces)
// config.resolver.extraNodeModules = {
//   '@repo/ui': path.resolve(monorepoRoot, 'packages/ui'), // Example mapping
// };


// Optional: If using specific Babel plugins that need to run on shared code
// Ensure your Babel config (babel.config.js) is also set up correctly
// config.transformer.babelTransformerPath = require.resolve('react-native-babel-transformer');


module.exports = config; 
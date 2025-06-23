const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// --- Path Alias Configuration ---
const projectRoot = __dirname;
// ALIAS REMOVED
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];
config.watchFolders = [projectRoot];
// --- End Path Alias ---

// --- Supabase/Expo SDK 53 Workaround ---
config.resolver.unstable_conditionNames = ['browser', 'require'];
config.resolver.unstable_enablePackageExports = false;
// --- End Workaround ---

module.exports = config;
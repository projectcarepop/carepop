// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// --- Supabase/Expo SDK 53 Workaround ---
// Prioritize 'browser' conditions to prevent bundling Node.js specific code from 'ws'
config.resolver.unstable_conditionNames = ['browser', 'require'];
// Explicitly disable package exports (though may not be strictly necessary with conditionNames set)
config.resolver.unstable_enablePackageExports = false;
// --- End Workaround ---

module.exports = config; 
import type { Config } from "tailwindcss";

// Use require for the CommonJS shared config
const sharedConfig = require("../../packages/tailwind-config/tailwind.config.js");

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}", // Include shared UI package
  ],
  // Make sure to spread the imported config into presets
  presets: [sharedConfig],
};

export default config; 
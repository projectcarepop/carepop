import type { Config } from 'tailwindcss';
import sharedConfig from "@repo/tailwind-config/tailwind.config";

const config: Pick<Config, "content" | "presets"> = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // If you have a components folder
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}", // Include shared UI package
  ],
  presets: [sharedConfig],
};

export default config; 
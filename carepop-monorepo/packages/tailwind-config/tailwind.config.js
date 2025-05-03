// No longer need TS types here
// import type { Config } from "tailwindcss";

// Base Tailwind configuration for the monorepo (using CommonJS)
const config = {
  theme: {
    extend: {
      backgroundImage: {
        "glow-conic":
          "conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)",
      },
    },
  },
  plugins: [],
};

// Use module.exports
module.exports = config; 
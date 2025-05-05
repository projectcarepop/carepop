/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "react-native-vector-icons"], // Add other shared packages if needed
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // alias react-native to react-native-web
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    // Add rule for font files
    config.module.rules.push({
      test: /\.ttf$/,
      loader: "url-loader", // or file-loader
    });
    return config;
  },
};

export default nextConfig;

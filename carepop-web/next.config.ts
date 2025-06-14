import type { NextConfig } from "next";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'; // Default to 8080 if not set

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*', // Proxy all requests starting with /api/v1/
        destination: `${BACKEND_API_URL}/api/v1/:path*`, // To your backend server
      },
    ];
  },
};

export default nextConfig;

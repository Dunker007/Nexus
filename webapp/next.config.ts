import type { NextConfig } from "next";

// Robust check for web environments (Cloud Run, Vercel, or Production builds)
const isWeb = !!(
  process.env.NEXT_PUBLIC_IS_WEB === 'true' || 
  process.env.VERCEL || 
  process.env.K_SERVICE || // Google Cloud Run environment variable
  process.env.FIREBASE_CONFIG ||
  process.env.NODE_ENV === 'production'
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // If we are on the web, disable static export so API routes work.
  // If we are building for Tauri (local), enable static export.
  output: isWeb ? undefined : "export",
  images: {
    unoptimized: !isWeb,
  },
  trailingSlash: isWeb ? false : true,

  async rewrites() {
    // Only enable rewrites in non-export mode
    if (!isWeb) return [];
    
    return [
      {
        source: '/api/bridge/smartfolio/:accountId',
        destination: 'http://localhost:3456/smartfolio/:accountId',
      },
      {
        source: '/api/bridge/smartfolio/:accountId/sync',
        destination: 'http://localhost:3456/smartfolio/:accountId/sync',
      },
    ];
  },
};

export default nextConfig;

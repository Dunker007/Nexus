import type { NextConfig } from "next";

const isWeb = !!(process.env.NEXT_PUBLIC_IS_WEB === 'true' || process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NODE_ENV === 'production' || process.env.FIREBASE_CONFIG);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
  },
  output: isWeb ? undefined : "export",
  images: {
    unoptimized: !isWeb,
  },
  trailingSlash: !isWeb,

  async rewrites() {
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

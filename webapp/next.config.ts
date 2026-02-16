import type { NextConfig } from "next";

const isWeb = !!(process.env.NEXT_PUBLIC_IS_WEB === 'true' || process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_URL);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Only export statically for Tauri builds (default behavior unless IS_WEB=true)
  output: isWeb ? undefined : "export",
  // Images unoptimized for Tauri (fs access), optimized for Web
  images: {
    unoptimized: !isWeb,
  },
  // Ensure trailing slashes for static files (Tauri requirement)
  trailingSlash: !isWeb,

  // API Rewrites (None needed for internal API routes)
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

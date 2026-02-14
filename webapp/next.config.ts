import type { NextConfig } from "next";

const isWeb = process.env.NEXT_PUBLIC_IS_WEB === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Only export statically for Tauri builds (default behavior unless IS_WEB=true)
  output: isWeb ? undefined : "export",
  // Images unoptimized for Tauri (fs access), optimized for Web
  images: {
    unoptimized: !isWeb,
  },
  // Ensure trailing slashes for static files (Tauri requirement)
  trailingSlash: !isWeb,

  // API Rewrites for Web (proxies /api/bridge -> Bridge URL)
  async rewrites() {
    if (!isWeb) return [];
    // If running on web, proxy /api/bridge calls to the backend
    // This solves CORS issues for simple REST calls
    // Note: WebSockets should still connect directly to Bridge URL
    return [
      {
        source: '/api/bridge/:path*',
        destination: (process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456') + '/:path*',
      },
    ];
  },
};

export default nextConfig;

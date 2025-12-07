import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Static export for Tauri
  output: "export",
  // Required for static export
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for static files
  trailingSlash: true,
};

export default nextConfig;

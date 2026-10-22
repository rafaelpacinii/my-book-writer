import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Isolate browser tests from the developer's running Next instance.
  distDir: process.env.MBW_NEXT_DIST_DIR || ".next",
  images: { unoptimized: true },
  // Use same-origin assets: development and production can run on different ports.
};

export default nextConfig;

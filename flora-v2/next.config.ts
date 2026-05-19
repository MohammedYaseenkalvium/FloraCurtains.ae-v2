import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Required for @react-pdf Image to read from public/
  },
};

export default nextConfig;
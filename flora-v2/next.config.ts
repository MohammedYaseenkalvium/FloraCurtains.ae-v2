import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: images.unoptimized was removed in website W4. @react-pdf reads
  // public/images/flora-logo.png via fs.readFileSync (src/lib/pdf.tsx),
  // which never consults Next image optimization — the old flag only
  // disabled responsive srcsets/AVIF for the whole site.
  output:'standalone'
};

export default nextConfig;
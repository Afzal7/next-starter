import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shadcnstudio.com",
      },
    ],
  },
};

export default nextConfig;

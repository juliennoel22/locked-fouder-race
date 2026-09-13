import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      {
        source: "/jury",
        destination: "/recap",
      },
    ];
  },
};

export default nextConfig;

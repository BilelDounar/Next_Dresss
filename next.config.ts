import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dresss.cloud',
        port: '443',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dresss.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.zara.net',
        pathname: '/**',
      }
    ],
  },
  devIndicators: {
    position: 'top-left',
  },
};

export default nextConfig;

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
      }
    ],
  },
};

export default nextConfig;

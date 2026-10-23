import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.nextfashiontextile.com",
        port: "",
        pathname: "/media/**",
      },
    ],
  },

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.118",
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;
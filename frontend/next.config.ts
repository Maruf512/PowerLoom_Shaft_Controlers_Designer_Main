import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  // Allow dev server access over LAN (e.g. http://192.168.0.118:3000)
  // Prevents "Cross origin request detected" warning for /_next/* resources.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.118",
    // Cover whole 192.168.x.x LAN in case your IP changes (DHCP)
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;

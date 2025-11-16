import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '*.ngrok-free.app'],
};

export default nextConfig;

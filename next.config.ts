import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./src/lib/routes";

const isDev =
  process.env.NODE_ENV === "development" ||
  process.argv.includes("dev") ||
  process.env.npm_lifecycle_event === "dev" ||
  process.env.npm_lifecycle_event === "dev:fresh";

const nextConfig: NextConfig = {
  distDir: isDev ? ".next-dev" : ".next",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dev.to",
      },
    ],
  },
  experimental: {
    workerThreads: false,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
  async redirects() {
    const nested = LEGACY_REDIRECTS.filter((r) =>
      r.source.startsWith("/platform/"),
    ).map((r) => ({
      source: `${r.source}/:path*`,
      destination: `${r.destination}/:path*`,
      permanent: r.permanent,
    }));

    return [...LEGACY_REDIRECTS, ...nested];
  },
};

export default nextConfig;

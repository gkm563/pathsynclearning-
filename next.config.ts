import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./src/lib/routes";

/**
 * Keep production builds and `next dev` on separate output dirs.
 * Sharing `.next` between `next build` and a running `next dev` is the
 * usual cause of MODULE_NOT_FOUND chunk errors (./5745.js, /_app, etc.).
 */
const isDev =
  process.env.NODE_ENV === "development" ||
  process.argv.includes("dev") ||
  process.env.npm_lifecycle_event === "dev" ||
  process.env.npm_lifecycle_event === "dev:fresh";

const nextConfig: NextConfig = {
  distDir: isDev ? ".next-dev" : ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Avoid single-CPU serialization that leaves incomplete webpack graphs
    // under heavy HMR / major refactors on Windows.
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

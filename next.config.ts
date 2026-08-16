import type { NextConfig } from "next";
import { LEGACY_REDIRECTS } from "./src/lib/routes";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
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

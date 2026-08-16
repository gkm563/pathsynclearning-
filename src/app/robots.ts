import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://pathed.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          routes.auth.continue,
          routes.auth.signIn,
          routes.auth.signUp,
          `${routes.api.me}/`,
          `${routes.api.store}/`,
          `${routes.api.ai}/`,
          routes.onboarding.root,
          ...Object.values(routes.app),
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}

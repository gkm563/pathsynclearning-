import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pathed.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing = [
    routes.home,
    routes.marketing.platform,
    routes.marketing.methodology,
    routes.marketing.mission,
    routes.marketing.company,
    routes.marketing.blog,
    routes.marketing.community,
    routes.marketing.pricing,
    routes.marketing.guides,
    routes.marketing.documentation,
    routes.marketing.apiReference,
    routes.marketing.privacy,
    routes.marketing.terms,
    routes.marketing.cookies,
    routes.marketing.accessibility,
  ];

  return marketing.map((path) => ({
    url: `${SITE}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}

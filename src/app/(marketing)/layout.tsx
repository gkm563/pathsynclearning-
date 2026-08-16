import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "PathEd — Career readiness for engineering students",
    template: "%s · PathEd",
  },
  description:
    "Bridge academic learning and industry skills with PathEd — roadmaps, challenges, mentorship, and placement readiness for engineering students.",
  openGraph: {
    type: "website",
    siteName: "PathEd",
    title: "PathEd — Career readiness for engineering students",
    description:
      "Bridge academic learning and industry skills with PathEd — roadmaps, challenges, mentorship, and placement readiness.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathEd — Career readiness for engineering students",
    description:
      "Bridge academic learning and industry skills with PathEd.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Public marketing site — URL paths unchanged (group is omitted). */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}

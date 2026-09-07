import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

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
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Header />
      {/* min-w-0 stops a wide child section from widening the whole column. */}
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

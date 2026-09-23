import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import type { FooterSection } from "@/types";
import { routes } from "@/lib/routes";

export default function Footer() {
  const m = routes.marketing;
  const sections: FooterSection[] = [
    {
      title: "Product",
      links: [
        { label: "Platform", to: m.platform },
        { label: "Methodology", to: m.methodology },
        { label: "Pricing", to: m.pricing },
        { label: "Guides", to: m.guides },
        { label: "Documentation", to: m.documentation },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Mission", to: m.mission },
        { label: "About", to: m.company },
        { label: "Blog", to: m.blog },
        { label: "Community", to: m.community },
        { label: "Contact", to: `${m.company}#contact` },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", to: m.privacy },
        { label: "Terms", to: m.terms },
        { label: "Cookies", to: m.cookies },
        { label: "Accessibility", to: m.accessibility },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-sunken px-4 pt-16 pb-8 text-ink sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="grid gap-12 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
          <div className="max-w-sm">
            <BrandMark href="/" />
            <p className="type-body mt-4 mb-0 text-muted">
              Career readiness for engineering students — roadmaps, challenges,
              and placement signals that actually mean something.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="type-overline mb-4 text-ink">
                {section.title}
              </h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.to}
                      className="type-small text-muted no-underline transition-colors duration-[var(--duration-fast)] hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="type-small m-0 text-muted">
            © {new Date().getFullYear()} PathSync Learning. All rights reserved.
          </p>
          <p className="type-overline m-0 inline-flex items-center gap-2 text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            Systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

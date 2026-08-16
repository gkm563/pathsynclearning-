"use client";

import Link from "next/link";
import { Globe, Users, Code, Mail } from "lucide-react";
import type { FooterSection } from "@/types";
import { routes } from "@/lib/routes";

export default function Footer() {
  const m = routes.marketing;
  const sections: FooterSection[] = [
    {
      title: "Platform",
      links: [
        { label: "Features", to: `${m.platform}#features` },
        { label: "Roadmaps", to: m.platform },
        { label: "Challenges", to: `${m.platform}#challenges` },
        { label: "Skill Trees", to: `${m.platform}#skill-trees` },
        { label: "Pricing", to: m.pricing },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", to: m.blog },
        { label: "Guides", to: m.guides },
        { label: "Documentation", to: m.documentation },
        { label: "API Reference", to: m.apiReference },
        { label: "Community", to: m.community },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", to: m.company },
        { label: "Careers", to: m.company },
        { label: "Mission", to: m.mission },
        { label: "Contact", to: `${m.company}#contact` },
        { label: "Partners", to: m.company },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: m.privacy },
        { label: "Terms of Service", to: m.terms },
        { label: "Cookie Policy", to: m.cookies },
        { label: "Accessibility", to: m.accessibility },
      ],
    },
  ];

  return (
    <footer className="relative z-[2] mt-auto bg-[var(--bg-inverse)] px-8 pt-20 pb-10 text-[var(--text-inverse)]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-16 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12">
          <div className="max-w-80">
            <Link href="/" className="mb-5 flex items-center gap-2.5">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-linear-to-br from-[#6c63ff] to-[#00c9a7] font-display text-lg font-extrabold text-[var(--text-inverse)]">
                P
              </div>
              <span className="font-display text-[28px] font-extrabold text-[var(--text-inverse)]">
                Path<span className="text-[#6c63ff]">Ed</span>
              </span>
            </Link>
            <p className="mb-6 font-sans text-[15px] leading-relaxed text-[var(--text-light)]">
              The ultimate career readiness platform bridging the gap between academic theory and industry demands.
            </p>
            <div className="flex gap-4">
              {[Globe, Users, Code, Mail].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[var(--text-light)] transition-all hover:bg-[#6c63ff] hover:text-[var(--bg-card)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="mb-6 font-display text-base font-bold text-[var(--text-inverse)]">{section.title}</h4>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.to}
                      className="font-sans text-sm text-[var(--text-light)] no-underline transition-colors hover:text-[#00c9a7]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <div className="font-sans text-sm text-gray-500">
            © {new Date().getFullYear()} PathEd. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#00c9a7] shadow-[0_0_10px_#00c9a7]" />
            <span className="font-mono text-[13px] text-[var(--text-light)]">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

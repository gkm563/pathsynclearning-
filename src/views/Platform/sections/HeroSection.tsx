"use client";

import { ArrowRight } from "lucide-react";
import { Kicker, MediaFrame, Reveal, SectionBlock } from "./shell";

/**
 * The three anchors below are public entry points — the site header and the
 * docs pages link straight to them, so the ids must stay stable.
 */
const JUMP_LINKS: readonly { href: string; label: string }[] = [
  { href: "#features", label: "Personalised roadmap" },
  { href: "#challenges", label: "Engineering challenges" },
  { href: "#skill-trees", label: "Skill trees" },
];

export default function HeroSection() {
  return (
    <SectionBlock
      labelledBy="platform-title"
      className="pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20"
    >
      <Reveal className="max-w-[44rem]">
        <Kicker>Platform overview</Kicker>
        <h1 id="platform-title" className="type-display mt-5 text-ink">
          Your B.Tech degree, <span className="text-primary">reimagined.</span>
        </h1>
        <p className="type-body-lg type-prose mt-5 text-muted">
          PathEd transforms your degree from a static list of subjects into a
          dynamic, measurable, and purposeful journey toward your dream
          engineering career. We eliminate the guesswork from your education.
        </p>

        <nav aria-label="Jump to a platform capability" className="mt-8">
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {JUMP_LINKS.map((link) => (
              <li key={link.href} className="min-w-0">
                <a
                  href={link.href}
                  className="type-label inline-flex min-h-11 min-w-0 items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface px-4 text-ink transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-line-strong hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="min-w-0">{link.label}</span>
                  <ArrowRight size={14} aria-hidden className="shrink-0 text-faint" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>

      <Reveal delay={0.06} className="mt-10 sm:mt-12">
        <MediaFrame
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80"
          alt="Engineering student writing code on a laptop"
          ratioClass="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
        />
      </Reveal>
    </SectionBlock>
  );
}

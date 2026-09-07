"use client";

import { Building2, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type ContactChannel = {
  readonly title: string;
  readonly description: string;
  readonly email: string;
  readonly Icon: LucideIcon;
};

const CHANNELS: readonly ContactChannel[] = [
  {
    title: "General inquiries",
    description: "Questions about the platform, your roadmap, or your account.",
    email: "hello@pathed.in",
    Icon: Mail,
  },
  {
    title: "Corporate partnerships",
    description: "Hiring from PathEd, campus programmes, and integrations.",
    email: "partners@pathed.in",
    Icon: Building2,
  },
];

/**
 * `#contact` is linked from the global footer — the id must stay on this
 * section. `scroll-mt-*` keeps the heading clear of the sticky header when the
 * browser jumps to the anchor.
 */
export default function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-24 border-t border-line bg-sunken"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="min-w-0 max-w-2xl">
          <p className="type-overline text-primary">Talk to us</p>
          <h2 id="contact-title" className="type-h1 mt-3 text-ink">
            Get in touch
          </h2>
          <p className="type-body-lg mt-5 text-muted">
            Whether you're a student looking to accelerate your career, or a
            company looking to hire vetted engineering talent, we'd love to hear
            from you.
          </p>
        </Reveal>

        <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:gap-6">
          {CHANNELS.map((channel, index) => (
            <Reveal
              as="li"
              key={channel.email}
              delay={index * 0.05}
              className="min-w-0"
            >
              <div className="flex h-full min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-xs)]">
                <span
                  aria-hidden
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary"
                >
                  <channel.Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="type-h3 mt-5 text-ink">{channel.title}</h3>
                <p className="type-body mt-2 text-muted">
                  {channel.description}
                </p>
                <a
                  href={`mailto:${channel.email}`}
                  className="type-label mt-4 inline-flex min-h-11 w-fit min-w-0 items-center rounded-[var(--radius-sm)] break-all text-primary underline underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
                >
                  {channel.email}
                </a>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

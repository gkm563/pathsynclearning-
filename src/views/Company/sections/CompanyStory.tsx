"use client";

import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

/**
 * The two narrative rows — our ethos and our origin — as alternating
 * copy/photo pairs driven by one typed array so the rhythm stays identical.
 */

type StoryRow = {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: readonly string[];
  readonly tone: "primary" | "accent";
  readonly image: { readonly src: string; readonly alt: string };
};

const STORY_ROWS: readonly StoryRow[] = [
  {
    id: "ethos",
    eyebrow: "Engineering excellence",
    title: "Built by engineers, for engineers",
    body: [
      "We aren't just building another ed-tech tool. We are fundamentally re-architecting the educational journey to map directly to real-world career demands.",
    ],
    tone: "primary",
    image: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      alt: "Engineers collaborating over a shared screen",
    },
  },
  {
    id: "origin",
    eyebrow: "The Prayagraj roots",
    title: "Our origin story",
    body: [
      "PathSync Learning wasn't born in Silicon Valley. It was built in Prayagraj by engineers who experienced the friction of traditional tech education firsthand.",
      "We realised that if we wanted a system that actually cared about careers, we had to build it ourselves. What started as a local experiment is now scaling to redefine how engineers prepare for the workforce globally.",
    ],
    tone: "accent",
    image: {
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      alt: "An early PathEd working session around a small desk",
    },
  },
];

export default function CompanyStory() {
  return (
    <>
      {STORY_ROWS.map((row, index) => {
        const flipped = index % 2 === 1;
        return (
          <section
            key={row.id}
            aria-labelledby={`${row.id}-title`}
            className={cn(
              "border-b border-line",
              flipped ? "bg-canvas" : "bg-surface",
            )}
          >
            <div className="mx-auto grid w-full max-w-[var(--measure-content)] items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <Reveal className={cn("min-w-0", flipped && "lg:order-2")}>
                <p
                  className={cn(
                    "type-overline",
                    row.tone === "accent" ? "text-accent" : "text-primary",
                  )}
                >
                  {row.eyebrow}
                </p>
                <h2 id={`${row.id}-title`} className="type-h1 mt-3 text-ink">
                  {row.title}
                </h2>
                <div className="mt-5 flex flex-col gap-4">
                  {row.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="type-body-lg text-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>

              <Reveal
                delay={0.05}
                className={cn("min-w-0", flipped && "lg:order-1")}
              >
                <figure className="m-0 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-sunken shadow-[var(--shadow-sm)]">
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={row.image.src}
                      alt={row.image.alt}
                      width={1200}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </figure>
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}

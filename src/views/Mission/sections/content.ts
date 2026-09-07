import type { KickerVariant, SectionTone } from "./shell";

/** A copy-beside-photograph band. Shape is identical for every instance. */
export type ImageRow = {
  /** Used to build the heading id the `<section>` is labelled by. */
  slug: string;
  tone: SectionTone;
  kicker: string;
  kickerVariant?: KickerVariant;
  title: string;
  body: readonly string[];
  image: { src: string; alt: string };
  mediaFirst?: boolean;
};

export const VISION_ROW: ImageRow = {
  slug: "vision",
  tone: "inverse",
  kicker: "Our vision",
  kickerVariant: "inverse",
  title: "Replacing proxy metrics with true readiness signals.",
  body: [
    "PathEd directly confronts systemic failures with integrated architectural solutions. We provide the clarity, structure, and accountability necessary to transform an academic degree into a measurable and purposeful career journey.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    alt: "Students collaborating over a laptop in a study space",
  },
};

export const RIPPLE_ROW: ImageRow = {
  slug: "ripple",
  tone: "canvas",
  kicker: "Systemic impact",
  title: "The ripple effect.",
  body: [
    "When a single student unlocks their true potential, the impact doesn't stop at their first paycheck. It elevates their family, inspires their peers, and ultimately strengthens the global engineering ecosystem.",
    "Our mission is to trigger this ripple effect at an unprecedented scale, transforming India's vast engineering talent pool into the world's most capable technical workforce.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    alt: "Group of engineering graduates walking together on campus",
  },
};

export const ALIGNMENT_ROW: ImageRow = {
  slug: "alignment",
  tone: "surface",
  kicker: "Bridging the gap",
  kickerVariant: "accent",
  title: "Closing the gap between academia & corporate.",
  body: [
    "For decades, universities and tech companies have operated in silos. PathEd acts as the definitive bridge, aligning academic curriculum directly with the evolving demands of the tech industry.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
    alt: "Corporate team reviewing hiring criteria in a meeting room",
  },
  mediaFirst: true,
};

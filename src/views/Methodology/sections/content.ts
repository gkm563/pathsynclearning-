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

export const GAMIFICATION_ROW: ImageRow = {
  slug: "gamification",
  tone: "inverse",
  kicker: "Purpose over entertainment",
  kickerVariant: "inverse",
  title: "“Serious” gamification.",
  body: [
    "PathEd's approach to gamification is intentionally restrained. Motivation is derived from meaningful progression, skill unlocks, and visible improvements in the CRI.",
    "This contrasts sharply with platforms that rely on superficial rewards like badges or points. We treat higher education as a serious professional endeavor.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    alt: "Student working through a problem with focused concentration",
  },
  mediaFirst: true,
};

export const NODE_LEVEL_ROW: ImageRow = {
  slug: "node-level",
  tone: "canvas",
  kicker: "Active demonstration",
  title: "Node-level learning.",
  body: [
    "Our validation policy is uncompromising: progress is tied exclusively to assessment outcomes. Simply consuming content — downloading notes or watching a video — does not mark a node as complete.",
    "This distinction is crucial. We shift the focus from passive reception to the active demonstration of knowledge, fostering genuine accountability at every step of your journey.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    alt: "Two students actively working through an exercise together",
  },
};

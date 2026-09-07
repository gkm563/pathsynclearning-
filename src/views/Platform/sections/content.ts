import type { KickerVariant, SectionTone } from "./shell";

/** A copy-beside-photograph band. Shape is identical for every instance. */
export type ImageRow = {
  /** Used to build the heading id the `<section>` is labelled by. */
  slug: string;
  /** Public anchor target. Linked from the site header and in-page nav. */
  id?: string;
  tone: SectionTone;
  kicker: string;
  kickerVariant?: KickerVariant;
  title: string;
  body: readonly string[];
  image: { src: string; alt: string };
  mediaFirst?: boolean;
};

export const CHALLENGES_ROW: ImageRow = {
  slug: "challenges",
  id: "challenges",
  tone: "canvas",
  kicker: "Hands-on learning",
  title: "Real-world engineering challenges.",
  body: [
    "Forget theoretical exams. PathEd validates your skills through rigorous, industry-simulated coding challenges. From debugging legacy code to building scalable microservices, our challenges test what actually matters.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    alt: "Source code on a monitor during a debugging session",
  },
};

export const SKILL_TREES_ROW: ImageRow = {
  slug: "skill-trees",
  id: "skill-trees",
  tone: "inverse",
  kicker: "Visualize progress",
  kickerVariant: "inverse",
  title: "Interactive skill trees.",
  body: [
    "Navigate your engineering journey like a modern RPG. Our interconnected skill trees map out exactly what dependencies you need to master before unlocking advanced technologies.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80",
    alt: "Branching network of connected nodes representing a skill tree",
  },
  mediaFirst: true,
};

export const INTERVIEW_ROW: ImageRow = {
  slug: "interview",
  tone: "surface",
  kicker: "Structurally integrated",
  title: "Interview preparedness engine.",
  body: [
    "Interview preparation shouldn't be a frantic, last-minute activity. In PathEd, it is structurally integrated directly into your learning journey.",
    "Technical questions and behavioral scenarios are mapped specifically to your target career paths and academic stages, gradually increasing in complexity as you progress to build unbreakable confidence.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    alt: "Candidate in conversation with an interviewer across a desk",
  },
};

export const CAREER_FUSION_ROW: ImageRow = {
  slug: "career-fusion",
  tone: "canvas",
  kicker: "Adaptation without waste",
  kickerVariant: "accent",
  title: "Career fusion logic.",
  body: [
    "Your career goals will evolve. Changing your mind shouldn't mean starting over from scratch.",
    "When you shift your target career — from software development to data analytics, say — our Career Fusion Logic intelligently maps all previously mastered skills to your new path. You only learn what's missing, transforming a disruptive reset into a manageable transition.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    alt: "Team of engineers planning together around a shared table",
  },
  mediaFirst: true,
};

export const FEEDBACK_LOOP_ROW: ImageRow = {
  slug: "feedback-loop",
  tone: "surface",
  kicker: "Adaptive routing",
  title: "Continuous feedback loop.",
  body: [
    "Your roadmap isn't static. It breathes and evolves with your performance.",
    "Struggling with dynamic programming? The engine instantly injects micro-lessons and targeted challenges. Acing system design? It accelerates you to advanced architecture problems, so you are always operating at your edge of capability.",
  ],
  image: {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    alt: "Analytics dashboard showing performance trends over time",
  },
};

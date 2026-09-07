"use client";

import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

/**
 * The five community pillars, rendered as alternating editorial rows.
 *
 * They shared identical structure in the old page (kicker, headline, copy,
 * photo) but each was hand-written, so the spacing and type drifted between
 * them. Driving them from one typed array keeps the rhythm identical.
 */

type PillarTone = "primary" | "accent" | "info" | "success";

type Pillar = {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: readonly string[];
  readonly tone: PillarTone;
  readonly image: { readonly src: string; readonly alt: string };
};

const TONE_TEXT: Record<PillarTone, string> = {
  primary: "text-primary",
  accent: "text-accent",
  info: "text-info",
  success: "text-success",
};

const PILLARS: readonly Pillar[] = [
  {
    id: "hackattack",
    eyebrow: "Competitive learning",
    title: "The HackAttack Engine",
    body: [
      "Put your skills to the test in real time. Join weekly global hackathons and daily algorithmic challenges mapped directly to your CRI.",
      "Compete on professional, constrained leaderboards where quality of code matters just as much as speed of execution.",
    ],
    tone: "accent",
    image: {
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      alt: "Participants working through a timed hackathon in a shared workspace",
    },
  },
  {
    id: "peer-review",
    eyebrow: "Collaboration",
    title: "Global Peer Review",
    body: [
      "Your code doesn't exist in a vacuum. PathEd automatically routes your project submissions to peers for blind code reviews.",
      "The result is a culture of constructive criticism and collective improvement, not a scoreboard you face alone.",
    ],
    tone: "primary",
    image: {
      src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      alt: "Two engineers reading through a pull request on a large monitor",
    },
  },
  {
    id: "teacher-connect",
    eyebrow: "Mentorship",
    title: "Teacher Connect",
    body: [
      "When you hit a plateau, you aren't stuck. Teachers are given aggregated views of your progress and readiness trends.",
      "That allows early identification of struggles, so faculty can provide informed, data-driven guidance exactly when you need it most.",
    ],
    tone: "info",
    image: {
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      alt: "A lecturer explaining a concept to a small group of students",
    },
  },
  {
    id: "weekend-hackathons",
    eyebrow: "Building in public",
    title: "Weekend Hackathons",
    body: [
      "Learning in isolation is slow. Every weekend the PathEd community rallies together to build projects from scratch within 48 hours.",
      "This rapid iteration cycle teaches you how to collaborate under pressure, manage Git workflows, and ship real products — the skills recruiters specifically look for.",
    ],
    tone: "success",
    image: {
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      alt: "A team assembling a project on a whiteboard during a weekend build sprint",
    },
  },
  {
    id: "industry-mentors",
    eyebrow: "Expert guidance",
    title: "Direct access to industry veterans",
    body: [
      "The PathEd community isn't just students. We've brought in active senior engineers and hiring managers from top-tier companies to act as mentors.",
      "Get your resume reviewed, take mock interviews, and receive candid career advice from the exact people who will eventually be hiring you.",
    ],
    tone: "primary",
    image: {
      src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      alt: "A senior engineer mentoring a student over a shared laptop",
    },
  },
];

export default function CommunityPillars() {
  return (
    <>
      {PILLARS.map((pillar, index) => {
        const flipped = index % 2 === 1;
        return (
          <section
            key={pillar.id}
            aria-labelledby={`${pillar.id}-title`}
            className={cn(
              "border-b border-line",
              flipped ? "bg-surface" : "bg-canvas",
            )}
          >
            <div className="mx-auto grid w-full max-w-[var(--measure-content)] items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <Reveal className={cn("min-w-0", flipped && "lg:order-2")}>
                <p className={cn("type-overline", TONE_TEXT[pillar.tone])}>
                  {pillar.eyebrow}
                </p>
                <h2
                  id={`${pillar.id}-title`}
                  className="type-h1 mt-3 text-ink"
                >
                  {pillar.title}
                </h2>
                <div className="mt-5 flex flex-col gap-4">
                  {pillar.body.map((paragraph) => (
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
                      src={pillar.image.src}
                      alt={pillar.image.alt}
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

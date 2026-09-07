"use client";

import { Badge } from "@/components/ui";
import { Reveal } from "./Reveal";

/**
 * The essay index.
 *
 * There are no per-article routes yet, so the cards are deliberately
 * non-interactive `<article>` elements rather than links that go nowhere —
 * the page-level CTA is the one real destination.
 */

type ArticleTone = "accent" | "success" | "warning" | "info" | "neutral";

type Article = {
  readonly title: string;
  readonly summary: string;
  readonly topic: string;
  readonly tone: ArticleTone;
  readonly image: { readonly src: string; readonly alt: string };
};

const AUTHOR = "Rahul Kushwaha";

const ARTICLES: readonly Article[] = [
  {
    title: "Why 90% mastery is the new passing grade",
    summary:
      "Scraping by with a 40% doesn't work in the real world. Discover why PathEd enforces a strict 90% mastery threshold before unlocking new skills.",
    topic: "Pedagogy",
    tone: "accent",
    image: {
      src: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=800&q=80",
      alt: "A student working through practice problems at a desk",
    },
  },
  {
    title: "The end of syllabus misalignment in B.Tech",
    summary:
      "University syllabi are organised by academic discipline, not by industry job roles. Here is how we are mapping degrees directly to career outcomes.",
    topic: "Industry",
    tone: "success",
    image: {
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      alt: "Engineers planning a project on a whiteboard",
    },
  },
  {
    title: "How CRI is replacing the traditional CGPA",
    summary:
      "Beyond exam scores, there is no reliable metric to measure actual readiness. Enter the Career Readiness Index — a holistic 0–100 score.",
    topic: "Metrics",
    tone: "warning",
    image: {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      alt: "A dashboard of performance charts on a laptop screen",
    },
  },
  {
    title: "Understanding career fusion logic",
    summary:
      "Changing your target career midway shouldn't mean starting over. Learn how our fusion logic maps previously mastered skills to new paths.",
    topic: "Architecture",
    tone: "info",
    image: {
      src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      alt: "A developer tracing a system diagram on a monitor",
    },
  },
  {
    title: "The importance of learning memory in engineering",
    summary:
      "Skills mastered in one semester are often forgotten. PathEd creates a persistent, chronological record of your academic life.",
    topic: "Retention",
    tone: "accent",
    image: {
      src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
      alt: "A student reviewing handwritten notes beside a laptop",
    },
  },
  {
    title: "Building a career-centric degree from day one",
    summary:
      "Meaningful career planning is often postponed until the final year. We are shifting preparation to day one of your B.Tech journey.",
    topic: "Vision",
    tone: "success",
    image: {
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      alt: "A lecturer walking a class through a career roadmap",
    },
  },
  {
    title: "Why continuous feedback loops beat final exams",
    summary:
      "An exam at the end of a semester tells you what you failed to learn. A continuous feedback loop tells you what to fix right now.",
    topic: "Feedback",
    tone: "warning",
    image: {
      src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      alt: "A mentor giving feedback to a student over a shared screen",
    },
  },
  {
    title: "The problem with proxy metrics in tech hiring",
    summary:
      "Why are companies still using university pedigree as a proxy for coding skill? We explore the data behind a merit-first approach.",
    topic: "Hiring",
    tone: "info",
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      alt: "A hiring panel reviewing candidate profiles around a table",
    },
  },
  {
    title: "Gamification vs. true progress",
    summary:
      "Leaderboards are fun, but getting a job is better. How we balance engagement with rigorous, employable skill building.",
    topic: "Product",
    tone: "neutral",
    image: {
      src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      alt: "A team celebrating a milestone in an open-plan office",
    },
  },
];

export default function ArticleGrid() {
  return (
    <section
      aria-labelledby="articles-title"
      className="border-b border-line bg-canvas"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 id="articles-title" className="sr-only">
          All articles
        </h2>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {ARTICLES.map((article, index) => (
            <Reveal
              as="li"
              key={article.title}
              delay={Math.min(index, 5) * 0.04}
              className="min-w-0"
            >
              <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]">
                <div className="aspect-[16/10] w-full bg-sunken">
                  <img
                    src={article.image.src}
                    alt={article.image.alt}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                    <Badge tone={article.tone}>{article.topic}</Badge>
                    <span className="type-caption min-w-0 text-faint">
                      By {AUTHOR}
                    </span>
                  </div>
                  <h3 className="type-h3 mt-3.5 text-ink">{article.title}</h3>
                  <p className="type-body mt-2 text-muted">{article.summary}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

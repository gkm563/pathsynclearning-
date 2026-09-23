"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui";

type Story = {
  name: string;
  role: string;
  company: string;
  cri: string;
  quote: string;
  text: string;
  before: string;
  after: string;
  image: string;
};

const STORIES: readonly Story[] = [
  {
    name: "Priya Sharma",
    role: "Backend SDE",
    company: "Google",
    cri: "92%",
    quote:
      "PathSync Learning didn't just teach me code. It taught me how to think like an engineer.",
    text: "Before PathSync Learning, I was lost in a sea of theoretical coursework. Once I started completing the real-world challenges on my personalized roadmap, my CRI score shot up. Within 3 months, a recruiter saw my profile and reached out directly. No resume screen, just proof of work.",
    before: "Struggling with DSA",
    after: "Backend SDE",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
  },
  {
    name: "Rahul Verma",
    role: "Frontend Engineer",
    company: "Microsoft",
    cri: "88%",
    quote: "I finally have a portfolio that speaks for itself.",
    text: "I used to get rejected at the resume screening stage constantly. PathSync Learning's project-based approach meant I built real, complex applications. When recruiters saw my verified Skill Tree and project repos, the interviews started pouring in.",
    before: "Tutorial Hell",
    after: "Frontend Engineer",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
  },
  {
    name: "Aisha Patel",
    role: "Data Scientist",
    company: "Razorpay",
    cri: "95%",
    quote: "The AI Mentor is like having a senior engineer on call 24/7.",
    text: "Whenever I was stuck on a complex data pipeline challenge, the AI Mentor didn't just give me the answer. It asked me guiding questions, pointing out flaws in my logic. That Socratic method of learning completely changed how I problem-solve.",
    before: "Academic Theory",
    after: "Data Scientist",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
  },
  {
    name: "David Chen",
    role: "Full Stack Developer",
    company: "Amazon",
    cri: "91%",
    quote: "PathSync Learning bridged the gap between college and the real world.",
    text: "University taught me how to write scripts, but PathSync Learning taught me how to build systems. Learning about CI/CD, system design, and clean architecture through hands-on challenges made me confident enough to ace my technical interviews.",
    before: "Writing Scripts",
    after: "Full Stack Developer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
  },
];

const INTERVAL = 8000;

export default function SuccessStories() {
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (next: number) =>
    setIndex((next + STORIES.length) % STORIES.length);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(
      () => setIndex((prev) => (prev + 1) % STORIES.length),
      INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [paused, reduced]);

  const story = STORIES[index];

  return (
    <section
      aria-labelledby="stories-heading"
      className="border-y border-line bg-surface px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="type-overline text-accent">Student Success</p>
          <h2 id="stories-heading" className="type-h1 mt-3 text-ink">
            From student to software engineer
          </h2>
        </div>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Student success stories"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="mt-12 lg:mt-16"
        >
          <p aria-live="polite" className="sr-only">
            {`Story ${index + 1} of ${STORIES.length}: ${story.name}, ${story.role} at ${story.company}.`}
          </p>

          <div className="relative min-w-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={reduced ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.24 }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${STORIES.length}`}
                className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <figure className="relative m-0 min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-sunken">
                  <div className="aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]">
                    <img
                      src={story.image}
                      alt={story.name}
                      width={800}
                      height={800}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-inverse/85 px-5 py-4">
                    <p className="type-h3 text-on-inverse">{story.name}</p>
                    <p className="type-caption type-numeric mt-1 text-on-inverse/75">
                      {`Hired at ${story.company} · CRI ${story.cri}`}
                    </p>
                  </figcaption>
                </figure>

                <div className="min-w-0">
                  <blockquote className="type-h2 m-0 text-ink">
                    {`“${story.quote}”`}
                  </blockquote>
                  <p className="type-body-lg type-prose mt-5 text-muted">
                    {story.text}
                  </p>
                  <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0 rounded-[var(--radius-md)] border border-line bg-canvas p-4">
                      <dt className="type-overline text-faint">
                        Before PathSync Learning
                      </dt>
                      <dd className="type-label mt-1.5 text-ink">
                        {story.before}
                      </dd>
                    </div>
                    <div className="min-w-0 rounded-[var(--radius-md)] border border-primary-border bg-primary-soft p-4">
                      <dt className="type-overline text-primary">
                        After PathSync Learning
                      </dt>
                      <dd className="type-label mt-1.5 text-ink">
                        {story.after}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <IconButton
              label="Previous story"
              variant="secondary"
              size="lg"
              onClick={() => go(index - 1)}
            >
              <ChevronLeft size={18} aria-hidden />
            </IconButton>

            <ul className="flex list-none items-center gap-0 p-0">
              {STORIES.map((item, i) => (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to story ${i + 1}: ${item.name}`}
                    aria-current={i === index ? "true" : undefined}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-normal)] motion-reduce:transition-none ${
                        i === index ? "w-6 bg-primary" : "w-1.5 bg-line-strong"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <IconButton
              label="Next story"
              variant="secondary"
              size="lg"
              onClick={() => go(index + 1)}
            >
              <ChevronRight size={18} aria-hidden />
            </IconButton>
          </div>
        </div>
      </div>
    </section>
  );
}

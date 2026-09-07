"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

type FaqItem = { q: string; a: string };

const FAQS: readonly FaqItem[] = [
  {
    q: "How does the AI-generated roadmap work?",
    a: "Our AI engine analyzes millions of data points from recent job descriptions across top tech companies. It then cross-references this with your current skill level and degree syllabus to generate a highly personalized, week-by-week roadmap that targets the exact skills you need to land your dream role.",
  },
  {
    q: "Can I switch between Career Mode and Academic Mode?",
    a: "Absolutely! The toggle is available right on your dashboard. Academic Mode focuses on optimizing your CGPA and managing university deadlines, while Career Mode focuses on your Career Readiness Index (CRI) and placement preparation. You can balance both seamlessly.",
  },
  {
    q: "What is the Career Readiness Index (CRI)?",
    a: "The CRI is a proprietary metric developed by PathEd that quantifies how prepared you are for an industry role. It factors in your completed roadmap nodes, DSA proficiency, project quality, and mock interview performance to give recruiters a standardized measure of your skills.",
  },
  {
    q: "Is PathEd free for students?",
    a: "PathEd offers a comprehensive free tier that includes basic roadmaps, the community forum, and essential tracking. For advanced features like AI mock interviews, 1-on-1 teacher connect, and premium cert paths, we offer an affordable Student Pro subscription.",
  },
  {
    q: "How do recruiters find me on PathEd?",
    a: "Recruiters use our partner platform to filter students based on their CRI score, verified skills, and project portfolios. If you opt-in to the talent pool and maintain a high CRI, recruiters can send you direct interview invites, bypassing the standard resume screening phase.",
  },
];

/**
 * Disclosure list. Each row is a real `button[aria-expanded][aria-controls]`
 * paired with a labelled region, so it is keyboard-operable by default rather
 * than a click handler on a `div`. The first item starts open.
 */
export default function FAQ() {
  const reduced = useReducedMotion() ?? false;
  const baseId = useId();
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section
      aria-labelledby="faq-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="type-overline text-accent">Clarity</p>
          <h2 id="faq-heading" className="type-h1 mt-3 text-ink">
            Recently asked questions
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            Everything you need to know about how PathEd works.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-[48rem] list-none gap-3 p-0 lg:mt-14">
          {FAQS.map((faq, i) => {
            const open = openIdx === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;

            return (
              <li
                key={faq.q}
                className={`min-w-0 rounded-[var(--radius-lg)] border transition-[border-color,background-color] duration-[var(--duration-normal)] motion-reduce:transition-none ${
                  open
                    ? "border-primary-border bg-surface shadow-[var(--shadow-sm)]"
                    : "border-line bg-surface/60 hover:border-line-strong"
                }`}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    className="flex min-h-11 w-full items-center justify-between gap-4 rounded-[var(--radius-lg)] px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-6 sm:py-5"
                  >
                    <span
                      className={`type-h4 min-w-0 ${open ? "text-primary" : "text-ink"}`}
                    >
                      {faq.q}
                    </span>
                    <span
                      aria-hidden
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none ${
                        open
                          ? "border-primary-border bg-primary-soft text-primary"
                          : "border-line text-faint"
                      }`}
                    >
                      {open ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      key="panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="type-body px-5 pb-5 text-muted sm:px-6 sm:pb-6">
                        {faq.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

type Review = {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
};

const REVIEWS: readonly Review[] = [
  { id: 1, name: "Aryan Mehta", role: "SDE @ Microsoft", text: "PathEd's CRI tracker kept me laser-focused. I landed my dream role 6 months before graduation.", avatar: "AM" },
  { id: 2, name: "Priya Sharma", role: "ML Engineer @ Google", text: "The AI-fication feature literally remapped my roadmap to Google's exact skill stack.", avatar: "PS" },
  { id: 3, name: "Karan Singh", role: "DevOps @ Razorpay", text: "Balancing CGPA and career prep felt impossible until PathEd showed me exactly where to focus.", avatar: "KS" },
  { id: 4, name: "Neha Rao", role: "Full Stack @ Flipkart", text: "HackAttack gave me real projects with real deadlines. One project led directly to my offer letter.", avatar: "NR" },
  { id: 5, name: "Rohan Das", role: "Product Manager @ Zomato", text: "The product tracks are insane. Learned more here in 3 months than in 4 years of college.", avatar: "RD" },
  { id: 6, name: "Ananya Iyer", role: "Data Scientist @ Amazon", text: "Finally, a platform that doesn't just teach code, but teaches how to pass the actual interview.", avatar: "AI" },
  { id: 7, name: "Vikram Reddy", role: "SDE II @ Atlassian", text: "Used the community features to find a mock interview partner. Best decision ever.", avatar: "VR" },
  { id: 8, name: "Sneha Patil", role: "Cloud Architect @ AWS", text: "The cloud certification paths are perfectly structured. I got my AWS Solutions Architect cert in 4 weeks.", avatar: "SP" },
  { id: 9, name: "Rahul Verma", role: "Frontend Dev @ Swiggy", text: "My CRI score gave me the confidence to apply for senior roles straight out of college.", avatar: "RV" },
  { id: 10, name: "Diya Kapoor", role: "Security Analyst @ IBM", text: "The cybersecurity roadmap is top-tier. Real-world challenges that actually test your skills.", avatar: "DK" },
  { id: 11, name: "Arjun Nair", role: "Backend Eng @ Cred", text: "Nothing beats the gamified learning. The XP system kept me hooked on solving DSA daily.", avatar: "AN" },
  { id: 12, name: "Tanya Desai", role: "UI/UX Designer @ Canva", text: "Even for design, the portfolio building track was incredibly helpful for structuring my case studies.", avatar: "TD" },
];

const PER_PAGE = 3;
const PAGES = Math.ceil(REVIEWS.length / PER_PAGE);
const INTERVAL = 6000;

export default function Reviews() {
  const reduced = useReducedMotion() ?? false;
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(
      () => setPage((prev) => (prev + 1) % PAGES),
      INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [paused, reduced]);

  const visible = REVIEWS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section
      aria-labelledby="reviews-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="type-overline text-primary">Student voices</p>
          <h2 id="reviews-heading" className="type-h1 mt-3 text-ink">
            Those who walked the path
          </h2>
        </div>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Student reviews"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="mt-12 lg:mt-16"
        >
          <p aria-live="polite" className="sr-only">
            {`Showing reviews ${page * PER_PAGE + 1} to ${page * PER_PAGE + visible.length} of ${REVIEWS.length}.`}
          </p>

          {/* Track — the only element allowed to clip. */}
          <div className="min-w-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={page}
                initial={reduced ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.24 }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Page ${page + 1} of ${PAGES}`}
                className="grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-3"
              >
                {visible.map((review) => (
                  <li
                    key={review.id}
                    className="flex min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-xs)]"
                  >
                    <div
                      className="flex gap-0.5 text-accent"
                      aria-label="Rated 5 out of 5"
                      role="img"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          aria-hidden
                          className="fill-accent"
                        />
                      ))}
                    </div>

                    <blockquote className="type-body mt-5 flex-1 text-muted">
                      {`“${review.text}”`}
                    </blockquote>

                    <div className="mt-6 flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden
                        className="type-label flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
                      >
                        {review.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="type-label truncate text-ink">
                          {review.name}
                        </p>
                        <p className="type-caption truncate text-muted">
                          {review.role}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          <ul className="mt-8 flex list-none items-center justify-center p-0">
            {Array.from({ length: PAGES }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setPage(i)}
                  aria-label={`Go to reviews page ${i + 1} of ${PAGES}`}
                  aria-current={i === page ? "true" : undefined}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span
                    aria-hidden
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-normal)] motion-reduce:transition-none ${
                      i === page ? "w-6 bg-primary" : "w-1.5 bg-line-strong"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

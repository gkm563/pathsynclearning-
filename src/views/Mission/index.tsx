"use client";

import { QuoteSection, RecruiterValidationSection } from "@/components/ui/Shared";
import HeroSection from "./sections/HeroSection";
import HorizonSection from "./sections/HorizonSection";
import ImageRowSection from "./sections/ImageRowSection";
import ProblemSection from "./sections/ProblemSection";
import TransparencySection from "./sections/TransparencySection";
import { ALIGNMENT_ROW, RIPPLE_ROW, VISION_ROW } from "./sections/content";

/**
 * `/mission` — why PathEd exists.
 *
 * Reads as a single argument: the problem, the vision that answers it, the
 * impact, the commitments we make, and where it leads. Page chrome belongs to
 * `app/(marketing)/layout.tsx`.
 */
export default function Mission() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <ImageRowSection row={VISION_ROW} />
      <ImageRowSection row={RIPPLE_ROW} />
      <TransparencySection />
      <ImageRowSection row={ALIGNMENT_ROW} />
      <HorizonSection />

      <QuoteSection
        quote="Our mission is simple: to make sure no engineering student ever graduates wondering 'what now?'"
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection
        tag="A shared mission"
        title={
          <>
            Recruiting based
            <br />
            on merit.
          </>
        }
        desc1="We've partnered with forward-thinking recruiters who share our mission of democratizing access to opportunity. They use PathEd because they care about what you can build, not just where you went to school."
        desc2="Our platform eliminates hiring bias by providing objective, skill-based evidence of your readiness."
        img="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
      />
    </>
  );
}

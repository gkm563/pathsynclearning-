"use client";

import { QuoteSection, RecruiterValidationSection } from "@/components/ui/Shared";
import HeroSection from "./sections/HeroSection";
import ImageRowSection from "./sections/ImageRowSection";
import MemoryLaneSection from "./sections/MemoryLaneSection";
import ReadinessSection from "./sections/ReadinessSection";
import RoadmapSection from "./sections/RoadmapSection";
import SkillDecaySection from "./sections/SkillDecaySection";
import {
  CAREER_FUSION_ROW,
  CHALLENGES_ROW,
  FEEDBACK_LOOP_ROW,
  INTERVIEW_ROW,
  SKILL_TREES_ROW,
} from "./sections/content";

/**
 * `/platform` — public product overview.
 *
 * Page chrome (header, `<main>`, footer, background) belongs to
 * `app/(marketing)/layout.tsx`; this view only contributes sections.
 *
 * The `#features`, `#challenges` and `#skill-trees` anchors are linked from
 * the site navigation and the docs pages — they are part of the public URL
 * surface and must not be renamed.
 */
export default function Platform() {
  return (
    <>
      <HeroSection />
      <RoadmapSection />
      <ImageRowSection row={CHALLENGES_ROW} />
      <ImageRowSection row={SKILL_TREES_ROW} />
      <ReadinessSection />
      <ImageRowSection row={INTERVIEW_ROW} />
      <MemoryLaneSection />
      <ImageRowSection row={CAREER_FUSION_ROW} />
      <SkillDecaySection />
      <ImageRowSection row={FEEDBACK_LOOP_ROW} />

      <QuoteSection
        quote="The gap between learning and earning is a design flaw. PathEd is the patch."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection
        tag="Hiring dashboard"
        title={
          <>
            Platform-driven.
            <br />
            Direct placements.
          </>
        }
        desc1="PathEd's platform isn't just about learning; it's a seamless pipeline to employment. Our dashboard translates your daily efforts into a unified Career Readiness Index that recruiters trust."
        desc2="Top tech companies use our verified analytics to bypass traditional screening, meaning your platform profile becomes your strongest resume."
        img="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
      />
    </>
  );
}

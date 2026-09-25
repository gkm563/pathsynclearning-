"use client";

import { useEffect } from "react";
import { QuoteSection } from "../../components/ui/Shared";
import FAQ from "./sections/FAQ";
import HeroRegion from "./sections/HeroRegion";
import HowItWorks from "./sections/HowItWorks";
import PlatformOverview from "./sections/PlatformOverview";
import PreFooterCTA from "./sections/PreFooterCTA";
import Reviews from "./sections/Reviews";
import StatCounter from "./sections/StatCounter";
import SuccessStories from "./sections/SuccessStories";
import TrustedBy from "./sections/TrustedBy";
import VisualFeatures from "./sections/VisualFeatures";
import WhyPathEd from "./sections/WhyPathEd";

/**
 * Public landing page composition root.
 *
 * `(marketing)/layout.tsx` owns `<main>`, the page background, header and
 * footer, so this renders sections only. There is deliberately no page-level
 * `overflow-x-hidden`: each section keeps itself inside the viewport.
 */
export default function StudentLanding() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <HeroRegion />
      <StatCounter />
      <TrustedBy />
      <WhyPathEd />
      <HowItWorks />
      <VisualFeatures />
      <PlatformOverview />
      <SuccessStories />
      <Reviews />
      <QuoteSection
        quote="An engineering degree shouldn't be a gamble. PathEd is the blueprint for guaranteed readiness."
        author="Rahul Kushwaha"
        role="Co-Founder"
      />
      <FAQ />
      <PreFooterCTA />
    </>
  );
}

import {
  QuoteSection,
  RecruiterValidationSection,
} from "@/components/ui/Shared";
import CommunityHero from "./sections/CommunityHero";
import CommunityPillars from "./sections/CommunityPillars";
import LocalChaptersSection from "./sections/LocalChaptersSection";
import OpenSourceSection from "./sections/OpenSourceSection";

/**
 * /community — the peer ecosystem story.
 *
 * Page furniture (header, `<main>`, footer, page background) belongs to
 * `app/(marketing)/layout.tsx`; this view only contributes sections.
 */
export default function Community() {
  return (
    <>
      <CommunityHero />
      <CommunityPillars />
      <OpenSourceSection />
      <LocalChaptersSection />

      <QuoteSection
        quote="A great engineer is never built in isolation. It takes a community, a mentor, and a shared mission."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection
        tag="Vetted talent pool"
        title={
          <>
            A community of
            <br />
            proven builders.
          </>
        }
        desc1="Recruiters don't just look at individual profiles; they observe how you interact within the ecosystem. Your contributions to peer reviews, open source, and hackathons are all logged and validated."
        desc2="This creates a comprehensive, 360-degree view of your technical and soft skills, making it easier for recruiters to identify natural leaders and team players."
        img="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
      />
    </>
  );
}

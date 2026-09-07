import GuideGrid from "./sections/GuideGrid";
import GuidesCTA from "./sections/GuidesCTA";
import GuidesHero from "./sections/GuidesHero";

/**
 * /guides — the playbook index.
 *
 * Page furniture (header, `<main>`, footer, page background) belongs to
 * `app/(marketing)/layout.tsx`; this view only contributes sections.
 */
export default function Guides() {
  return (
    <>
      <GuidesHero />
      <GuideGrid />
      <GuidesCTA />
    </>
  );
}

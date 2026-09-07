import {
  QuoteSection,
  RecruiterValidationSection,
} from "@/components/ui/Shared";
import ArticleGrid from "./sections/ArticleGrid";
import BlogCTA from "./sections/BlogCTA";
import BlogHero from "./sections/BlogHero";

/**
 * /blog — the essay index.
 *
 * Page furniture (header, `<main>`, footer, page background) belongs to
 * `app/(marketing)/layout.tsx`; this view only contributes sections.
 */
export default function Blog() {
  return (
    <>
      <BlogHero />
      <ArticleGrid />
      <BlogCTA />

      <QuoteSection
        quote="Knowledge without a clear path to application is just trivia. It's time we engineer the path itself."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection
        tag="Industry perspectives"
        title={
          <>
            Read by engineers.
            <br />
            Trusted by HR.
          </>
        }
        desc1="Our blog doesn't just theorize about the future of education. The insights we share are actively consumed and validated by hiring managers across top tech firms."
        desc2="They understand that students learning on our platform are absorbing a curriculum engineered for real-world impact."
        img="https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80"
      />
    </>
  );
}

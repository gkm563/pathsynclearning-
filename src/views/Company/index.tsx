import {
  QuoteSection,
  RecruiterValidationSection,
} from "@/components/ui/Shared";
import CompanyGallery from "./sections/CompanyGallery";
import CompanyHero from "./sections/CompanyHero";
import CompanyStory from "./sections/CompanyStory";
import CompanyValues from "./sections/CompanyValues";
import ContactSection from "./sections/ContactSection";
import LeadershipSection from "./sections/LeadershipSection";

/**
 * /company — who builds PathEd, why, and how to reach us.
 *
 * Page furniture (header, `<main>`, footer, page background) belongs to
 * `app/(marketing)/layout.tsx`; this view only contributes sections.
 * `ContactSection` owns the `#contact` anchor the footer links to.
 */
export default function Company() {
  return (
    <>
      <CompanyHero />
      <LeadershipSection />
      <CompanyStory />
      <CompanyValues />
      <CompanyGallery />

      <QuoteSection
        quote="Built in Prayagraj. Scaled for the world. We are engineers building for engineers."
        author="Rahul Kushwaha"
        role="Co-Founder"
      />

      <RecruiterValidationSection
        tag="Corporate partnerships"
        title={
          <>
            Backed by companies
            <br />
            that matter.
          </>
        }
        desc1="Our company operates at the intersection of education and employment. Top global tech firms partner directly with PathEd because they believe in our robust technical evaluation standards."
        desc2="They recruit straight from our platform, trusting our transparent data over traditional academic credentials."
        img="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
      />

      <ContactSection />
    </>
  );
}

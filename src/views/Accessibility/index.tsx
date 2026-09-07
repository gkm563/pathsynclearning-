import {
  LegalArticle,
  type LegalSection,
} from "@/components/marketing/MarketingChrome";

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Our Commitment",
    blocks: [
      {
        kind: "p",
        text: "PathEd is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards to guarantee that our coding challenges, AI mentorship interfaces, and recruitment dashboards are usable by all.",
      },
    ],
  },
  {
    title: "Conformance Status",
    blocks: [
      {
        kind: "p",
        text: "The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. PathEd is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, primarily due to the highly interactive nature of our embedded code editors, which we are actively working to improve.",
      },
    ],
  },
  {
    title: "Core Accessibility Features",
    blocks: [
      {
        kind: "list",
        items: [
          {
            term: "Keyboard Navigation:",
            text: "All core platform features, including the Skill Trees and CRI dashboards, can be navigated using only a keyboard.",
          },
          {
            term: "Screen Reader Support:",
            text: "Semantic HTML and ARIA labels are implemented across our UI components.",
          },
          {
            term: "Color Contrast:",
            text: "Our dark mode and light mode themes are designed to meet strict WCAG contrast ratios for text readability.",
          },
          {
            term: "Adjustable UI:",
            text: "The embedded IDE allows users to increase font sizes and adjust contrast themes without breaking the layout.",
          },
        ],
      },
    ],
  },
  {
    title: "Feedback",
    blocks: [
      {
        kind: "p",
        text: "We welcome your feedback on the accessibility of PathEd. Please let us know if you encounter accessibility barriers by contacting our support team at the address below. We try to respond to feedback within 2 business days.",
      },
      {
        kind: "contact",
        label: "Accessibility support",
        email: "accessibility@pathed.in",
      },
    ],
  },
];

export default function Accessibility() {
  return (
    <LegalArticle
      title="Accessibility Statement"
      updated="July 20, 2026"
      summary="How PathEd approaches digital accessibility, where we currently stand against WCAG 2.1 level AA, and how to tell us when we fall short."
      sections={SECTIONS}
    />
  );
}

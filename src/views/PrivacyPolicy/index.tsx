import {
  LegalArticle,
  type LegalSection,
} from "@/components/marketing/MarketingChrome";

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Introduction",
    blocks: [
      {
        kind: "p",
        text: "Welcome to PathEd. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.",
      },
    ],
  },
  {
    title: "The Data We Collect About You",
    blocks: [
      {
        kind: "p",
        text: "Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:",
      },
      {
        kind: "list",
        items: [
          {
            term: "Identity Data:",
            text: "includes first name, last name, username or similar identifier, and title.",
          },
          {
            term: "Contact Data:",
            text: "includes email address and telephone numbers.",
          },
          {
            term: "Technical Data:",
            text: "includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.",
          },
          {
            term: "Profile Data:",
            text: "includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.",
          },
          {
            term: "Usage Data:",
            text: "includes information about how you use our website, products and services.",
          },
          {
            term: "Academic Data:",
            text: "includes your university, major, graduation year, and GPA.",
          },
          {
            term: "Performance Data:",
            text: "includes your Career Readiness Index (CRI), code submissions, challenge results, and skill tree progress.",
          },
        ],
      },
    ],
  },
  {
    title: "How Is Your Personal Data Collected?",
    blocks: [
      {
        kind: "p",
        text: "We use different methods to collect data from and about you including through:",
      },
      {
        kind: "list",
        items: [
          {
            term: "Direct interactions.",
            text: "You may give us your Identity, Contact, Profile, and Academic Data by filling in forms or by corresponding with us by post, phone, email or otherwise.",
          },
          {
            term: "Automated technologies or interactions.",
            text: "As you interact with our website, we will automatically collect Technical Data about your equipment, browsing actions and patterns.",
          },
          {
            term: "Platform usage.",
            text: "We automatically collect Performance Data as you solve coding challenges, interact with the AI mentor, and progress through skill trees.",
          },
        ],
      },
    ],
  },
  {
    title: "How We Use Your Personal Data",
    blocks: [
      {
        kind: "p",
        text: "We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:",
      },
      {
        kind: "list",
        items: [
          {
            text: "Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing access to the platform).",
          },
          {
            text: "Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests (e.g., calculating your CRI score).",
          },
          { text: "Where we need to comply with a legal obligation." },
          {
            text: (
              <>
                To share your Profile and Performance Data with verified
                corporate recruiters,{" "}
                <strong>only if you have explicitly opted-in</strong> to the
                PathEd Hiring Network.
              </>
            ),
          },
        ],
      },
    ],
  },
  {
    title: "Data Security",
    blocks: [
      {
        kind: "p",
        text: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.",
      },
    ],
  },
  {
    title: "Your Legal Rights",
    blocks: [
      {
        kind: "p",
        text: "Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:",
      },
      {
        kind: "list",
        items: [
          { text: "Request access to your personal data." },
          { text: "Request correction of your personal data." },
          { text: "Request erasure of your personal data." },
          { text: "Object to processing of your personal data." },
          { text: "Request restriction of processing your personal data." },
          { text: "Request transfer of your personal data." },
          { text: "Right to withdraw consent." },
        ],
      },
    ],
  },
  {
    title: "Contact Us",
    blocks: [
      {
        kind: "p",
        text: "If you have any questions about this Privacy Policy, please contact us at the address below.",
      },
      {
        kind: "contact",
        label: "Privacy enquiries",
        email: "privacy@pathed.in",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalArticle
      title="Privacy Policy"
      updated="July 20, 2026"
      summary="What personal data PathEd collects, why we collect it, how we secure it, and the rights you can exercise over it at any time."
      sections={SECTIONS}
    />
  );
}

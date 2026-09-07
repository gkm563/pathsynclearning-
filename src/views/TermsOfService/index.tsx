import {
  LegalArticle,
  type LegalSection,
} from "@/components/marketing/MarketingChrome";

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Agreement to Terms",
    blocks: [
      {
        kind: "p",
        text: "By accessing or using PathEd, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this site. The materials contained in this platform are protected by applicable copyright and trademark law.",
      },
    ],
  },
  {
    title: "User License",
    blocks: [
      {
        kind: "p",
        text: "Permission is granted to temporarily download one copy of the materials (information or software) on PathEd’s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:",
      },
      {
        kind: "list",
        items: [
          { text: "Modify or copy the materials;" },
          {
            text: "Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);",
          },
          {
            text: "Attempt to decompile or reverse engineer any software contained on PathEd’s website;",
          },
          {
            text: "Remove any copyright or other proprietary notations from the materials; or",
          },
          {
            text: "Transfer the materials to another person or “mirror” the materials on any other server.",
          },
        ],
      },
    ],
  },
  {
    title: "Academic Integrity and Anti-Cheating",
    blocks: [
      {
        kind: "p",
        text: "PathEd’s Career Readiness Index (CRI) relies on the authentic performance of its users. By using the platform, you agree to adhere to strict standards of academic integrity:",
      },
      {
        kind: "list",
        items: [
          {
            text: "All code submissions must be your own original work unless explicitly stated in collaborative environments.",
          },
          {
            text: "You may not use automated bots, scripts, or unauthorized AI agents to solve challenges on your behalf.",
          },
          {
            text: "You may not share solutions to active challenges with other students.",
          },
        ],
      },
      {
        kind: "note",
        label: "Note:",
        text: "Violation of these integrity standards will result in the immediate resetting of your CRI score and potential permanent suspension from the PathEd platform and Hiring Network.",
      },
    ],
  },
  {
    title: "Disclaimer",
    blocks: [
      {
        kind: "p",
        text: "The materials on PathEd's website are provided on an 'as is' basis. PathEd makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
      },
    ],
  },
  {
    title: "Limitations",
    blocks: [
      {
        kind: "p",
        text: "In no event shall PathEd or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PathEd's website, even if PathEd or a PathEd authorized representative has been notified orally or in writing of the possibility of such damage.",
      },
    ],
  },
  {
    title: "Modifications",
    blocks: [
      {
        kind: "p",
        text: "PathEd may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.",
      },
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalArticle
      title="Terms of Service"
      updated="July 20, 2026"
      summary="The rules that govern your use of PathEd — the licence we grant you, the academic integrity standards we enforce, and the limits of our liability."
      sections={SECTIONS}
    />
  );
}

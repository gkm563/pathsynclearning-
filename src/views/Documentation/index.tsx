import {
  DocProse,
  DocsShell,
  MarketingHero,
  MarketingPage,
  type DocsNavGroup,
} from "@/components/marketing/MarketingChrome";

/* -------------------------------------------------------------------------
   Content model — every section is data, rendered by one loop below.
   `id` values are in-page anchor targets linked from the sidebar and from
   external links; they must not change.
------------------------------------------------------------------------- */

type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "steps"; items: readonly { term: string; text: string }[] }
  | { kind: "bullets"; items: readonly { term: string; text: string }[] }
  | { kind: "callout"; title: string; text: string }
  | { kind: "concepts"; items: readonly { title: string; text: string }[] };

interface DocSection {
  id: string;
  title: string;
  blocks: readonly DocBlock[];
}

const DOC_NAV: readonly DocsNavGroup[] = [
  {
    label: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick Start" },
      { id: "core-concepts", label: "Core Concepts" },
    ],
  },
  {
    label: "Platform Features",
    items: [
      { id: "skill-trees", label: "Skill Trees" },
      { id: "cri-algorithm", label: "CRI Algorithm" },
      { id: "ai-mentorship", label: "AI Mentorship" },
    ],
  },
];

const SECTIONS: readonly DocSection[] = [
  {
    id: "introduction",
    title: "What is PathEd?",
    blocks: [
      {
        kind: "p",
        text: "PathEd is a highly technical EdTech ecosystem designed specifically for engineering students. We observed a massive disconnect between what universities teach and what companies actually need. PathEd bridges this gap by providing dynamically updated, industry-vetted roadmaps.",
      },
      {
        kind: "callout",
        title: "The Core Philosophy",
        text: "We believe in proof-of-work over traditional grading. Every module you complete on PathEd involves building real-world projects that directly contribute to your CRI score.",
      },
    ],
  },
  {
    id: "quick-start",
    title: "Quick Start",
    blocks: [
      {
        kind: "p",
        text: "Getting started with PathEd takes less than 5 minutes. To begin your journey to a high CRI score:",
      },
      {
        kind: "steps",
        items: [
          {
            term: "Create your Account:",
            text: "Register with your University email to unlock student perks.",
          },
          {
            term: "Take the Diagnostic:",
            text: "Our AI will ask you a series of coding and conceptual questions to gauge your baseline.",
          },
          {
            term: "Select your Target Role:",
            text: "Choose from roles like Frontend Engineer, Backend Engineer, Data Scientist, etc.",
          },
          {
            term: "Follow the Generated Roadmap:",
            text: "Begin solving the first set of challenges tailored precisely to your skill gaps.",
          },
        ],
      },
    ],
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    blocks: [
      {
        kind: "p",
        text: "To succeed on PathEd, you need to understand the three pillars of our platform:",
      },
      {
        kind: "concepts",
        items: [
          {
            title: "Proof of Work",
            text: "We do not do multiple-choice quizzes. Everything is project-based. You write code, our automated CI/CD pipeline tests it against hidden test cases.",
          },
          {
            title: "Skill Decay",
            text: "Technology moves fast. If you don't use a skill, your rating in that specific node will slowly decay over time, mimicking real-world knowledge retention.",
          },
          {
            title: "Recruiter Transparency",
            text: "Recruiters on our platform can see your exact code submissions (with your permission), allowing them to evaluate your actual coding style.",
          },
        ],
      },
    ],
  },
  {
    id: "skill-trees",
    title: "Skill Trees",
    blocks: [
      {
        kind: "p",
        text: 'Our Skill Trees are directed acyclic graphs (DAGs) representing dependencies between technologies. You cannot attempt a "React" challenge until you have proven competency in "Vanilla JavaScript DOM Manipulation". This enforces strong foundational learning.',
      },
    ],
  },
  {
    id: "cri-algorithm",
    title: "The CRI Algorithm",
    blocks: [
      {
        kind: "p",
        text: "The Career Readiness Index (CRI) is a deterministic 0–100.000 score calculated from verified PathED evidence for your current target career. PathED does not assign CRI; it computes it. CRI indicates readiness. It does not guarantee a job or tell a recruiter to hire.",
      },
      {
        kind: "bullets",
        items: [
          {
            term: "Evidence:",
            text: "Assessments, DSA attempts, projects, interviews, roadmap mastery, consistency, and profile completeness. Each component is 0–100 with published weights (formula cri.v1).",
          },
          {
            term: "Precision:",
            text: "Stored as millipoints (78.263%). Every recompute writes an audit snapshot so you can open Why this CRI? and inspect Evidence IDs.",
          },
          {
            term: "Career-scoped:",
            text: "Changing career recalculates CRI from evidence that still applies. Unrelated proof does not transfer. Missing evidence scores 0.",
          },
          {
            term: "Not in v1:",
            text: "Verified open-source PRs, hackathon rank, and third-party certifications are reserved until those artifacts can be verified.",
          },
        ],
      },
    ],
  },
  {
    id: "ai-mentorship",
    title: "AI Mentorship",
    blocks: [
      {
        kind: "p",
        text: "If you get stuck on a challenge, PathEd does not just give you the answer. Our integrated AI Mentor uses Socratic questioning to guide you toward the solution. The AI analyzes your abstract syntax tree (AST) in real-time to identify the exact logical flaw in your approach.",
      },
    ],
  },
];

/* ----------------------------------------------------------------------- */

function DocBlockView({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <DocProse>
          <p>{block.text}</p>
        </DocProse>
      );
    case "steps":
      return (
        <DocProse>
          <ol>
            {block.items.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong> {item.text}
              </li>
            ))}
          </ol>
        </DocProse>
      );
    case "bullets":
      return (
        <DocProse>
          <ul>
            {block.items.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong> {item.text}
              </li>
            ))}
          </ul>
        </DocProse>
      );
    case "callout":
      return (
        <aside className="min-w-0 rounded-[var(--radius-md)] border border-primary-border bg-primary-soft/50 px-5 py-4">
          <h3 className="type-h4 m-0 text-ink">{block.title}</h3>
          <p className="type-body mt-2 mb-0 text-muted">{block.text}</p>
        </aside>
      );
    case "concepts":
      return (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item) => (
            <li
              key={item.title}
              className="min-w-0 rounded-[var(--radius-md)] border border-line bg-surface p-5 shadow-[var(--shadow-xs)]"
            >
              <h3 className="type-h4 m-0 text-ink">{item.title}</h3>
              <p className="type-small mt-2 mb-0 text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      );
  }
}

export default function Documentation() {
  return (
    <MarketingPage>
      <MarketingHero
        align="left"
        kicker="Documentation"
        title="Introduction to PathEd"
        description="Welcome to the official PathEd documentation. Here you'll find everything you need to understand the platform's architecture, how the Career Readiness Index (CRI) is calculated, and how our skill trees map directly to industry demands."
      />

      <DocsShell nav={DOC_NAV}>
        <div className="flex min-w-0 flex-col gap-14 pt-2 lg:gap-16">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="min-w-0 scroll-mt-24"
            >
              <h2 className="type-h2 m-0 text-ink">{section.title}</h2>
              <div className="mt-4 flex min-w-0 flex-col gap-5">
                {section.blocks.map((block, index) => (
                  <DocBlockView key={index} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </DocsShell>
    </MarketingPage>
  );
}

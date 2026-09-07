/**
 * Placement inbox mock dataset.
 *
 * Prototype data only — there is no recruiter API yet. Keeping it in a typed
 * module rather than inline in the view means the components are written
 * against a real contract, so swapping in a fetch later is a local change.
 */

export type MessageStatusKind = "invite" | "shortlisted" | "open" | "action";

export type MessageFilter = "all" | "invites" | "pending";

export type RecruiterMessage = {
  id: string;
  company: string;
  /** Monogram shown when a company has no logo asset. */
  initials: string;
  role: string;
  recruiter: {
    name: string;
    title: string;
    imageUrl: string;
  };
  receivedOn: string;
  status: { kind: MessageStatusKind; label: string };
  compensation: string;
  location: string;
  /** Career Readiness Index the recruiter screens on. */
  criThreshold: number;
  snippet: string;
  body: string;
};

/** The signed-in student's current CRI, used to gate threshold messaging. */
export const STUDENT_CRI = 62;

export const RECRUITER_MESSAGES: readonly RecruiterMessage[] = [
  {
    id: "m1",
    company: "Stripe",
    initials: "S",
    role: "Software Engineer (Backend) — Intern",
    recruiter: {
      name: "Rebecca Chen",
      title: "University Recruiting Lead",
      imageUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    },
    receivedOn: "July 22, 2026",
    status: { kind: "invite", label: "Interview offered" },
    compensation: "₹45,000 / month + housing allowance",
    location: "Bangalore (Hybrid)",
    criThreshold: 60,
    snippet:
      "Your DSA node mastery (72%) and Career Readiness Index caught our attention. We'd love to fast-track you…",
    body: "Hi Rahul,\n\nI'm Rebecca from the Stripe engineering recruiting team. We've been tracking B.Tech candidates with exceptional system consistency on PathEd, and your profile stands out in the top 15% percentile.\n\nParticularly, your 72% DSA mastery rating and recent project showcase meet our high standards for backend engineering interns. We would like to invite you for a 45-minute technical review next week. You will skip our standard resume screening and initial coding test, going straight to the engineering whiteboard assessment.\n\nLet us know if you are interested, and click 'Accept invite' to sync your calendar.\n\nBest,\nRebecca Chen",
  },
  {
    id: "m2",
    company: "Google Labs",
    initials: "G",
    role: "Associate AI Resident Engineer",
    recruiter: {
      name: "David Miller",
      title: "Principal AI Recruiter",
      imageUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
    },
    receivedOn: "July 20, 2026",
    status: { kind: "shortlisted", label: "Test passed — shortlisted" },
    compensation: "₹18 LPA base + performance bonus",
    location: "Hyderabad (On-site)",
    criThreshold: 62,
    snippet:
      "Congratulations! You've cleared the Google AI Global Hackathon evaluation with a score matching our…",
    body: "Hi Rahul,\n\nCongratulations on completing the Google AI Global Hackathon challenge! Your platform performance matches our benchmark for the Associate AI Resident Program.\n\nOur engineering team has reviewed your code structure and verified your data structures fundamentals on PathEd. Since your CRI of 62% satisfies our minimum residency criteria, we have updated your status to Shortlisted.\n\nYour next step is a 1-on-1 discussion with an AI research mentor from Google Labs Bangalore. Please confirm your availability.\n\nCheers,\nDavid Miller",
  },
  {
    id: "m3",
    company: "Razorpay",
    initials: "R",
    role: "Full Stack Engineer (React / Node)",
    recruiter: {
      name: "Neha Sharma",
      title: "Lead Tech Recruiter",
      imageUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    },
    receivedOn: "July 18, 2026",
    status: { kind: "open", label: "Application open" },
    compensation: "₹12 – ₹15 LPA",
    location: "Bangalore / Remote",
    criThreshold: 55,
    snippet:
      "We are hiring for our Core Payments team. Your high Web Dev (88%) score makes you an excellent fit…",
    body: "Hi Rahul,\n\nI'm Neha from Razorpay. We are scaling our core payments engineering team and looking for junior developers with strong front-end capability and solid API design knowledge.\n\nYour PathEd skill profile shows an 88% mastery rating in Web Development and excellent responsive coding speed. We'd love to review your application. As you already have a verified portfolio, you can apply directly with a single click. No extra forms are needed.\n\nLooking forward to your application!\n\nBest regards,\nNeha",
  },
  {
    id: "m4",
    company: "Mercedes-Benz R&D India",
    initials: "M",
    role: "Graduate Engineer Trainee (C++)",
    recruiter: {
      name: "Arjun Verma",
      title: "Head of Talent Acquisition",
      imageUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    },
    receivedOn: "July 15, 2026",
    status: { kind: "invite", label: "Direct interview invite" },
    compensation: "₹10 LPA base + benefits",
    location: "Pune / Bangalore",
    criThreshold: 58,
    snippet:
      "We saw your solid fundamentals in object-oriented programming and C++. We have bypassed the round 1 test…",
    body: "Hello Rahul,\n\nWe are recruiting Graduate Engineer Trainees for our automotive software engineering division at Mercedes-Benz Research and Development India.\n\nYour verified OOP fundamentals (90% rating) and C++ memory management skills align perfectly with our engine simulation team. We've bypassed the Round 1 screening test for you. Please choose a slot for a live C++ coding review with our panel.\n\nThanks,\nArjun Verma",
  },
  {
    id: "m5",
    company: "Adobe",
    initials: "A",
    role: "Software Engineer — Document Cloud",
    recruiter: {
      name: "Sarah Connor",
      title: "Senior Tech Talent Partner",
      imageUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    },
    receivedOn: "July 10, 2026",
    status: { kind: "action", label: "Action required" },
    compensation: "₹22 LPA base + stocks",
    location: "Noida / Hybrid",
    criThreshold: 65,
    snippet:
      "Your profile matches our SDE 1 requirements, but your DBMS index node is below our 70% threshold. Boost…",
    body: "Hi Rahul,\n\nWe have reviewed your profile for the Document Cloud team. Your overall CRI of 62% is excellent, and your coding performance is very strong.\n\nHowever, our technical filters for this role require a minimum of 70% mastery in DBMS concepts, specifically Indexing & B-Trees, which is currently at 60% on your graph. If you can complete the remaining DBMS nodes and verify them this week, you will automatically unlock this interview slot.\n\nKeep coding and let us know once you've unlocked it!\n\nBest,\nSarah Connor",
  },
];

export const MESSAGE_FILTERS: ReadonlyArray<{
  id: MessageFilter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "invites", label: "Invites" },
  { id: "pending", label: "Pending" },
];

const FILTER_KINDS: Record<MessageFilter, readonly MessageStatusKind[]> = {
  all: ["invite", "shortlisted", "open", "action"],
  invites: ["invite", "shortlisted"],
  pending: ["open", "action"],
};

export function matchesFilter(
  message: RecruiterMessage,
  filter: MessageFilter,
): boolean {
  return FILTER_KINDS[filter].includes(message.status.kind);
}

export function matchesQuery(
  message: RecruiterMessage,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    message.company.toLowerCase().includes(q) ||
    message.role.toLowerCase().includes(q) ||
    message.snippet.toLowerCase().includes(q)
  );
}

/** Badge tone per status. Kept beside the data so tones stay consistent. */
export const STATUS_TONE: Record<
  MessageStatusKind,
  "success" | "info" | "accent" | "warning"
> = {
  invite: "success",
  shortlisted: "accent",
  open: "info",
  action: "warning",
};

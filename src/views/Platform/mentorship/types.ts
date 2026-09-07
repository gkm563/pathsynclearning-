/**
 * Mentorship domain types.
 *
 * The mentorship route is still prototype UI backed by the fixtures in
 * `./data`, but everything it renders is typed here so the components never
 * fall back to `any` and a change to the fixture shape fails the typecheck
 * instead of the page.
 */

export type MentorCategory = "AI/ML" | "SDE" | "Cloud";

/** Category filter for the browse grid — `all` is the default. */
export type MentorCategoryFilter = "all" | MentorCategory;

export type Mentor = {
  id: string;
  name: string;
  /** Remote portrait; rendered inside an aspect-ratio box to avoid CLS. */
  image: string;
  company: string;
  role: string;
  category: MentorCategory;
  /** Years of industry experience. */
  exp: number;
  rating: number;
  reviews: number;
  skills: string[];
  certifications: string[];
  roadmaps: string[];
  /** Pre-formatted count, e.g. "1,200+". */
  students: string;
  /** "<topic> - <when>" — split into a `LiveSession` by `liveSessionsFor`. */
  upcomingSession: string;
  availability: string;
  quote: string;
  beforePath: string;
  afterPath: string;
};

export type LiveSession = {
  topic: string;
  date: string;
};

/** Which of the three mentorship sections is showing. */
export type MentorshipTab = "my-mentors" | "browse" | "instructor";

export type BookingAgenda = {
  id: string;
  label: string;
  description: string;
};

export type InstructorSlot = {
  day: string;
  time: string;
  status: "Active" | "Full";
  remaining: number;
};

export type InstructorClass = {
  topic: string;
  date: string;
  registered: number;
};

export type PerformanceStat = {
  label: string;
  value: string;
  hint: string;
};

/** Async status for the mock dataset load, so the page can show real states. */
export type LoadStatus = "loading" | "ready" | "error";

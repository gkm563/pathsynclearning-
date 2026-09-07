import type {
  BookingAgenda,
  InstructorClass,
  InstructorSlot,
  LiveSession,
  Mentor,
  MentorCategory,
  PerformanceStat,
} from "./types";

/**
 * Mentorship fixtures.
 *
 * Prototype data for `/dashboard/mentorship`. It lives here rather than inside
 * the view so the components stay presentational and the shapes are checked
 * once against `./types`.
 */

export const MENTORS: readonly Mentor[] = [
  {
    id: "m1",
    name: "Dr. Arpan Mukherjee",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=500",
    company: "IIT Kanpur",
    role: "ML Researcher & Professor",
    category: "AI/ML",
    exp: 12,
    rating: 4.9,
    reviews: 142,
    skills: ["Machine Learning", "Deep Learning", "PyTorch"],
    certifications: ["PhD in AI — Stanford"],
    roadmaps: ["AI Engineer", "Data Scientist"],
    students: "1,200+",
    upcomingSession: "ML Optimization Frameworks - Sunday @ 4 PM",
    availability: "Saturdays 10 AM - 2 PM",
    quote: "Research and industry applications must merge to create true systems.",
    beforePath: "Struggling with theory",
    afterPath: "AI research lead",
  },
  {
    id: "m2",
    name: "Shreya Sen",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Google",
    role: "Senior AI Engineer",
    category: "AI/ML",
    exp: 8,
    rating: 4.8,
    reviews: 98,
    skills: ["TensorFlow", "Computer Vision", "Python"],
    certifications: ["Google Cloud Professional ML Engineer"],
    roadmaps: ["AI Engineer"],
    students: "840+",
    upcomingSession: "Preparing for Google STEP interviews - Wednesday @ 7 PM",
    availability: "Weekdays 6 PM - 8 PM",
    quote: "Don't just learn frameworks; understand optimization math.",
    beforePath: "Struggling with math",
    afterPath: "Google STEP intern",
  },
  {
    id: "m3",
    name: "Vikram Malhotra",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Microsoft",
    role: "Senior ML Research Engineer",
    category: "AI/ML",
    exp: 7,
    rating: 4.7,
    reviews: 75,
    skills: ["Large Language Models", "Transformers", "NLP"],
    certifications: ["Microsoft Azure AI Specialist"],
    roadmaps: ["Data Scientist"],
    students: "620+",
    upcomingSession: "Transformers & Attention Mechanics - Friday @ 6 PM",
    availability: "Sundays 3 PM - 7 PM",
    quote: "Language modeling is shifting paradigms; learn to deploy at scale.",
    beforePath: "Lacking scale projects",
    afterPath: "Microsoft AI SDE",
  },
  {
    id: "m4",
    name: "Sarah Jenkins",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Meta",
    role: "AI Research Scientist",
    category: "AI/ML",
    exp: 9,
    rating: 4.9,
    reviews: 112,
    skills: ["Reinforcement Learning", "NLP", "PyTorch"],
    certifications: ["PhD in CS — Berkeley"],
    roadmaps: ["AI Engineer"],
    students: "740+",
    upcomingSession: "Agentic AI & Meta Llama Tractions - Tuesday @ 8 PM",
    availability: "Weekends 2 PM - 5 PM",
    quote: "Building systems that reason requires deep paradigm changes.",
    beforePath: "Struggling with NLP",
    afterPath: "Meta SDE intern",
  },
  {
    id: "m5",
    name: "David Chen",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500",
    company: "OpenAI",
    role: "Research Scientist",
    category: "AI/ML",
    exp: 6,
    rating: 4.9,
    reviews: 89,
    skills: ["GPT Architectures", "RLHF", "Python"],
    certifications: ["PhD — MIT"],
    roadmaps: ["AI Engineer", "NLP Architect"],
    students: "510+",
    upcomingSession: "Introduction to RLHF Mechanics - Monday @ 6 PM",
    availability: "Fridays 10 AM - 1 PM",
    quote: "Aligning models to human intent is the next frontier of software.",
    beforePath: "Stuck in theory",
    afterPath: "OpenAI fellow",
  },
  {
    id: "m6",
    name: "Rohan Verma",
    image:
      "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Uber",
    role: "Senior Staff Engineer",
    category: "SDE",
    exp: 10,
    rating: 4.8,
    reviews: 120,
    skills: ["Java", "Distributed Systems", "Go", "Kubernetes"],
    certifications: ["Oracle Certified Master Java Developer"],
    roadmaps: ["Software Engineer"],
    students: "1,100+",
    upcomingSession: "Microservices & Distributed Caching - Thursday @ 7 PM",
    availability: "Sundays 11 AM - 3 PM",
    quote: "Real engineers focus on reliability, fault tolerance, and simple code.",
    beforePath: "Struggling with Go",
    afterPath: "Uber tech intern",
  },
  {
    id: "m7",
    name: "Priya Sharma",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500",
    company: "TechCorp",
    role: "Senior Software Engineer",
    category: "SDE",
    exp: 8,
    rating: 4.9,
    reviews: 215,
    skills: ["React", "System Design", "Node.js", "MongoDB"],
    certifications: ["AWS Certified Solutions Architect"],
    roadmaps: ["Software Engineer"],
    students: "1,450+",
    upcomingSession: "Thinking like an Engineer: DSA Traverses - Saturday @ 3 PM",
    availability: "Weekends 10 AM - 12 PM",
    quote:
      "PathEd didn't just teach me code. It taught me how to think like an engineer.",
    beforePath: "Struggling with DSA",
    afterPath: "Backend SDE",
  },
  {
    id: "m8",
    name: "Marcus Aurelius",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Apple",
    role: "Core OS Developer",
    category: "SDE",
    exp: 15,
    rating: 4.9,
    reviews: 130,
    skills: ["C++", "Kernel Dev", "Assembly", "Operating Systems"],
    certifications: ["UNIX Internals Expert"],
    roadmaps: ["Software Engineer"],
    students: "780+",
    upcomingSession: "Understanding Kernel Processes & Deadlocks - Sunday @ 2 PM",
    availability: "Mondays 3 PM - 5 PM",
    quote: "Optimize at the hardware layer. Everything else is abstraction.",
    beforePath: "Theoretical OS basics only",
    afterPath: "Core OS developer",
  },
  {
    id: "m9",
    name: "Kenji Sato",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Sony",
    role: "Embedded Lead Engineer",
    category: "SDE",
    exp: 11,
    rating: 4.7,
    reviews: 62,
    skills: ["C", "RTOS", "Firmware Development", "IoT"],
    certifications: ["RTOS Systems Architect"],
    roadmaps: ["Software Engineer"],
    students: "430+",
    upcomingSession: "Firmware Optimization & Battery Management - Friday @ 5 PM",
    availability: "Thursdays 4 PM - 7 PM",
    quote: "Code correctly the first time. Embedded systems don't have updates.",
    beforePath: "Struggling with RTOS",
    afterPath: "Sony firmware architect",
  },
  {
    id: "m10",
    name: "Clara Oswald",
    image:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Netflix",
    role: "Senior Backend Developer",
    category: "SDE",
    exp: 7,
    rating: 4.8,
    reviews: 94,
    skills: ["Node.js", "Redis", "Kafka", "Graph Databases"],
    certifications: ["Redisson Specialist Developer"],
    roadmaps: ["Software Engineer"],
    students: "810+",
    upcomingSession: "High-Throughput Streaming & Redis Caching - Saturday @ 6 PM",
    availability: "Weekdays 8 AM - 10 AM",
    quote: "Scalability isn't just about load. It's about data latency.",
    beforePath: "Struggling with caching",
    afterPath: "Netflix staff engineer",
  },
  {
    id: "m11",
    name: "Anjali Gupta",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Amazon Web Services",
    role: "Lead Data Scientist",
    category: "Cloud",
    exp: 9,
    rating: 4.9,
    reviews: 110,
    skills: ["SQL", "DBMS", "AWS Cloud", "Redshift"],
    certifications: ["AWS Certified Data Analytics Specialist"],
    roadmaps: ["Data Scientist", "Cloud Architect"],
    students: "950+",
    upcomingSession: "Database Indexing & Big Data Pipelines - Saturday @ 11 AM",
    availability: "Weekends 11 AM - 3 PM",
    quote: "Data is only useful if it can be queried instantly at scale.",
    beforePath: "Database normalisation gaps",
    afterPath: "AWS analytics architect",
  },
  {
    id: "m12",
    name: "Nitin Das",
    image:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Oracle",
    role: "Principal Database Architect",
    category: "Cloud",
    exp: 14,
    rating: 4.8,
    reviews: 87,
    skills: ["Oracle Database", "SQL PL/SQL", "High Availability"],
    certifications: ["Oracle Database Administration Certified Professional"],
    roadmaps: ["Database Administrator"],
    students: "530+",
    upcomingSession: "Understanding Transaction Isolation Levels - Tuesday @ 7 PM",
    availability: "Wednesdays 3 PM - 6 PM",
    quote: "Understand ACID compliance before scaling horizontally.",
    beforePath: "Struggling with ACID",
    afterPath: "Principal Oracle DBA",
  },
  {
    id: "m13",
    name: "Elena Rostova",
    image:
      "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Yandex",
    role: "Principal Database Lead",
    category: "Cloud",
    exp: 10,
    rating: 4.8,
    reviews: 69,
    skills: ["PostgreSQL", "NoSQL Architectures", "ClickHouse"],
    certifications: ["Postgres Advanced Specialist"],
    roadmaps: ["Data Engineer"],
    students: "390+",
    upcomingSession: "ClickHouse Traverses for Realtime OLAP - Sunday @ 10 AM",
    availability: "Weekends 10 AM - 1 PM",
    quote: "Pick the database paradigm that matches your read-write distribution.",
    beforePath: "Unoptimised PostgreSQL structures",
    afterPath: "Yandex database architect",
  },
  {
    id: "m14",
    name: "Sandeep Nair",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Google Cloud",
    role: "Solutions Architect",
    category: "Cloud",
    exp: 12,
    rating: 4.9,
    reviews: 142,
    skills: ["GCP Platform", "BigQuery", "Terraform", "Cloud Functions"],
    certifications: ["Google Cloud Certified Professional Cloud Architect"],
    roadmaps: ["Cloud Architect"],
    students: "1,150+",
    upcomingSession: "Terraform Infrastructure as Code Patterns - Friday @ 4 PM",
    availability: "Weekdays 5 PM - 7 PM",
    quote: "Automate everything. Manual deployments are bugs in waiting.",
    beforePath: "Manual configurations prone to error",
    afterPath: "GCP solutions architect",
  },
  {
    id: "m15",
    name: "Maya Lin",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Snowflake",
    role: "Principal Engineer",
    category: "Cloud",
    exp: 8,
    rating: 4.8,
    reviews: 79,
    skills: ["Data Warehousing", "Snowflake Architectures", "SQL"],
    certifications: ["SnowPro Core Certification"],
    roadmaps: ["Data Engineer"],
    students: "680+",
    upcomingSession: "Data Warehousing and Scaling Snowflake - Monday @ 7 PM",
    availability: "Tuesdays 9 AM - 12 PM",
    quote: "Separate compute from storage. It is cheaper and faster.",
    beforePath: "High-latency big-data query locks",
    afterPath: "Snowflake principal consultant",
  },
];

/** Mentor pre-selected in "My mentors" so the section isn't empty on arrival. */
export const DEFAULT_ACTIVE_MENTOR_IDS: readonly string[] = ["m7"];

/** The mentor whose card shows a placement case study instead of a syllabus. */
export const CASE_STUDY_MENTOR_ID = "m7";

export const MENTOR_CATEGORIES: readonly {
  id: MentorCategory;
  label: string;
  blurb: string;
}[] = [
  {
    id: "AI/ML",
    label: "AI & ML",
    blurb: "Researchers and applied scientists shipping models in production.",
  },
  {
    id: "SDE",
    label: "Core SDE",
    blurb: "Systems, backend and platform engineers from tier-1 teams.",
  },
  {
    id: "Cloud",
    label: "Data & cloud",
    blurb: "Database, warehousing and cloud architecture specialists.",
  },
];

export const BOOKING_SLOTS: readonly string[] = [
  "Saturday 10:00 AM",
  "Saturday 11:30 AM",
  "Sunday 3:00 PM",
  "Sunday 4:30 PM",
];

export const BOOKING_AGENDAS: readonly BookingAgenda[] = [
  {
    id: "resume",
    label: "Resume review & placement pitch",
    description: "Line-by-line review of your resume against the target role.",
  },
  {
    id: "mock-interview",
    label: "Technical mock interview",
    description: "45 minutes of live problem solving with written feedback.",
  },
  {
    id: "roadmap",
    label: "Roadmap & syllabus check",
    description: "Find the gaps between your roadmap and the hiring bar.",
  },
];

export const INSTRUCTOR_SLOTS: readonly InstructorSlot[] = [
  { day: "Saturday", time: "10:00 AM - 12:00 PM", status: "Active", remaining: 3 },
  { day: "Saturday", time: "02:00 PM - 04:00 PM", status: "Active", remaining: 2 },
  { day: "Sunday", time: "11:00 AM - 01:00 PM", status: "Full", remaining: 0 },
];

export const INSTRUCTOR_CLASSES: readonly InstructorClass[] = [
  {
    topic: "ML Systems Design & Hyper-parameter Triage",
    date: "Sunday, Oct 24 @ 4:00 PM",
    registered: 184,
  },
  {
    topic: "Deep Learning Neural Weight Topologies",
    date: "Wednesday, Oct 27 @ 6:00 PM",
    registered: 310,
  },
];

export const PERFORMANCE_STATS: readonly PerformanceStat[] = [
  { label: "Average rating", value: "4.9 / 5.0", hint: "Across 142 student reviews" },
  { label: "Class hours", value: "148", hint: "Teaching logs synced this term" },
  { label: "Coins earned", value: "14,500", hint: "Redeemable in the PathEd store" },
];

/** Long-form bio. The case-study mentor has bespoke copy; the rest is derived. */
export function mentorBio(mentor: Mentor): string {
  if (mentor.id === CASE_STUDY_MENTOR_ID) {
    return `${mentor.name} is a Senior Software Engineer with ${mentor.exp}+ years of experience. She specialises in building highly scalable React applications, microservices and backend system design. Her mentorship focuses on the jump from academic theory to enterprise-grade engineering.`;
  }
  return `${mentor.name} is a senior practitioner at ${mentor.company} with ${mentor.exp} years of industry experience. Specialising in ${mentor.skills.join(", ")}, their curriculum simulates real production environments — mastering roadmap requirements, writing optimised code and preparing for tier-1 recruitment rounds.`;
}

/** Splits the fixture's "<topic> - <when>" string into a renderable session. */
export function liveSessionsFor(mentor: Mentor): LiveSession[] {
  const [topic, date] = mentor.upcomingSession.split(" - ");
  return [{ topic, date: date ?? "Scheduled tomorrow @ 4 PM" }];
}

/** Throws on an empty fixture so the view can surface a real error state. */
export function loadMentors(): Mentor[] {
  if (MENTORS.length === 0) {
    throw new Error("Mentor directory is empty.");
  }
  return [...MENTORS];
}

import type {
  PublicSquad,
  SquadDomain,
  TaskColumnId,
  WorkspaceSquad,
} from "./types";

/**
 * Hack Squad fixtures for `/dashboard/hack-squad`.
 *
 * Prototype data only — kept out of the components so the views stay
 * presentational and every shape is validated against `./types`.
 */

export const SQUAD_DOMAINS: readonly SquadDomain[] = [
  "Artificial Intelligence",
  "IoT & Smart Cities",
  "Web3 & Blockchain",
  "Bio-Tech Research",
];

export const PUBLIC_SQUADS: readonly PublicSquad[] = [
  {
    id: "s1",
    name: "Hyperion AI",
    hackathon: "Google AI Global Hackathon 2026",
    domain: "Artificial Intelligence",
    timeLeft: "2 days left",
    teamSize: 4,
    maxSize: 5,
    leader: { name: "Anish Sen", college: "IIT Kharagpur" },
    members: [
      { name: "Anish Sen", role: "AI lead", github: "anish-ai" },
      { name: "Rohit Das", role: "Backend dev", github: "rohit-coder" },
      { name: "Kriti Sharma", role: "UI/UX designer", github: "kriti-design" },
      { name: "Rahul Menon", role: "Presentation lead", github: "rahul-pres" },
    ],
    openPositions: ["React Frontend Developer"],
    tags: ["TensorFlow", "React", "Python"],
    description:
      "Building a localised multi-modal agent workspace that streamlines rural educational content curation using LLMs.",
  },
  {
    id: "s2",
    name: "Byte Busters",
    hackathon: "Smart India Hackathon 2026",
    domain: "IoT & Smart Cities",
    timeLeft: "15 days left",
    teamSize: 3,
    maxSize: 6,
    leader: { name: "Pooja Hegde", college: "BITS Pilani" },
    members: [
      { name: "Pooja Hegde", role: "IoT hardware lead", github: "pooja-bits" },
      { name: "Vikram Malhotra", role: "Embedded C dev", github: "vikram-embed" },
      { name: "Suresh Rao", role: "Data analyst", github: "suresh-data" },
    ],
    openPositions: [
      "Backend Developer (Node/Express)",
      "Mobile App Developer",
    ],
    tags: ["Arduino", "Node.js", "Express"],
    description:
      "Developing a smart waste monitoring grid with fill-level alerts and gas indicators for municipal authorities.",
  },
  {
    id: "s3",
    name: "Decentralized Wizards",
    hackathon: "Solana Speedrun Hackathon 2026",
    domain: "Web3 & Blockchain",
    timeLeft: "6 days left",
    teamSize: 4,
    maxSize: 5,
    leader: { name: "Abhinav Anand", college: "IIT Delhi" },
    members: [
      { name: "Abhinav Anand", role: "Solana architect", github: "abhinav-web3" },
      { name: "Rajat Verma", role: "Smart contract QA", github: "rajat-contract" },
      { name: "Neha Roy", role: "Frontend developer", github: "neha-front" },
      { name: "Viktor Petrov", role: "Tokenomics planner", github: "viktor-token" },
    ],
    openPositions: ["Rust Smart Contract Engineer"],
    tags: ["Rust", "Solana", "Web3.js"],
    description:
      "Creating zero-slippage yield aggregators optimised for micro-loans across decentralised farming unions.",
  },
  {
    id: "s4",
    name: "Bio-Synth Labs",
    hackathon: "MIT Global Bio-Innovate Challenge",
    domain: "Bio-Tech Research",
    timeLeft: "22 days left",
    teamSize: 3,
    maxSize: 4,
    leader: { name: "Dr. Sandeep Sen", college: "IIT Bombay" },
    members: [
      { name: "Dr. Sandeep Sen", role: "Bioinformatics analyst", github: "sandeep-bio" },
      { name: "Amit Soni", role: "Systems biologist", github: "amit-system" },
      { name: "Sunita Reddy", role: "UI designer", github: "sunita-reddy" },
    ],
    openPositions: ["Research & Presentation Lead"],
    tags: ["R", "Python", "BioPython"],
    description:
      "Correlating enzyme structures with machine-learning prediction to discover eco-friendly biodegradable plastics.",
  },
];

/** Column order and labels for the sprint board. */
export const TASK_COLUMNS: readonly {
  id: TaskColumnId;
  label: string;
  /** Label for the control that moves a task into this column. */
  moveLabel: string;
}[] = [
  { id: "todo", label: "To do", moveLabel: "Move to to do" },
  { id: "progress", label: "In progress", moveLabel: "Start work" },
  { id: "review", label: "In review", moveLabel: "Send to review" },
  { id: "done", label: "Done", moveLabel: "Mark done" },
];

export const DEFAULT_SQUAD_DURATION_HOURS = "24";

/** Squad the student already owns, so the workspace has something to show. */
export const INITIAL_WORKSPACE_SQUADS: readonly WorkspaceSquad[] = [
  {
    id: "sq1",
    name: "Zenith Devs",
    hackathon: "Microsoft Imagine Cup 2026",
    targetTime: 0, // Replaced with a real deadline on load.
    leader: "Rahul Kushwaha (You)",
    members: [
      {
        id: "u1",
        name: "Rahul Kushwaha (You)",
        role: "Frontend architect & presentation",
        availability: "20h/week",
        github: "rahul-kushwaha",
        rating: 4.9,
        score: 92,
      },
      {
        id: "u2",
        name: "Sneha Nair",
        role: "AI research scientist",
        availability: "15h/week",
        github: "sneha-nair",
        rating: 4.8,
        score: 88,
      },
      {
        id: "u3",
        name: "Priya Sharma",
        role: "Backend engineer",
        availability: "18h/week",
        github: "priya-sharma",
        rating: 4.7,
        score: 85,
      },
      {
        id: "u4",
        name: "Amit Patel",
        role: "UI/UX designer",
        availability: "10h/week",
        github: "amit-design",
        rating: 4.5,
        score: 80,
      },
    ],
    pendingInvites: [],
    gitLog: [
      {
        author: "Priya Sharma",
        message: "Refactored node authentication and router error boundaries.",
        time: "5 minutes ago",
      },
      {
        author: "Sneha Nair",
        message: "Merged pull request #12: core AI inference backend pipeline.",
        time: "1 hour ago",
      },
      {
        author: "Rahul Kushwaha",
        message: "Updated dashboard layout, icons and custom scrollbars.",
        time: "3 hours ago",
      },
      {
        author: "Amit Patel",
        message: "Pushed prototype Figma slide exports and assets.",
        time: "5 hours ago",
      },
    ],
    announcements: [
      {
        id: "an1",
        author: "Rahul Kushwaha",
        title: "Mock pitch at 4 PM today",
        text: "Please gather in the voice room. Bring your slide draft.",
        date: "Today, 11:30 AM",
      },
      {
        id: "an2",
        author: "Sneha Nair",
        title: "AI inference accuracy benchmark",
        text: "Hit 94.2% precision on the eval set. Core weights pushed to the repo.",
        date: "Yesterday",
      },
    ],
    files: [
      { name: "Imagine_Cup_PitchDeck_v2.pdf", size: "4.8 MB", author: "Rahul K." },
      { name: "System_Architecture_Imagine.png", size: "1.2 MB", author: "Priya S." },
      { name: "API_Endpoints_Definition.md", size: "32 KB", author: "Priya S." },
    ],
    tasks: [
      {
        id: "t1",
        title: "Figma slides polish",
        description: "Add core visual highlights and slide structure.",
        column: "todo",
        assignee: "Amit Patel",
      },
      {
        id: "t2",
        title: "API Swagger docs",
        description: "Write the endpoint definition file for developers.",
        column: "progress",
        assignee: "Priya Sharma",
      },
      {
        id: "t3",
        title: "AI model deploy",
        description: "Containerise the weight scripts using Docker.",
        column: "review",
        assignee: "Sneha Nair",
      },
      {
        id: "t4",
        title: "Dashboard responsive shell",
        description: "Make the grid components read cleanly on tablets.",
        column: "done",
        assignee: "Rahul Kushwaha",
      },
    ],
    voiceCallActive: false,
    voiceMuted: false,
    videoActive: false,
  },
];

const DAY_MS = 86_400_000;

/**
 * Seeds the owned squads with a deadline relative to now, so the countdown is
 * always running rather than frozen at a build-time constant.
 */
export function loadWorkspaceSquads(): WorkspaceSquad[] {
  return INITIAL_WORKSPACE_SQUADS.map((squad) => ({
    ...squad,
    targetTime: Date.now() + DAY_MS - 15_000,
    members: squad.members.map((member) => ({ ...member })),
    tasks: squad.tasks.map((task) => ({ ...task })),
    gitLog: [...squad.gitLog],
    announcements: [...squad.announcements],
    files: [...squad.files],
    pendingInvites: [...squad.pendingInvites],
  }));
}

/** Throws on an empty fixture so the view can surface a real error state. */
export function loadPublicSquads(): PublicSquad[] {
  if (PUBLIC_SQUADS.length === 0) {
    throw new Error("Squad directory is empty.");
  }
  return PUBLIC_SQUADS.map((squad) => ({ ...squad }));
}

/** Zero-padded HH:MM:SS countdown. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

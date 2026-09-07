/**
 * Hack Squad domain types.
 *
 * `/dashboard/hack-squad` has two distinct shapes: `PublicSquad` for the
 * open directory anyone can apply to, and `WorkspaceSquad` for a squad the
 * student actually owns. They are deliberately separate — the workspace
 * carries live collaboration state the directory has no concept of.
 */

export type SquadDomain =
  | "Artificial Intelligence"
  | "IoT & Smart Cities"
  | "Web3 & Blockchain"
  | "Bio-Tech Research";

/** Domain filter for the public directory — `all` is the default. */
export type SquadDomainFilter = "all" | SquadDomain;

export type PublicSquadMember = {
  name: string;
  role: string;
  github: string;
};

export type PublicSquad = {
  id: string;
  name: string;
  hackathon: string;
  domain: SquadDomain;
  /** Human-readable deadline, e.g. "2 days left". */
  timeLeft: string;
  teamSize: number;
  maxSize: number;
  leader: { name: string; college: string };
  members: PublicSquadMember[];
  openPositions: string[];
  tags: string[];
  description: string;
};

export type WorkspaceMember = {
  id: string;
  name: string;
  role: string;
  /** Weekly commitment, e.g. "20h/week". */
  availability: string;
  github: string;
  rating: number;
  /** Contribution points shown as XP. */
  score: number;
};

export type TaskColumnId = "todo" | "progress" | "review" | "done";

export type SquadTask = {
  id: string;
  title: string;
  description: string;
  column: TaskColumnId;
  assignee: string;
};

export type GitCommit = {
  author: string;
  message: string;
  time: string;
};

export type SquadAnnouncement = {
  id: string;
  author: string;
  title: string;
  text: string;
  date: string;
};

export type SharedFile = {
  name: string;
  size: string;
  author: string;
};

export type WorkspaceSquad = {
  id: string;
  name: string;
  hackathon: string;
  /** Epoch ms of the submission deadline; drives the live countdown. */
  targetTime: number;
  leader: string;
  members: WorkspaceMember[];
  /** User ids invited but not yet accepted. */
  pendingInvites: string[];
  gitLog: GitCommit[];
  announcements: SquadAnnouncement[];
  files: SharedFile[];
  tasks: SquadTask[];
  voiceCallActive: boolean;
  voiceMuted: boolean;
  videoActive: boolean;
};

/** Values collected by the create-squad dialog. */
export type NewSquadDraft = {
  name: string;
  hackathon: string;
  description: string;
  requiredSkills: string;
  teamSize: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  inviteIds: string[];
};

export type ApplyDraft = {
  role: string;
  pitch: string;
};

export type LoadStatus = "loading" | "ready" | "error";

/** In-page sections on `/dashboard/hack-squad`. */
export type HackSquadTab = "browse" | "workspace";

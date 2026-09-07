export type CollabSubTab = "my-space" | "marketplace";
export type WorkspaceTab = "chat" | "tasks" | "github" | "notes";
export type TaskStatus = "todo" | "progress" | "completed";
export type ProjectType = "original" | "participating";
export type MarketType = "participate" | "recruit" | "collaborators";
export type FilterType = "all" | MarketType;

export type ChatMessage = {
  user: string;
  text: string;
  time: string;
};

export type ProjectTask = {
  id: string;
  title: string;
  status: TaskStatus;
};

export type GitCommit = {
  msg: string;
  date: string;
};

export type MyProject = {
  id: string;
  name: string;
  type: ProjectType;
  owner: string;
  progress: number;
  status: string;
  tech: string[];
  slots: string;
  timeline: string;
  members: string[];
  chat: ChatMessage[];
  tasks: ProjectTask[];
  notes: string;
  gitCommits: GitCommit[];
};

export type BrowseProject = {
  id: string;
  name: string;
  owner: string;
  desc: string;
  type: MarketType;
  tech: string[];
  teamSize: number;
  slots: string;
  difficulty: string;
  col: string;
  image: string;
};

export type Collaborator = {
  name: string;
  role: string;
  avatar: string;
  col: string;
  spec: string;
  college: string;
};

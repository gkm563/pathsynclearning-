/** Shared PathED Copilot types — safe for client and server. */

export type CopilotRole = "user" | "assistant";

export type CopilotNavigate = {
  href: string;
  label: string;
};

export type CopilotCreateNoteWrite = {
  type: "create_note";
  title: string;
  content: string;
  summary: string;
};

export type CopilotBookmarkWrite = {
  type: "bookmark_news";
  articleId: string;
  bookmarked: boolean;
  title?: string;
  summary: string;
};

export type CopilotProposedWrite = CopilotCreateNoteWrite | CopilotBookmarkWrite;

export type CopilotWriteStatus = "pending" | "done" | "cancelled";

export type CopilotChatMsg = {
  id?: string;
  role: CopilotRole;
  text: string;
  at: string;
  navigate?: CopilotNavigate[];
  proposedWrites?: CopilotProposedWrite[];
  writeStatus?: CopilotWriteStatus;
};

export type CopilotThreadSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type CopilotHistoryTurn = {
  role: CopilotRole;
  content: string;
};

export type CopilotPageEntity =
  | { type: "news"; id: string }
  | { type: "problem"; slug: string }
  | { type: "none" };

export type CopilotChatResponse = {
  reply: string;
  threadId: string;
  messageId?: string;
  navigate?: CopilotNavigate[];
  proposedWrites?: CopilotProposedWrite[];
  refused?: boolean;
  fallback?: boolean;
};

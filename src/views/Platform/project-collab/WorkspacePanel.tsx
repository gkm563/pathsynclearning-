"use client";

import type { FormEvent, RefObject } from "react";
import {
  CheckCircle2,
  FileText,
  GitCommitHorizontal,
  KanbanSquare,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import {
  Button,
  IconButton,
  Input,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { MyProject, TaskStatus, WorkspaceTab } from "./types";

const TABS: { id: WorkspaceTab; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Team chat", icon: MessageSquare },
  { id: "tasks", label: "Sprint board", icon: KanbanSquare },
  { id: "github", label: "Git history", icon: GitCommitHorizontal },
  { id: "notes", label: "Shared notes", icon: FileText },
];

export function WorkspacePanel({
  project,
  workspaceTab,
  isMembersOpen,
  messageInput,
  chatEndRef,
  onWorkspaceTab,
  onMembersToggle,
  onMessageChange,
  onSendChat,
  onTaskStatusChange,
  onUpdateNotes,
  onJoinVoice,
}: {
  project: MyProject;
  workspaceTab: WorkspaceTab;
  isMembersOpen: boolean;
  messageInput: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onWorkspaceTab: (tab: WorkspaceTab) => void;
  onMembersToggle: () => void;
  onMessageChange: (value: string) => void;
  onSendChat: () => void;
  onTaskStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onUpdateNotes: (notes: string) => void;
  onJoinVoice: () => void;
}) {
  const submitChat = (event: FormEvent) => {
    event.preventDefault();
    onSendChat();
  };

  return (
    <div className="grid grid-cols-1 gap-4 border-t border-line pt-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="flex flex-col gap-1 lg:border-r lg:border-line lg:pr-4" aria-label="Workspace sections">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = workspaceTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onWorkspaceTab(tab.id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left type-small font-semibold",
                active ? "bg-primary-soft text-primary" : "text-muted hover:bg-sunken hover:text-ink",
              )}
            >
              <Icon size={16} aria-hidden />
              {tab.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onMembersToggle}
          className={cn(
            "flex min-h-11 items-center justify-between gap-2 rounded-[var(--radius-md)] px-3 text-left type-small font-semibold",
            isMembersOpen ? "bg-sunken text-ink" : "text-muted hover:bg-sunken hover:text-ink",
          )}
          aria-expanded={isMembersOpen}
        >
          <span className="inline-flex items-center gap-2">
            <Users size={16} aria-hidden />
            Team members
          </span>
        </button>
        {isMembersOpen ? (
          <ul className="m-0 flex list-none flex-col gap-2 py-1 pl-3 p-0">
            {project.members.map((member, index) => {
              const isLive = index % 2 === 0;
              return (
                <li key={member} className="flex items-center gap-2 type-small text-ink">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      isLive ? "bg-success" : "bg-danger",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 truncate">{member}</span>
                  {member === "Rahul Kushwaha" ? (
                    <span className="type-caption text-faint">(You)</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
        <Button variant="secondary" className="mt-auto min-h-11" onClick={onJoinVoice}>
          <Users size={14} aria-hidden />
          Join voice room
        </Button>
      </nav>

      <div className="min-w-0">
        {workspaceTab === "chat" ? (
          <div className="flex h-80 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {project.chat.map((msg, index) => (
                <div key={`${msg.user}-${index}`} className="flex flex-col gap-1">
                  <p className="type-caption m-0 text-faint">
                    {msg.user} · {msg.time}
                  </p>
                  <p className="type-small m-0 max-w-[80%] rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-2 text-ink">
                    {msg.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={submitChat} className="mt-3 flex gap-2 border-t border-line pt-3">
              <Input
                value={messageInput}
                onChange={(event) => onMessageChange(event.target.value)}
                placeholder="Type message to collaborators..."
                aria-label="Chat message"
                className="flex-1"
              />
              <IconButton type="submit" label="Send message" variant="primary" className="min-h-11 min-w-11">
                <Send size={16} aria-hidden />
              </IconButton>
            </form>
          </div>
        ) : null}

        {workspaceTab === "tasks" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] bg-sunken p-3">
              <p className="type-caption mb-3 font-semibold text-primary">Sprint work backlog</p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {project.tasks
                  .filter((task) => task.status !== "completed")
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-3"
                    >
                      <span className="type-small font-medium text-ink">{task.title}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="min-h-11 shrink-0"
                        onClick={() => onTaskStatusChange(task.id, "completed")}
                      >
                        Done
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-md)] bg-sunken p-3">
              <p className="type-caption mb-3 font-semibold text-success">Done list</p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {project.tasks
                  .filter((task) => task.status === "completed")
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-3 text-muted"
                    >
                      <CheckCircle2 size={14} className="text-success" aria-hidden />
                      <span className="type-small line-through">{task.title}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : null}

        {workspaceTab === "github" ? (
          <div className="flex flex-col gap-2">
            <p className="type-caption m-0 text-muted">
              Connected repo: github.com/rahulkushwaha/{project.name.toLowerCase().replace(/ /g, "-")}
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {project.gitCommits.map((commit, index) => (
                <li
                  key={`${commit.msg}-${index}`}
                  className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-line bg-sunken p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="type-small font-medium text-ink">{commit.msg}</span>
                  <span className="type-caption shrink-0 text-faint">{commit.date}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {workspaceTab === "notes" ? (
          <div>
            <p className="type-caption mb-2 text-muted">Collaborative sprint pad (auto-save)</p>
            <Textarea
              value={project.notes}
              onChange={(event) => onUpdateNotes(event.target.value)}
              aria-label="Shared notes"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

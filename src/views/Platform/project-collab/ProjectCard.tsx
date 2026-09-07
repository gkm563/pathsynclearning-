"use client";

import type { RefObject } from "react";
import { KanbanSquare, Lock } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Progress,
} from "@/components/ui";
import type { MyProject } from "./types";
import { WorkspacePanel } from "./WorkspacePanel";

export function ProjectCard({
  project,
  workspaceOpen,
  isPremium,
  workspaceTab,
  isMembersOpen,
  messageInput,
  chatEndRef,
  onBack,
  onToggleWorkspace,
  onWorkspaceTab,
  onMembersToggle,
  onMessageChange,
  onSendChat,
  onTaskStatusChange,
  onUpdateNotes,
  onJoinVoice,
  onUpgrade,
}: {
  project: MyProject;
  workspaceOpen: boolean;
  isPremium: boolean;
  workspaceTab: "chat" | "tasks" | "github" | "notes";
  isMembersOpen: boolean;
  messageInput: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onToggleWorkspace: () => void;
  onWorkspaceTab: (tab: "chat" | "tasks" | "github" | "notes") => void;
  onMembersToggle: () => void;
  onMessageChange: (value: string) => void;
  onSendChat: () => void;
  onTaskStatusChange: (taskId: string, nextStatus: "todo" | "progress" | "completed") => void;
  onUpdateNotes: (notes: string) => void;
  onJoinVoice: () => void;
  onUpgrade: () => void;
}) {
  return (
    <Card className="flex flex-col gap-5">
      {workspaceOpen ? (
        <div className="border-b border-line pb-3">
          <Button variant="secondary" size="sm" className="min-h-11" onClick={onBack}>
            Go back to all projects
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Badge tone={project.type === "original" ? "accent" : "success"}>
            {project.type === "original" ? "Owner (original)" : "Participating"}
          </Badge>
          <h3 className="type-h3 mt-2 mb-0 text-ink">{project.name}</h3>
          <p className="type-small m-0 text-muted">
            Admin: <span className="font-semibold text-ink">{project.owner}</span> · Timeline:{" "}
            {project.timeline}
          </p>
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {project.tech.map((tech) => (
            <li key={tech}>
              <Badge tone="neutral">{tech}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-md)] bg-sunken p-4 sm:grid-cols-2">
        <Progress
          value={project.progress}
          label="Sprint progress"
          showValue
        />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="type-caption m-0 text-faint">Open squad positions</p>
            <p className="type-small m-0 font-semibold text-danger">{project.slots}</p>
          </div>
          <div className="flex">
            {project.members.map((member) => (
              <Avatar
                key={member}
                name={member}
                size="sm"
                className="-ml-2 first:ml-0 border-2 border-surface"
              />
            ))}
          </div>
        </div>
      </div>

      <Button
        variant={workspaceOpen ? "secondary" : "outline"}
        className="min-h-11 w-full"
        onClick={onToggleWorkspace}
      >
        <KanbanSquare size={16} aria-hidden />
        {workspaceOpen ? "Close private workspace" : "Open private workspace"}
      </Button>

      {workspaceOpen ? (
        isPremium ? (
          <WorkspacePanel
            project={project}
            workspaceTab={workspaceTab}
            isMembersOpen={isMembersOpen}
            messageInput={messageInput}
            chatEndRef={chatEndRef}
            onWorkspaceTab={onWorkspaceTab}
            onMembersToggle={onMembersToggle}
            onMessageChange={onMessageChange}
            onSendChat={onSendChat}
            onTaskStatusChange={onTaskStatusChange}
            onUpdateNotes={onUpdateNotes}
            onJoinVoice={onJoinVoice}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[var(--radius-md)] border border-dashed border-line px-4 py-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Lock size={20} aria-hidden />
            </span>
            <div>
              <h4 className="type-h4 m-0 text-ink">Workspace locked on free plan</h4>
              <p className="type-small mx-auto mt-1 mb-0 max-w-md text-muted">
                Upgrade to PathED Premium to unlock private workspaces, interactive chat, sprint boards, notes pads, and Github deployment histories.
              </p>
            </div>
            <Button className="min-h-11" onClick={onUpgrade}>
              Upgrade Premium
            </Button>
          </div>
        )
      ) : null}
    </Card>
  );
}

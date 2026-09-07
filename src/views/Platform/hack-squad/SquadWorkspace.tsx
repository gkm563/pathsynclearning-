"use client";

import { FormEvent } from "react";
import {
  FolderOpen,
  GitCommitHorizontal,
  Mic,
  MicOff,
  PhoneOff,
  Plus,
  Radio,
  Trash2,
  Video,
  VideoOff,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Select,
} from "@/components/ui";
import { formatCountdown, TASK_COLUMNS } from "./data";
import type { SpeakingState } from "./useSquadWorkspace";
import type { TaskColumnId, WorkspaceSquad } from "./types";

function displayName(name: string): string {
  return name.replace(" (You)", "");
}

function VoiceChannel({
  squad,
  speaking,
  onStart,
  onEnd,
  onToggleMute,
  onToggleVideo,
  onJoinLiveClass,
}: {
  squad: WorkspaceSquad;
  speaking: SpeakingState;
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onJoinLiveClass: () => void;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio
            size={16}
            aria-hidden
            className={squad.voiceCallActive ? "text-success" : "text-faint"}
          />
          <h3 className="type-h4 m-0 text-ink">Voice channel</h3>
        </div>
        <Badge tone={squad.voiceCallActive ? "success" : "neutral"}>
          {squad.voiceCallActive ? "Connected" : "Offline"}
        </Badge>
      </div>

      {!squad.voiceCallActive ? (
        <EmptyState
          compact
          icon={<Radio size={18} aria-hidden />}
          title="Voice room offline"
          description="Start a call to sync the sprint with your squad."
          action={
            <Button onClick={onStart}>
              <Radio size={14} aria-hidden />
              Start voice call
            </Button>
          }
        />
      ) : (
        <>
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
            {squad.members.map((member) => {
              const isSpeaking = Boolean(speaking[member.id]);
              return (
                <li
                  key={member.id}
                  className={`flex min-w-0 items-center gap-2 rounded-[var(--radius-md)] border px-2.5 py-2 ${
                    isSpeaking
                      ? "border-success bg-success-soft"
                      : "border-line bg-sunken"
                  }`}
                >
                  <Avatar name={member.name} size="xs" />
                  <div className="min-w-0">
                    <p className="type-caption m-0 truncate font-semibold text-ink">
                      {displayName(member.name)}
                    </p>
                    <p
                      className={`type-caption m-0 ${
                        isSpeaking ? "text-success" : "text-faint"
                      }`}
                    >
                      {isSpeaking ? "Speaking" : "Muted"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={squad.voiceMuted ? "danger" : "secondary"}
              size="sm"
              className="min-h-11 flex-1"
              onClick={onToggleMute}
            >
              {squad.voiceMuted ? <MicOff size={14} aria-hidden /> : <Mic size={14} aria-hidden />}
              {squad.voiceMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              variant={squad.videoActive ? "primary" : "secondary"}
              size="sm"
              className="min-h-11 flex-1"
              onClick={onToggleVideo}
            >
              {squad.videoActive ? (
                <Video size={14} aria-hidden />
              ) : (
                <VideoOff size={14} aria-hidden />
              )}
              {squad.videoActive ? "Video on" : "Camera"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="min-h-11 flex-1"
              onClick={onJoinLiveClass}
            >
              <Video size={14} aria-hidden />
              Live classroom
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="min-h-11 flex-1"
              onClick={onEnd}
            >
              <PhoneOff size={14} aria-hidden />
              End call
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function SprintBoard({
  squad,
  onAddTask,
  onMoveTask,
}: {
  squad: WorkspaceSquad;
  onAddTask: (title: string, assignee: string) => void;
  onMoveTask: (taskId: string, column: TaskColumnId) => void;
}) {
  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("taskTitle") ?? "");
    const assignee = String(data.get("taskAssignee") ?? "");
    if (!title.trim()) return;
    onAddTask(title, assignee);
    form.reset();
  };

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="type-h4 m-0 text-ink">Sprint board</h3>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="taskTitle"
          required
          placeholder="Add a sprint task…"
          aria-label="New task title"
          className="flex-1"
        />
        <Select
          name="taskAssignee"
          defaultValue={squad.members[0]?.name ?? "Rahul Kushwaha"}
          aria-label="Task assignee"
          className="sm:w-48"
        >
          {squad.members.map((member) => (
            <option key={member.id} value={member.name}>
              {displayName(member.name)}
            </option>
          ))}
        </Select>
        <IconButton type="submit" label="Add task" variant="primary">
          <Plus size={16} aria-hidden />
        </IconButton>
      </form>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_COLUMNS.map((column) => {
          const tasks = squad.tasks.filter((task) => task.column === column.id);
          const nextColumn =
            column.id === "todo"
              ? "progress"
              : column.id === "progress"
                ? "review"
                : column.id === "review"
                  ? "done"
                  : null;
          const nextMeta = TASK_COLUMNS.find((item) => item.id === nextColumn);

          return (
            <div
              key={column.id}
              className="flex min-h-44 flex-col gap-2 rounded-[var(--radius-md)] bg-sunken p-2.5"
            >
              <p className="type-caption m-0 text-center font-semibold text-faint">
                {column.label}
              </p>
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-[var(--radius-md)] border border-line bg-surface p-2.5"
                >
                  <p
                    className={`type-small m-0 font-semibold text-ink ${
                      column.id === "done" ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="type-caption m-0 mt-1 text-muted">
                    {task.assignee}
                  </p>
                  {nextColumn && nextMeta ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 w-full"
                      onClick={() => onMoveTask(task.id, nextColumn)}
                    >
                      {nextMeta.moveLabel}
                    </Button>
                  ) : (
                    <p className="type-caption m-0 mt-2 text-center text-success">
                      Verified
                    </p>
                  )}
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function SquadWorkspace({
  squad,
  now,
  speaking,
  onDelete,
  onAddTask,
  onMoveTask,
  onSetVoice,
  onToggleMute,
  onToggleVideo,
  onJoinLiveClass,
  onUpload,
}: {
  squad: WorkspaceSquad;
  now: number;
  speaking: SpeakingState;
  onDelete: () => void;
  onAddTask: (title: string, assignee: string) => void;
  onMoveTask: (taskId: string, column: TaskColumnId) => void;
  onSetVoice: (active: boolean) => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onJoinLiveClass: () => void;
  onUpload: () => void;
}) {
  const countdown = formatCountdown(
    Math.max(0, Math.floor((squad.targetTime - now) / 1000)),
  );
  const rosterCount = squad.members.length + squad.pendingInvites.length;

  return (
    <article className="flex min-w-0 flex-col gap-5 border-b border-line pb-8 last:border-b-0 last:pb-0">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="type-h3 m-0 text-ink">{squad.name}</h2>
          <p className="type-small m-0 text-muted">{squad.hackathon}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="error">Submission in {countdown}</Badge>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 size={15} aria-hidden />
            Delete squad
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <VoiceChannel
            squad={squad}
            speaking={speaking}
            onStart={() => onSetVoice(true)}
            onEnd={() => onSetVoice(false)}
            onToggleMute={onToggleMute}
            onToggleVideo={onToggleVideo}
            onJoinLiveClass={onJoinLiveClass}
          />

          <Card className="flex flex-col gap-3">
            <h3 className="type-h4 m-0 text-ink">Teammates ({rosterCount})</h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {squad.members.map((member) => (
                <li
                  key={member.id}
                  className="flex gap-3 border-b border-line pb-3 last:border-b-0 last:pb-0"
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="type-small m-0 font-semibold text-ink">
                        {member.name}
                      </p>
                      <span className="type-caption type-numeric shrink-0 text-muted">
                        {member.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="type-caption m-0 text-muted">{member.role}</p>
                    <p className="type-caption m-0 font-mono text-faint">
                      {member.github} · {member.score} XP · {member.availability}
                    </p>
                  </div>
                </li>
              ))}
              {squad.pendingInvites.map((id) => (
                <li
                  key={id}
                  className="flex gap-3 border-b border-line pb-3 last:border-b-0 last:pb-0"
                >
                  <Avatar name={id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="type-small m-0 font-semibold text-muted">
                        Invite: {id}
                      </p>
                      <Badge tone="warning">Pending</Badge>
                    </div>
                    <p className="type-caption m-0 text-faint">
                      Waiting for this user to accept.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="type-h4 m-0 text-ink">Shared files</h3>
              <Button variant="ghost" size="sm" onClick={onUpload}>
                Upload
              </Button>
            </div>
            {squad.files.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {squad.files.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-2"
                  >
                    <FolderOpen size={14} className="shrink-0 text-muted" aria-hidden />
                    <div className="min-w-0">
                      <p className="type-small m-0 truncate font-semibold text-ink">
                        {file.name}
                      </p>
                      <p className="type-caption m-0 text-faint">
                        {file.size} · {file.author}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="type-caption m-0 text-faint">No shared files yet.</p>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <SprintBoard
            squad={squad}
            onAddTask={onAddTask}
            onMoveTask={onMoveTask}
          />

          <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <GitCommitHorizontal size={16} aria-hidden />
              <h3 className="type-h4 m-0 text-ink">Commit feed</h3>
            </div>
            {squad.gitLog.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {squad.gitLog.map((log, index) => (
                  <li
                    key={`${log.author}-${log.time}-${index}`}
                    className="border-b border-line pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="type-small m-0 font-semibold text-ink">
                      {log.author}
                    </p>
                    <p className="type-small m-0 font-mono text-muted">
                      {log.message}
                    </p>
                    <p className="type-caption m-0 text-faint">{log.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="type-caption m-0 text-faint">
                No commits synced yet.
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h3 className="type-h4 m-0 text-ink">Announcements</h3>
            {squad.announcements.length > 0 ? (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {squad.announcements.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-line bg-sunken p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="type-small m-0 font-semibold text-ink">
                        {item.title}
                      </p>
                      <span className="type-caption shrink-0 text-faint">
                        {item.date}
                      </span>
                    </div>
                    <p className="type-small m-0 mt-1 text-muted">{item.text}</p>
                    <p className="type-caption m-0 mt-2 text-right text-faint">
                      {item.author}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="type-caption m-0 text-faint">No announcements.</p>
            )}
          </Card>
        </div>
      </div>
    </article>
  );
}

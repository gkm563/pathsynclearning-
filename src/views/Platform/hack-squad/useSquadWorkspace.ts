"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui";
import { loadPublicSquads, loadWorkspaceSquads } from "./data";
import type {
  LoadStatus,
  NewSquadDraft,
  PublicSquad,
  SquadTask,
  TaskColumnId,
  WorkspaceSquad,
} from "./types";

const SPEAKING_TICK_MS = 2800;
const INVITE_ACCEPT_MS = 5000;
const DEFAULT_DEADLINE_DAYS = 3;

/** Speaking flags keyed by member id, refreshed while a voice call is live. */
export type SpeakingState = Record<string, boolean>;

/**
 * All Hack Squad state: the public directory, the squads the student owns, and
 * the simulated real-time behaviour (submission countdown, voice activity,
 * teammates accepting invites).
 *
 * It lives in a hook so the page stays a composition of presentational
 * components and the timers get cleaned up in one place.
 */
export function useSquadWorkspace() {
  const toast = useToast();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | undefined>(undefined);
  const [publicSquads, setPublicSquads] = useState<PublicSquad[]>([]);
  const [squads, setSquads] = useState<WorkspaceSquad[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [speaking, setSpeaking] = useState<SpeakingState>({});

  const load = useCallback(() => {
    setStatus("loading");
    setError(undefined);
    try {
      setPublicSquads(loadPublicSquads());
      setSquads(loadWorkspaceSquads());
      setStatus("ready");
    } catch (cause) {
      setPublicSquads([]);
      setSquads([]);
      setError(cause instanceof Error ? cause.message : "Unexpected error");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Submission countdown. One shared clock rather than a timer per squad.
  useEffect(() => {
    if (squads.length === 0) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [squads.length]);

  // Simulated voice activity, only while a call is actually connected.
  const callActive = squads.some((squad) => squad.voiceCallActive);
  useEffect(() => {
    if (!callActive) {
      setSpeaking({});
      return;
    }
    const timer = setInterval(() => {
      setSpeaking(() => {
        const next: SpeakingState = {};
        for (const squad of squads) {
          if (!squad.voiceCallActive) continue;
          for (const member of squad.members) {
            // The signed-in student is never auto-flagged as speaking.
            next[member.id] = member.id === "u1" ? false : Math.random() > 0.6;
          }
        }
        return next;
      });
    }, SPEAKING_TICK_MS);
    return () => clearInterval(timer);
  }, [callActive, squads]);

  const patchSquad = useCallback(
    (squadId: string, patch: (squad: WorkspaceSquad) => WorkspaceSquad) => {
      setSquads((previous) =>
        previous.map((squad) => (squad.id === squadId ? patch(squad) : squad)),
      );
    },
    [],
  );

  // A pending invite is accepted a few seconds later, as if by the invitee.
  useEffect(() => {
    const target = squads.find((squad) => squad.pendingInvites.length > 0);
    if (!target) return;
    const acceptedId = target.pendingInvites[0];

    const timer = setTimeout(() => {
      patchSquad(target.id, (squad) => ({
        ...squad,
        members: [
          ...squad.members,
          {
            id: `u_${Date.now()}`,
            name: `Invited member (${acceptedId})`,
            role: "Tactical research specialist",
            availability: "15h/week",
            github: acceptedId.toLowerCase().replace(/[^a-z0-9]/g, ""),
            rating: 4.8,
            score: 65,
          },
        ],
        pendingInvites: squad.pendingInvites.filter((id) => id !== acceptedId),
        announcements: [
          {
            id: `an_${Date.now()}`,
            author: "PathEd",
            title: `${acceptedId} joined the squad`,
            text: `${acceptedId} accepted your invitation and was added to the roster.`,
            date: "Just now",
          },
          ...squad.announcements,
        ],
        gitLog: [
          {
            author: `Invited member (${acceptedId})`,
            message: `Linked workspace branch for ${acceptedId}.`,
            time: "Just now",
          },
          ...squad.gitLog,
        ],
      }));
      toast.success({
        title: `${acceptedId} accepted your invite`,
        description: "They've been added to the squad roster.",
      });
    }, INVITE_ACCEPT_MS);

    return () => clearTimeout(timer);
  }, [squads, patchSquad, toast]);

  const addTask = useCallback(
    (squadId: string, title: string, assignee: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const task: SquadTask = {
        id: `t_${Date.now()}`,
        title: trimmed,
        description: "Custom sprint task added by a squad member.",
        column: "todo",
        assignee,
      };
      patchSquad(squadId, (squad) => ({ ...squad, tasks: [...squad.tasks, task] }));
    },
    [patchSquad],
  );

  const moveTask = useCallback(
    (squadId: string, taskId: string, column: TaskColumnId) => {
      patchSquad(squadId, (squad) => ({
        ...squad,
        tasks: squad.tasks.map((task) =>
          task.id === taskId ? { ...task, column } : task,
        ),
      }));
    },
    [patchSquad],
  );

  const setVoice = useCallback(
    (squadId: string, active: boolean) => {
      patchSquad(squadId, (squad) => ({ ...squad, voiceCallActive: active }));
    },
    [patchSquad],
  );

  const toggleMute = useCallback(
    (squadId: string) => {
      patchSquad(squadId, (squad) => ({ ...squad, voiceMuted: !squad.voiceMuted }));
    },
    [patchSquad],
  );

  const toggleVideo = useCallback(
    (squadId: string) => {
      patchSquad(squadId, (squad) => ({
        ...squad,
        videoActive: !squad.videoActive,
      }));
    },
    [patchSquad],
  );

  const createSquad = useCallback((draft: NewSquadDraft) => {
    const stamp = Date.now();
    let targetTime = stamp + DEFAULT_DEADLINE_DAYS * 86_400_000;
    if (draft.eventDate) {
      const parsed = new Date(`${draft.eventDate}T${draft.eventTime || "12:00"}`);
      if (!Number.isNaN(parsed.getTime())) {
        targetTime =
          parsed.getTime() +
          (Number.parseFloat(draft.eventDuration || "24") || 24) * 3_600_000;
      }
    }

    const created: WorkspaceSquad = {
      id: `sq_${stamp}`,
      name: draft.name,
      hackathon: draft.hackathon,
      targetTime,
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
      ],
      pendingInvites: [...draft.inviteIds],
      gitLog: [
        {
          author: "Rahul Kushwaha",
          message: "Initialised the squad workspace repository.",
          time: "Just now",
        },
      ],
      announcements: [
        {
          id: `an_${stamp}`,
          author: "Rahul Kushwaha",
          title: "Workspace launched",
          text: `Welcome to the private workspace for ${draft.name}.`,
          date: "Just now",
        },
      ],
      files: [],
      tasks: [
        {
          id: `t_${stamp}`,
          title: "Project brainstorming",
          description: "Align on the tech stack and feature checklist.",
          column: "todo",
          assignee: "Rahul Kushwaha",
        },
      ],
      voiceCallActive: false,
      voiceMuted: false,
      videoActive: false,
    };

    setSquads((previous) => [created, ...previous]);
    return created;
  }, []);

  const deleteSquad = useCallback((squadId: string) => {
    setSquads((previous) => previous.filter((squad) => squad.id !== squadId));
  }, []);

  return {
    status,
    error,
    publicSquads,
    squads,
    now,
    speaking,
    retry: load,
    addTask,
    moveTask,
    setVoice,
    toggleMute,
    toggleVideo,
    createSquad,
    deleteSquad,
  };
}

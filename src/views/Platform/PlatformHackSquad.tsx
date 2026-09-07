"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus, Users } from "lucide-react";
import {
  Button,
  CardGridSkeleton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Segmented,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import { usePlan } from "@/hooks/useStudentData";
import { routes } from "@/lib/routes";
import { ApplyDialog } from "./hack-squad/ApplyDialog";
import { CreateSquadDialog } from "./hack-squad/CreateSquadDialog";
import { SquadBrowser } from "./hack-squad/SquadBrowser";
import { SquadProfileDialog } from "./hack-squad/SquadProfileDialog";
import { SquadWorkspace } from "./hack-squad/SquadWorkspace";
import type {
  ApplyDraft,
  HackSquadTab,
  NewSquadDraft,
  PublicSquad,
  WorkspaceSquad,
} from "./hack-squad/types";
import { useSquadWorkspace } from "./hack-squad/useSquadWorkspace";

/** Hack squads — `/dashboard/hack-squad` */
export default function PlatformHackSquad() {
  const router = useRouter();
  const toast = useToast();
  const { plan, setPlan, ready } = usePlan();
  const workspace = useSquadWorkspace();

  const isPremium = plan === "premium";
  const loading = !ready || workspace.status === "loading";

  const [tab, setTab] = useState<HackSquadTab>("browse");
  const [profileSquad, setProfileSquad] = useState<PublicSquad | null>(null);
  const [applySquad, setApplySquad] = useState<PublicSquad | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [squadToDelete, setSquadToDelete] = useState<WorkspaceSquad | null>(null);

  const goToStore = () => router.push(routes.app.store);

  const openCreate = () => {
    if (!isPremium) {
      goToStore();
      return;
    }
    setShowCreate(true);
  };

  const openApply = (squad: PublicSquad) => {
    setProfileSquad(null);
    setApplySquad(squad);
  };

  const handleApply = (draft: ApplyDraft) => {
    if (!applySquad) return;
    toast.success({
      title: `Application sent to ${applySquad.name}`,
      description: `${applySquad.leader.name} has been notified. Role: ${draft.role}.`,
    });
    setApplySquad(null);
  };

  const handleCreate = (draft: NewSquadDraft) => {
    const created = workspace.createSquad(draft);
    setShowCreate(false);
    setTab("workspace");
    toast.success({
      title: `${created.name} is live`,
      description: draft.inviteIds.length
        ? `Invites dispatched to ${draft.inviteIds.join(", ")}.`
        : "Your workspace is ready. Invite teammates when you need them.",
    });
  };

  const confirmDelete = () => {
    if (!squadToDelete) return;
    workspace.deleteSquad(squadToDelete.id);
    toast.info(`“${squadToDelete.name}” was deleted.`);
    setSquadToDelete(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Collaboration & communities"
        title="Hack squads"
        description="Form teams for live hackathons, sync GitHub, run a sprint board and coordinate in a private voice room."
        actions={
          <div className="flex items-center gap-2">
            <span className="type-caption text-faint">Preview plan</span>
            <Segmented
              items={[
                { id: "free", label: "Free" },
                { id: "premium", label: "Premium" },
              ]}
              value={isPremium ? "premium" : "free"}
              onChange={(next) => void setPlan(next)}
              ariaLabel="Preview plan"
            />
          </div>
        }
      />

      <Tabs<HackSquadTab>
        items={[
          {
            id: "browse",
            label: "Browse squads",
            badge: workspace.publicSquads.length,
          },
          {
            id: "workspace",
            label: "My workspaces",
            badge: workspace.squads.length,
          },
        ]}
        value={tab}
        onChange={setTab}
        ariaLabel="Hack squad sections"
        className="mb-6"
      />

      {workspace.status === "error" ? (
        <ErrorState
          title="Couldn't load hack squads"
          description="The directory didn't come back. Retry, and if it keeps failing the workspace is temporarily unavailable."
          detail={workspace.error}
          action={
            <Button variant="secondary" onClick={workspace.retry}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <TabPanel active={tab === "browse"}>
            {loading ? (
              <CardGridSkeleton count={6} />
            ) : (
              <SquadBrowser
                squads={workspace.publicSquads}
                canCreate={isPremium}
                onCreate={openCreate}
                onUpgrade={goToStore}
                onInspect={setProfileSquad}
                onApply={openApply}
              />
            )}
          </TabPanel>

          <TabPanel active={tab === "workspace"}>
            {loading ? (
              <CardGridSkeleton count={2} />
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="type-h3 m-0 text-ink">Active workspaces</h2>
                    <p className="type-small m-0 text-muted">
                      Voice, sprint board, files and GitHub feed for squads you
                      own.
                    </p>
                  </div>
                  {isPremium ? (
                    <Button className="min-h-11" onClick={openCreate}>
                      <Plus size={16} aria-hidden />
                      Create squad
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onClick={goToStore}
                    >
                      <Lock size={14} aria-hidden />
                      Create squad
                    </Button>
                  )}
                </div>

                {workspace.squads.length === 0 ? (
                  <EmptyState
                    icon={<Users size={20} aria-hidden />}
                    title="No active squads"
                    description="Create a workspace to unlock the sprint board, private voice channel and GitHub sync."
                    action={
                      <Button onClick={openCreate}>
                        {isPremium ? "Create squad" : "View premium"}
                      </Button>
                    }
                  />
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-8 p-0">
                    {workspace.squads.map((squad) => (
                      <li key={squad.id} className="min-w-0">
                        <SquadWorkspace
                          squad={squad}
                          now={workspace.now}
                          speaking={workspace.speaking}
                          onDelete={() => setSquadToDelete(squad)}
                          onAddTask={(title, assignee) =>
                            workspace.addTask(squad.id, title, assignee)
                          }
                          onMoveTask={(taskId, column) =>
                            workspace.moveTask(squad.id, taskId, column)
                          }
                          onSetVoice={(active) =>
                            workspace.setVoice(squad.id, active)
                          }
                          onToggleMute={() => workspace.toggleMute(squad.id)}
                          onToggleVideo={() => {
                            workspace.toggleVideo(squad.id);
                          }}
                          onJoinLiveClass={() =>
                            router.push(
                              `${routes.app.liveClass}?topic=${encodeURIComponent(squad.name)}`,
                            )
                          }
                          onUpload={() =>
                            toast.info(
                              "File upload isn’t wired in this prototype.",
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </TabPanel>
        </>
      )}

      <SquadProfileDialog
        squad={profileSquad}
        onClose={() => setProfileSquad(null)}
        onApply={openApply}
      />

      <ApplyDialog
        squad={applySquad}
        onClose={() => setApplySquad(null)}
        onSubmit={handleApply}
      />

      <CreateSquadDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      <ConfirmDialog
        open={squadToDelete !== null}
        onClose={() => setSquadToDelete(null)}
        onConfirm={confirmDelete}
        tone="danger"
        title="Delete this squad?"
        confirmLabel="Delete squad"
        description={
          squadToDelete
            ? `This permanently removes ${squadToDelete.name}, the voice channel, sprint tasks and the linked GitHub workspace. This cannot be undone.`
            : undefined
        }
      />
    </>
  );
}

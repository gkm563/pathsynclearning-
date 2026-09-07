"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Lock, Plus } from "lucide-react";
import {
  Button,
  CardGridSkeleton,
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
import { useMockResource } from "@/views/Platform/shared/useMockResource";
import { CreateProjectDialog } from "./project-collab/CreateProjectDialog";
import { COLS, INITIAL_BROWSE_PROJECTS, INITIAL_MY_PROJECTS } from "./project-collab/data";
import { Marketplace } from "./project-collab/Marketplace";
import { ProjectCard } from "./project-collab/ProjectCard";
import type {
  BrowseProject,
  CollabSubTab,
  FilterType,
  MyProject,
  TaskStatus,
  WorkspaceTab,
} from "./project-collab/types";

/** Project collaboration — `/dashboard/project-collab` */
export default function PlatformProjectCollab() {
  const router = useRouter();
  const toast = useToast();
  const { plan: devPlan, setPlan } = usePlan();
  const resource = useMockResource();

  const [collabSubTab, setCollabSubTab] = useState<CollabSubTab>("my-space");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjProgress, setNewProjProgress] = useState(10);
  const [newProjSelectionType, setNewProjSelectionType] = useState("collaborators");
  const [newProjSlots, setNewProjSlots] = useState("");
  const [newProjDifficulty, setNewProjDifficulty] = useState("Medium");
  const [newProjInvitedMember, setNewProjInvitedMember] = useState("");
  const [newProjDescription, setNewProjDescription] = useState("");
  const [myProjects, setMyProjects] = useState<MyProject[]>(() =>
    INITIAL_MY_PROJECTS.map((project) => ({
      ...project,
      tech: [...project.tech],
      members: [...project.members],
      chat: [...project.chat],
      tasks: project.tasks.map((task) => ({ ...task })),
      gitCommits: [...project.gitCommits],
    })),
  );
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("chat");
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [browseProjects, setBrowseProjects] = useState<BrowseProject[]>(() =>
    INITIAL_BROWSE_PROJECTS.map((project) => ({
      ...project,
      tech: [...project.tech],
    })),
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [myProjects, activeWorkspaceId, workspaceTab]);

  const handleSendChat = (projectId: string) => {
    if (!messageInput.trim()) return;
    setMyProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          chat: [
            ...project.chat,
            { user: "Rahul Kushwaha (You)", text: messageInput, time: "4:05 PM" },
          ],
        };
      }),
    );
    setMessageInput("");
  };

  const handleTaskStatusChange = (
    projectId: string,
    taskId: string,
    nextStatus: TaskStatus,
  ) => {
    setMyProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId ? { ...task, status: nextStatus } : task,
          ),
        };
      }),
    );
  };

  const handleUpdateNotes = (projectId: string, notesText: string) => {
    setMyProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, notes: notesText } : project,
      ),
    );
  };

  const filteredBrowseProjects = useMemo(
    () =>
      browseProjects.filter((project) => {
        if (filterType !== "all" && project.type !== filterType) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            project.name.toLowerCase().includes(q) ||
            project.tech.some((tech) => tech.toLowerCase().includes(q))
          );
        }
        return true;
      }),
    [browseProjects, filterType, searchQuery],
  );

  const handleApplyJoin = (proj: BrowseProject) => {
    toast.success({
      title: `Application submitted to join ${proj.name}`,
      description: `The project owner (${proj.owner}) will review your CRI Score and portfolio.`,
    });
  };

  const handlePostProject = (event: FormEvent) => {
    event.preventDefault();
    if (!newProjName.trim()) {
      toast.error("Please enter a project name.");
      return;
    }

    const projectId = "p_" + Date.now();
    const parsedTech = newProjTech.split(",").map((item) => item.trim()).filter(Boolean);
    const invitedMembersList = ["Rahul Kushwaha"];
    if (newProjInvitedMember.trim()) {
      invitedMembersList.push(newProjInvitedMember.trim());
    }

    const createdProject: MyProject = {
      id: projectId,
      name: newProjName,
      type: "original",
      owner: "You",
      progress: Number(newProjProgress) || 0,
      status: "In Progress",
      tech: parsedTech.length > 0 ? parsedTech : ["React.js"],
      slots: newProjSlots || "Open Position",
      timeline: "Ending in 4 weeks",
      members: invitedMembersList,
      chat: [
        {
          user: "System",
          text: `Project initialized. ${
            newProjInvitedMember.trim()
              ? `Squad invite request sent to "${newProjInvitedMember.trim()}".`
              : "Welcome to your collaborative workspace."
          }`,
          time: "Just now",
        },
      ],
      tasks: [
        { id: "t1", title: "Initialize repository structure", status: "todo" },
        { id: "t2", title: "Setup component folder blueprints", status: "todo" },
      ],
      notes:
        newProjDescription ||
        "Start typing sprint documentation or architecture specs here...",
      gitCommits: [],
    };

    const marketTypeMap: Record<string, BrowseProject["type"]> = {
      collaborators: "collaborators",
      recruit: "recruit",
      participate: "participate",
    };

    const createdMarketProject: BrowseProject = {
      id: "bp_" + Date.now(),
      name: newProjName,
      owner: "You",
      desc: newProjDescription || "No description provided.",
      type: marketTypeMap[newProjSelectionType] || "collaborators",
      tech: parsedTech.length > 0 ? parsedTech : ["React.js"],
      teamSize: invitedMembersList.length,
      slots: newProjSlots || "Open Position",
      difficulty: newProjDifficulty,
      col: COLS.primary,
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
    };

    setMyProjects((prev) => [createdProject, ...prev]);
    setBrowseProjects((prev) => [createdMarketProject, ...prev]);
    setNewProjName("");
    setNewProjTech("");
    setNewProjProgress(10);
    setNewProjSelectionType("collaborators");
    setNewProjSlots("");
    setNewProjDifficulty("Medium");
    setNewProjInvitedMember("");
    setNewProjDescription("");
    setIsCreateModalOpen(false);
    toast.success({
      title: "Project successfully posted",
      description: newProjInvitedMember.trim()
        ? `Squad invitation request dispatched to "${newProjInvitedMember.trim()}".`
        : undefined,
    });
  };

  const visibleProjects = myProjects.filter(
    (project) => activeWorkspaceId === null || activeWorkspaceId === project.id,
  );
  const isPremium = devPlan === "premium";

  return (
    <>
      <PageHeader
        eyebrow="Collaboration & communities"
        title="Project collaboration"
        description="Monitor roadmap milestones, push code commits, and check sprint backlogs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
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

      <Tabs<CollabSubTab>
        items={[
          { id: "my-space", label: "My space", badge: myProjects.length },
          { id: "marketplace", label: "Browse projects", badge: browseProjects.length },
        ]}
        value={collabSubTab}
        onChange={setCollabSubTab}
        ariaLabel="Collaboration sections"
        className="mb-6"
      />

      {resource.state === "error" ? (
        <ErrorState
          title="Couldn't load collaborations"
          description="The project list didn't come back. Retry, and if it keeps failing the workspace is temporarily unavailable."
          action={
            <Button variant="secondary" onClick={resource.reload}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <TabPanel active={collabSubTab === "my-space"}>
            {resource.state === "loading" ? (
              <CardGridSkeleton count={2} />
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="type-h3 m-0 text-ink">Active collaborations</h2>
                    <p className="type-small m-0 text-muted">
                      Monitor roadmap milestones, push code commits, and check sprint backlogs.
                    </p>
                  </div>
                  {isPremium ? (
                    <Button className="min-h-11" onClick={() => setIsCreateModalOpen(true)}>
                      <Plus size={16} aria-hidden />
                      Create project
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onClick={() => router.push(routes.app.store)}
                    >
                      <Lock size={14} aria-hidden />
                      Create project (Premium)
                    </Button>
                  )}
                </div>

                {visibleProjects.length === 0 ? (
                  <EmptyState
                    icon={<FolderKanban size={20} aria-hidden />}
                    title="No active projects"
                    description="Create a project or browse the marketplace to join a team."
                    action={
                      <Button onClick={() => setCollabSubTab("marketplace")}>
                        Browse projects
                      </Button>
                    }
                  />
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-5 p-0">
                    {visibleProjects.map((project) => (
                      <li key={project.id} className="min-w-0">
                        <ProjectCard
                          project={project}
                          workspaceOpen={activeWorkspaceId === project.id}
                          isPremium={isPremium}
                          workspaceTab={workspaceTab}
                          isMembersOpen={isMembersOpen}
                          messageInput={messageInput}
                          chatEndRef={chatEndRef}
                          onBack={() => setActiveWorkspaceId(null)}
                          onToggleWorkspace={() =>
                            setActiveWorkspaceId(
                              activeWorkspaceId === project.id ? null : project.id,
                            )
                          }
                          onWorkspaceTab={setWorkspaceTab}
                          onMembersToggle={() => setIsMembersOpen((open) => !open)}
                          onMessageChange={setMessageInput}
                          onSendChat={() => handleSendChat(project.id)}
                          onTaskStatusChange={(taskId, next) =>
                            handleTaskStatusChange(project.id, taskId, next)
                          }
                          onUpdateNotes={(notes) => handleUpdateNotes(project.id, notes)}
                          onJoinVoice={() =>
                            toast.info("Launching secure peer-to-peer Jitsi voice link...")
                          }
                          onUpgrade={() => router.push(routes.app.store)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </TabPanel>

          <TabPanel active={collabSubTab === "marketplace"}>
            {resource.state === "loading" ? (
              <CardGridSkeleton count={6} withMedia />
            ) : (
              <Marketplace
                query={searchQuery}
                filterType={filterType}
                projects={filteredBrowseProjects}
                reversed={[...filteredBrowseProjects].reverse()}
                onQueryChange={setSearchQuery}
                onFilterChange={setFilterType}
                onApply={handleApplyJoin}
              />
            )}
          </TabPanel>
        </>
      )}

      <CreateProjectDialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        name={newProjName}
        tech={newProjTech}
        progress={newProjProgress}
        selectionType={newProjSelectionType}
        slots={newProjSlots}
        difficulty={newProjDifficulty}
        invitedMember={newProjInvitedMember}
        description={newProjDescription}
        onNameChange={setNewProjName}
        onTechChange={setNewProjTech}
        onProgressChange={setNewProjProgress}
        onSelectionTypeChange={setNewProjSelectionType}
        onSlotsChange={setNewProjSlots}
        onDifficultyChange={setNewProjDifficulty}
        onInvitedMemberChange={setNewProjInvitedMember}
        onDescriptionChange={setNewProjDescription}
        onSubmit={handlePostProject}
      />
    </>
  );
}

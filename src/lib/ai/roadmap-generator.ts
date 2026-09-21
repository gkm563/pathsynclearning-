import { env } from "@/lib/env";
import { RoadmapNode, RoadmapEdge, RoadmapProfile, RoadmapSubtopic } from "@/types/roadmap";
import { callOllamaJson } from "./ollama";
import { roadmapSchema } from "@/lib/validation/roadmap-schemas";
import { AppError } from "@/lib/api/errors";
import { ensureNodeAssessments } from "@/lib/roadmap/assessment-bank";
import { hiringBrief } from "@/lib/roadmap/hiring-catalog";
import { enrichNodeResources } from "@/lib/roadmap/validate-resources";
import { isTrackableRoadmapNode } from "@/lib/roadmap/stats";

export type RoadmapAdaptationContext = {
  overall: number;
  summary: string;
  failedTopics: string[];
};

const FINAL_INTERVIEW_ID = "final-ai-interview";
const OLLAMA_TIMEOUT_MS = 10 * 60 * 1000;

type OutlinePhase = {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
};

type OutlineResult = {
  title: string;
  targetRole: string;
  estimatedWeeks: number;
  goal: { id: string; title: string; description: string };
  phases: OutlinePhase[];
};

type ExpandedTopic = {
  id?: string;
  type?: string;
  title?: string;
  description?: string;
  estimatedHours?: number;
  whyLearn?: string;
  learningOutcomes?: string[];
  interviewFocus?: string;
  skills?: string[];
  topics?: string[];
  subtopics?: Array<{ id?: string; title?: string } | string>;
  resources?: RoadmapNode["resources"];
  project?: string | null;
};

function clip(value: unknown, max: number, fallback = ""): string {
  const text = typeof value === "string" ? value : value == null ? "" : String(value);
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

const RESOURCE_TYPES = new Set([
  "documentation",
  "video",
  "course",
  "practice",
  "article",
  "project",
]);

function sanitizeResources(raw: unknown): RoadmapNode["resources"] {
  if (!Array.isArray(raw)) return [];
  const out: RoadmapNode["resources"] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const url = clip(rec.url, 2000);
    const title = clip(rec.title, 200, "Resource");
    if (!url) continue;
    const typeRaw = clip(rec.type, 40).toLowerCase();
    let type: RoadmapNode["resources"][number]["type"] = "article";
    if (RESOURCE_TYPES.has(typeRaw)) type = typeRaw as RoadmapNode["resources"][number]["type"];
    else if (/you|video|watch/.test(typeRaw)) type = "video";
    else if (/doc/.test(typeRaw)) type = "documentation";
    else if (/course|mooc|udemy/.test(typeRaw)) type = "course";
    else if (/practice|leetcode|exercise|kata/.test(typeRaw)) type = "practice";
    else if (/project|github/.test(typeRaw)) type = "project";
    out.push({
      title,
      url,
      type,
      channel: rec.channel ? clip(rec.channel, 120) : undefined,
      suggested: rec.suggested === true,
    });
    if (out.length >= 20) break;
  }
  return out;
}

function hours(value: unknown, fallback = 2): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(500, n);
}

function normalizeOutline(raw: OutlineResult): OutlineResult {
  const rec = (raw && typeof raw === "object" ? raw : {}) as OutlineResult & {
    curriculum?: OutlinePhase[];
  };
  const phasesRaw = Array.isArray(rec.phases)
    ? rec.phases
    : Array.isArray(rec.curriculum)
      ? rec.curriculum
      : [];
  const phases = phasesRaw
    .filter((p) => p && (p.title || p.id || p.description))
    .map((p, i) => ({
      id: clip(p.id, 80, `phase-${i + 1}`),
      title: clip(p.title, 200, `Phase ${i + 1}`),
      description: clip(p.description, 8000),
      estimatedHours: hours(p.estimatedHours, 8),
    }));
  const goal =
    rec.goal && typeof rec.goal === "object"
      ? rec.goal
      : { id: "goal", title: rec.title, description: "" };
  return {
    title: clip(rec.title, 200, "Learning roadmap"),
    targetRole: clip(rec.targetRole, 200, "Role"),
    estimatedWeeks: Math.min(260, Math.max(1, Math.round(hours(rec.estimatedWeeks, 12)))),
    goal: {
      id: clip(goal.id, 80, "goal"),
      title: clip(goal.title, 200, rec.title || "Goal"),
      description: clip(goal.description, 8000),
    },
    phases,
  };
}

function compactProfile(profile: RoadmapProfile) {
  return {
    currentStudy: profile.currentStudy,
    yearSemester: profile.yearSemester,
    academicBackground: profile.academicBackground,
    enjoyedSubjects: profile.enjoyedSubjects,
    struggledSubjects: profile.struggledSubjects,
    careerGoal: profile.careerGoal,
    targetRole: profile.targetRole,
    targetCompany: profile.targetCompany,
    knownSkills: profile.knownSkills,
    hasProjects: profile.hasProjects,
    projects: profile.projects?.slice(0, 5),
    experienceLevel: profile.experienceLevel,
    wantToLearn: profile.wantToLearn,
    learningMotivation: profile.learningMotivation,
    weeklyHours: profile.weeklyHours,
    projectVsLearning: profile.projectVsLearning,
    learningStyles: profile.learningStyles,
    targetTimeline: profile.targetTimeline,
    topPriority: profile.topPriority,
    aiFollowUpAnswers: profile.aiFollowUpAnswers,
  };
}

function kebab(raw: string, used: Set<string>, fallback: string) {
  const root =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || fallback;
  let id = root;
  let n = 2;
  while (used.has(id)) {
    id = `${root}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asSubtopics(value: unknown, used: Set<string>, prefix: string): RoadmapSubtopic[] {
  if (!Array.isArray(value)) return [];
  const out: RoadmapSubtopic[] = [];
  value.forEach((item, i) => {
    if (typeof item === "string" && item.trim()) {
      out.push({ id: kebab(`${prefix}-st-${i}`, used, `st-${i}`), title: clip(item.trim(), 200) });
      return;
    }
    if (item && typeof item === "object") {
      const rec = item as { id?: string; title?: string };
      const title = typeof rec.title === "string" ? rec.title.trim() : "";
      if (!title) return;
      out.push({
        id: kebab(rec.id || `${prefix}-${title}`, used, `st-${i}`),
        title: clip(title, 200, `Subtopic ${i + 1}`),
      });
    }
  });
  return out;
}

function defaultNode(partial: Partial<RoadmapNode> & Pick<RoadmapNode, "id" | "type" | "title">): RoadmapNode {
  return {
    status: "locked",
    priority: "medium",
    estimatedHours: 2,
    dependencies: [],
    skills: [],
    topics: [],
    resources: [],
    project: null,
    whyLearn: "",
    description: "",
    ...partial,
  };
}

function attachFinalInterview(
  nodes: RoadmapNode[],
  edges: RoadmapEdge[],
  profile: RoadmapProfile,
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const used = new Set(nodes.map((n) => n.id));
  const interviewId = used.has(FINAL_INTERVIEW_ID)
    ? kebab("final-ai-interview", used, "final-interview")
    : FINAL_INTERVIEW_ID;
  used.add(interviewId);

  const outgoing = new Set(edges.map((e) => e.source));
  const terminals = nodes.filter(
    (n) => isTrackableRoadmapNode(n) && n.type !== "interview" && !outgoing.has(n.id),
  );
  const sources = terminals.length
    ? terminals
    : nodes.filter((n) => n.type === "phase" || n.type === "milestone");

  const role = profile.targetRole || "this role";
  const company = profile.targetCompany;
  const interview = defaultNode({
    id: interviewId,
    type: "interview",
    title: company ? `${company} readiness interview` : "Final AI interview",
    description: `Live AI interview covering the whole curriculum. This checks whether you are ready for ${role}${company ? ` at ${company}` : ""}. Pass it to certify the roadmap. Fail it and PathED will add review nodes or rebuild the path — same certification flow as before.`,
    whyLearn: "This is the readiness gate. Completing every topic is not enough until you can explain and apply it under interview pressure.",
    interviewFocus: "Treat this like a real screen: fundamentals, problem solving, and role-specific follow-ups.",
    learningOutcomes: [
      "Demonstrate the curriculum end-to-end in a live interview",
      "Identify remaining gaps if you do not pass",
    ],
    estimatedHours: 1,
    priority: "critical",
    gate: "final_interview",
    depth: 0,
    dependencies: sources.map((n) => n.id),
  });

  const interviewEdges: RoadmapEdge[] = sources.map((n) => ({
    id: `e-${n.id}-${interviewId}`,
    source: n.id,
    target: interviewId,
    label: "then interview",
  }));

  return { nodes: [...nodes, interview], edges: [...edges, ...interviewEdges] };
}

async function generateOutline(
  profile: RoadmapProfile,
  companyMode: boolean,
  hiring: unknown,
  adaptationContext?: RoadmapAdaptationContext,
): Promise<OutlineResult> {
  const extra = adaptationContext
    ? `\nREBUILD after a failed certification interview (score ${adaptationContext.overall}). Weak topics: ${adaptationContext.failedTopics.join("; ") || "entire curriculum"}. Interviewer notes: ${adaptationContext.summary}`
    : "";

  return callOllamaJson<OutlineResult>({
    model: env.ollamaRoadmapModel,
    timeoutMs: OLLAMA_TIMEOUT_MS,
    maxTokens: null,
    temperature: 0.6,
    purpose: "roadmap",
    label: "Ollama roadmap outline",
    systemInstruction: `You design hiring-accurate learning roadmaps like roadmap.sh: a spine of phases, each later expanded into many nested topics.

There is NO upper limit on how many phases you create. Use as many as the role needs (typically 6–14). Skip skills the student already knows at advanced/very_confident.

Return ONLY JSON:
{
  "title": "string",
  "targetRole": "string",
  "estimatedWeeks": number,
  "goal": { "id": "kebab-case", "title": "string", "description": "string" },
  "phases": [{ "id": "kebab-case", "title": "string", "description": "what this phase covers in 4-8 sentences", "estimatedHours": number }]
}

${companyMode ? `COMPANY PATH. Hiring brief: ${JSON.stringify(hiring)}
Title must mention company + role. Phases must match what they actually screen.` : `ROLE PATH. Do not name a specific employer.`}
Scale estimatedWeeks to weeklyHours and targetTimeline.`,
    prompt: `Student profile:\n${JSON.stringify(compactProfile(profile))}${extra}\nWrite the phase outline only.`,
  });
}

async function expandPhase(
  profile: RoadmapProfile,
  phase: OutlinePhase,
  companyMode: boolean,
): Promise<ExpandedTopic[]> {
  const result = await callOllamaJson<{ topics?: ExpandedTopic[] } | ExpandedTopic[]>({
    model: env.ollamaRoadmapModel,
    timeoutMs: OLLAMA_TIMEOUT_MS,
    maxTokens: null,
    temperature: 0.65,
    purpose: "roadmap",
    label: `Ollama expand ${phase.title}`,
    systemInstruction: `You expand one learning phase into a detailed nested map like roadmap.sh / a printed skill tree.

Rules:
- NO upper limit on topic count. Include every sub-skill a serious student needs for this phase (often 12–40 topics).
- Each topic is specific ("Eigenvalues and diagonalization", not "Math").
- Each topic needs: long description (what to learn, how to practice, what good looks like, failure modes), whyLearn, 4–10 learningOutcomes, interviewFocus, 4–12 subtopics (named checklist items), 2–4 real docs/article URLs (never invent YouTube IDs).
- Mix types: skill, topic, project, checkpoint. Most are skill or topic.
- Skip things the student already marked advanced/very_confident.

Return ONLY JSON:
{ "topics": [{ "id": "kebab-case", "type": "skill|topic|project|checkpoint", "title": "string", "description": "string", "estimatedHours": number, "whyLearn": "string", "learningOutcomes": ["string"], "interviewFocus": "string", "skills": ["string"], "topics": ["string"], "subtopics": [{ "id": "kebab-case", "title": "string" }], "resources": [{ "title": "string", "url": "string", "type": "documentation|article|practice|course|project" }], "project": null }] }`,
    prompt: `Student profile:\n${JSON.stringify(compactProfile(profile))}\n\nPhase to expand:\n${JSON.stringify(phase)}\nCompany-targeted: ${companyMode}\nGenerate the full nested topic list for THIS phase only.`,
  });

  if (Array.isArray(result)) return result;
  if (Array.isArray(result.topics)) return result.topics;
  const nested = (result as { nodes?: ExpandedTopic[] }).nodes;
  return Array.isArray(nested) ? nested : [];
}

function flattenGraph(
  outline: OutlineResult,
  phaseTopics: Map<string, ExpandedTopic[]>,
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const used = new Set<string>();
  const nodes: RoadmapNode[] = [];
  const edges: RoadmapEdge[] = [];

  const goalId = kebab(outline.goal?.id || "goal", used, "goal");
  nodes.push(
    defaultNode({
      id: goalId,
      type: "goal",
      title: outline.goal?.title || outline.title,
      description: outline.goal?.description || outline.title,
      whyLearn: "This is the outcome of the path.",
      estimatedHours: 0,
      depth: 0,
      priority: "critical",
    }),
  );

  let prevPhaseId = goalId;
  (outline.phases || []).forEach((phase, phaseIndex) => {
    const phaseId = kebab(phase.id || phase.title, used, `phase-${phaseIndex + 1}`);
    nodes.push(
      defaultNode({
        id: phaseId,
        type: "phase",
        title: phase.title,
        description: phase.description || "",
        whyLearn: phase.description || "",
        estimatedHours: Number(phase.estimatedHours) || 8,
        depth: 0,
        dependencies: [prevPhaseId],
      }),
    );
    edges.push({ id: `e-${prevPhaseId}-${phaseId}`, source: prevPhaseId, target: phaseId });

    const children = phaseTopics.get(phase.id) || phaseTopics.get(phaseId) || [];
    if (!children.length) {
      children.push({
        id: `${phase.id || phaseId}-core`,
        type: "skill",
        title: phase.title,
        description: phase.description,
        estimatedHours: phase.estimatedHours || 6,
        subtopics: [],
      });
    }
    let prevChildId = phaseId;
    children.forEach((raw, i) => {
      const title = (raw.title || `Topic ${i + 1}`).trim();
      const typeRaw = String(raw.type || "topic");
      const type =
        typeRaw === "project" || typeRaw === "checkpoint" || typeRaw === "skill" || typeRaw === "topic"
          ? typeRaw
          : "topic";
      const id = kebab(raw.id || title, used, `${phaseId}-${i + 1}`);
      const subtopics = asSubtopics(raw.subtopics, used, id);
      const topics = asStringArray(raw.topics);
      if (!topics.length) topics.push(...subtopics.map((s) => s.title));
      nodes.push(
        defaultNode({
          id,
          type,
          title: clip(title, 200, `Topic ${i + 1}`),
          description: clip(raw.description || title, 8000, title),
          whyLearn: clip(raw.whyLearn, 4000),
          learningOutcomes: asStringArray(raw.learningOutcomes).map((s) => clip(s, 400)).filter(Boolean),
          interviewFocus: clip(raw.interviewFocus, 2000) || undefined,
          skills: asStringArray(raw.skills),
          topics,
          subtopics,
          resources: sanitizeResources(raw.resources),
          project: type === "project" ? clip(raw.project || title, 2000) : null,
          estimatedHours: hours(raw.estimatedHours, 2),
          parentId: phaseId,
          depth: 1,
          dependencies: [prevChildId],
          priority: type === "checkpoint" || type === "project" ? "high" : "medium",
        }),
      );
      edges.push({ id: `e-${prevChildId}-${id}`, source: prevChildId, target: id });
      prevChildId = id;
    });

    prevPhaseId = phaseId;
  });

  return { nodes, edges };
}

export async function generateRoadmap(
  profile: RoadmapProfile,
  userId: string,
  onProgress?: (p: { step: string; percent: number; message: string }) => void,
  adaptationContext?: RoadmapAdaptationContext,
): Promise<{ title: string; targetRole: string; estimatedWeeks: number; nodes: RoadmapNode[]; edges: RoadmapEdge[] }> {
  const hiring = hiringBrief(profile.targetCompany, profile.targetRole);
  const companyMode = Boolean(profile.targetCompany);
  void userId;

  try {
    onProgress?.({ step: "graph", percent: 22, message: "Outlining the full curriculum…" });
    const outline = normalizeOutline(
      await generateOutline(profile, companyMode, hiring, adaptationContext),
    );
    const phases = outline.phases;
    if (!phases.length) {
      throw AppError.badRequest("Invalid roadmap outline from AI. Please try again.");
    }

    const phaseTopics = new Map<string, ExpandedTopic[]>();
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const pct = 24 + Math.round(((i + 1) / phases.length) * 40);
      onProgress?.({
        step: "expand",
        percent: pct,
        message: `Expanding ${phase.title} (${i + 1}/${phases.length}) — no topic cap…`,
      });
      try {
        const topics = await expandPhase(profile, phase, companyMode);
        phaseTopics.set(phase.id, topics);
      } catch (err) {
        console.warn(`[roadmap] expand failed for ${phase.title}`, err);
        phaseTopics.set(phase.id, [
          {
            id: `${phase.id}-core`,
            type: "skill",
            title: phase.title,
            description: phase.description,
            estimatedHours: phase.estimatedHours || 6,
            subtopics: [],
          },
        ]);
      }
    }

    let { nodes, edges } = flattenGraph(outline, phaseTopics);
    ({ nodes, edges } = attachFinalInterview(nodes, edges, profile));

    const payload = {
      title: clip(outline.title || `${profile.targetRole} roadmap`, 200, "Learning roadmap"),
      targetRole: clip(outline.targetRole || profile.targetRole, 200, "Role"),
      estimatedWeeks: outline.estimatedWeeks,
      nodes,
      edges,
    };
    const loose = roadmapSchema.safeParse(payload);
    if (!loose.success) {
      console.error(
        "Zod Validation Failed:",
        JSON.stringify(loose.error.issues?.slice(0, 20), null, 2),
      );
    }
    const base = loose.success
      ? loose.data
      : {
          ...payload,
          nodes: nodes.map((n) => ({
            ...n,
            title: clip(n.title, 200, "Topic"),
            description: clip(n.description, 8000),
            whyLearn: clip(n.whyLearn, 4000),
            resources: sanitizeResources(n.resources),
            assessment: undefined,
            assessments: undefined,
          })),
        };

    onProgress?.({ step: "assessments", percent: 68, message: "Building assessments for key nodes…" });
    const assessable = ensureNodeAssessments(base.nodes as RoadmapNode[]);
    onProgress?.({ step: "resources", percent: 80, message: "Matching lesson videos to each topic…" });
    const leaves = assessable.filter(
      (n) => n.type === "skill" || n.type === "topic" || n.type === "project" || n.type === "checkpoint",
    );
    const others = assessable.filter((n) => !leaves.includes(n));
    const enrichedLeaves = await enrichNodeResources(leaves);
    const byId = new Map(enrichedLeaves.map((n) => [n.id, n]));
    const nodesOut = assessable.map((n) => byId.get(n.id) || n);
    void others;

    return {
      title: base.title,
      targetRole: base.targetRole,
      estimatedWeeks: base.estimatedWeeks,
      nodes: nodesOut,
      edges: base.edges as RoadmapEdge[],
    };
  } catch (error) {
    throw error;
  }
}

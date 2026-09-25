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
const OLLAMA_TIMEOUT_MS = 25000;

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
    title: company ? `${company} Readiness Interview` : "Final AI Readiness Interview",
    description: `Live AI interview covering the whole curriculum. This checks whether you are ready for ${role}${company ? ` at ${company}` : ""}. Pass it to certify your roadmap.`,
    whyLearn: "This is the readiness gate. Completing every topic is not enough until you can explain and apply it under interview pressure.",
    interviewFocus: "Treat this like a real technical interview: fundamentals, problem solving, and role-specific follow-ups.",
    learningOutcomes: [
      "Demonstrate the curriculum end-to-end in a live technical interview",
      "Identify remaining gaps before live company screening",
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
    model: "llama-3.3-70b-versatile",
    timeoutMs: OLLAMA_TIMEOUT_MS,
    maxTokens: null,
    temperature: 0.6,
    purpose: "roadmap",
    label: "Roadmap outline",
    systemInstruction: `You design hiring-accurate learning roadmaps like roadmap.sh: a spine of 5-8 core phases.

Return ONLY JSON:
{
  "title": "string",
  "targetRole": "string",
  "estimatedWeeks": number,
  "goal": { "id": "kebab-case", "title": "string", "description": "string" },
  "phases": [{ "id": "kebab-case", "title": "string", "description": "what this phase covers in 2-4 sentences", "estimatedHours": number }]
}

${companyMode ? `COMPANY PATH. Hiring brief: ${JSON.stringify(hiring)}. Title must mention company + role.` : `ROLE PATH.`}`,
    prompt: `Student profile:\n${JSON.stringify(compactProfile(profile))}${extra}\nWrite the phase outline only.`,
  });
}

async function expandPhase(
  profile: RoadmapProfile,
  phase: OutlinePhase,
  companyMode: boolean,
): Promise<ExpandedTopic[]> {
  const result = await callOllamaJson<{ topics?: ExpandedTopic[] } | ExpandedTopic[]>({
    model: "llama-3.3-70b-versatile",
    timeoutMs: OLLAMA_TIMEOUT_MS,
    maxTokens: null,
    temperature: 0.65,
    purpose: "roadmap",
    label: `Expand ${phase.title}`,
    systemInstruction: `You expand one learning phase into 4-8 specific skill topics.
Return ONLY JSON:
{ "topics": [{ "id": "kebab-case", "type": "skill|topic|project", "title": "string", "description": "string", "estimatedHours": number, "whyLearn": "string", "learningOutcomes": ["string"], "interviewFocus": "string", "skills": ["string"], "topics": ["string"], "subtopics": [{ "id": "kebab-case", "title": "string" }], "resources": [{ "title": "string", "url": "string", "type": "article|documentation|video|practice" }], "project": null }] }`,
    prompt: `Phase: ${phase.title} - ${phase.description}\nTarget Role: ${profile.targetRole}\nCompany: ${profile.targetCompany || "General"}\nGenerate topics for this phase.`,
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
      whyLearn: "This is the primary career objective.",
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

function buildFallbackRoadmap(profile: RoadmapProfile) {
  const role = profile.targetRole || "Software Engineer";
  const company = profile.targetCompany ? ` (${profile.targetCompany} Target)` : "";
  const title = `${role}${company} Structured Roadmap`;

  const phases = [
    {
      id: "phase-1",
      title: "Foundations & Core Computer Science",
      description: "Master essential programming fundamentals, data structures, algorithms, and git version control.",
      topics: [
        { title: "Data Structures & Algorithms", desc: "Arrays, LinkedLists, Trees, Graphs, and Big-O notation complexity analysis.", hours: 25 },
        { title: "System Design Fundamentals", desc: "Understanding HTTP, REST APIs, Client-Server architecture, and caching strategies.", hours: 20 },
        { title: "Git & Collaborative Workflow", desc: "Branching strategies, pull requests, resolving merge conflicts, and code reviews.", hours: 10 },
      ]
    },
    {
      id: "phase-2",
      title: "Core Domain Mastery & Framework Architecture",
      description: "Deep dive into production frameworks, state management, database design, and asynchronous patterns.",
      topics: [
        { title: "Modern Framework & Frontend Architecture", desc: "Component design patterns, Server Components, Hooks, and client state management.", hours: 30 },
        { title: "Backend API & Database Design", desc: "PostgreSQL, Drizzle ORM, schema modeling, indexing, and REST/GraphQL API design.", hours: 30 },
        { title: "Authentication & Security Standards", desc: "JWT tokens, OAuth2, Clerk authentication, session handling, and CORS policies.", hours: 15 },
      ]
    },
    {
      id: "phase-3",
      title: "Real-World Capstone & Technical Screening",
      description: "Build a production-grade full-stack project, set up CI/CD pipelines, and perform live interview preparation.",
      topics: [
        { title: "Full-Stack Capstone Project", desc: "Build & deploy a scalable application end-to-end with real user authentication and database persistence.", hours: 40 },
        { title: "System Design & Mock Technical Screening", desc: "Practice system design interviews, high availability architectures, and live coding challenges.", hours: 20 },
      ]
    }
  ];

  const outline: OutlineResult = {
    title,
    targetRole: role,
    estimatedWeeks: 12,
    goal: {
      id: "goal-1",
      title: `Become a Job-Ready ${role}`,
      description: `Complete structured modules, verified projects, and final AI interview screen for ${role}.`,
    },
    phases: phases.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      estimatedHours: 60,
    })),
  };

  const phaseTopicsMap = new Map<string, ExpandedTopic[]>();
  phases.forEach((p) => {
    phaseTopicsMap.set(
      p.id,
      p.topics.map((t, idx) => ({
        id: `${p.id}-t${idx + 1}`,
        type: idx === p.topics.length - 1 ? "project" : "skill",
        title: t.title,
        description: t.desc,
        estimatedHours: t.hours,
        whyLearn: `Essential for ${role} hiring screens.`,
        learningOutcomes: [`Master ${t.title} fundamentals`, `Apply knowledge in hands-on projects`],
        subtopics: [
          { id: `${p.id}-t${idx + 1}-s1`, title: "Core Concepts & Syntax" },
          { id: `${p.id}-t${idx + 1}-s2`, title: "Practical Hands-on Exercises" },
        ],
        resources: [
          { title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "documentation" },
          { title: "freeCodeCamp Guides", url: "https://www.freecodecamp.org", type: "article" },
        ],
      })),
    );
  });

  let { nodes, edges } = flattenGraph(outline, phaseTopicsMap);
  ({ nodes, edges } = attachFinalInterview(nodes, edges, profile));

  return {
    title,
    targetRole: role,
    estimatedWeeks: 12,
    nodes: ensureNodeAssessments(nodes),
    edges,
  };
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
    onProgress?.({ step: "graph", percent: 25, message: "Outlining the full curriculum…" });
    
    let outline: OutlineResult;
    try {
      outline = normalizeOutline(
        await generateOutline(profile, companyMode, hiring, adaptationContext),
      );
    } catch (outlineErr) {
      console.warn("[roadmap] AI outline generation failed, falling back to static structured roadmap:", outlineErr);
      return buildFallbackRoadmap(profile);
    }

    const phases = outline.phases;
    if (!phases.length) {
      return buildFallbackRoadmap(profile);
    }

    onProgress?.({
      step: "expand",
      percent: 50,
      message: `Expanding ${phases.length} phases concurrently…`,
    });

    const phaseTopics = new Map<string, ExpandedTopic[]>();
    const expansionResults = await Promise.allSettled(
      phases.map((phase) => expandPhase(profile, phase, companyMode)),
    );

    phases.forEach((phase, i) => {
      const res = expansionResults[i];
      if (res.status === "fulfilled" && res.value && res.value.length > 0) {
        phaseTopics.set(phase.id, res.value);
      } else {
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
    });

    let { nodes, edges } = flattenGraph(outline, phaseTopics);
    ({ nodes, edges } = attachFinalInterview(nodes, edges, profile));

    const payload = {
      title: clip(outline.title || `${profile.targetRole} roadmap`, 200, "Learning roadmap"),
      targetRole: clip(outline.targetRole || profile.targetRole, 200, "Role"),
      estimatedWeeks: outline.estimatedWeeks,
      nodes,
      edges,
    };

    onProgress?.({ step: "assessments", percent: 75, message: "Building assessments for key nodes…" });
    const assessable = ensureNodeAssessments(nodes);
    
    onProgress?.({ step: "resources", percent: 90, message: "Enriching learning resources…" });
    const leaves = assessable.filter(
      (n) => n.type === "skill" || n.type === "topic" || n.type === "project" || n.type === "checkpoint",
    );
    
    let nodesOut = assessable;
    try {
      const enrichedLeaves = await Promise.race([
        enrichNodeResources(leaves),
        new Promise<RoadmapNode[]>((resolve) => setTimeout(() => resolve(leaves), 4000)),
      ]);
      const byId = new Map(enrichedLeaves.map((n) => [n.id, n]));
      nodesOut = assessable.map((n) => byId.get(n.id) || n);
    } catch {
      // Keep assessable if enrichment times out
    }

    return {
      title: payload.title,
      targetRole: payload.targetRole,
      estimatedWeeks: payload.estimatedWeeks,
      nodes: nodesOut,
      edges,
    };
  } catch (error) {
    console.warn("[roadmap] Error during roadmap generation, using fallback:", error);
    return buildFallbackRoadmap(profile);
  }
}

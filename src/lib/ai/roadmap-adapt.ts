import "server-only";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { env } from "@/lib/env";
import { callOllamaJson } from "@/lib/ai/ollama";
import { getDb } from "@/lib/db/client";
import {
  interviewReports,
  roadmapProfiles,
  roadmapProgress,
  roadmaps,
} from "@/lib/db/schema";
import { buildAssessmentsForNode } from "@/lib/roadmap/assessment-bank";
import {
  MAX_ADAPTATION_ROUNDS,
  MAX_NEW_NODES_PER_FAIL,
  emptyAdaptation,
  parseAdaptation,
  parseCertificationStatus,
} from "@/lib/roadmap/certification";
import {
  computeInitialNodeStatus,
  relockDependents,
} from "@/lib/roadmap/progress";
import { persistGeneratedRoadmap } from "@/lib/roadmap/persist-generated";
import { curatedResourcesForNode } from "@/lib/roadmap/resource-library";
import { enrichNodeResources } from "@/lib/roadmap/validate-resources";
import type {
  InterviewNodeDiagnosis,
  InterviewOutcome,
  InterviewReportPublic,
} from "@/lib/ai/interview-types";
import type { RoadmapEdge, RoadmapNode } from "@/types/roadmap";

type AdaptResult = {
  outcome: InterviewOutcome | null;
  status: "idle" | "pending" | "applied";
  focusNodeId: string | null;
  insertedNodeIds: string[];
  loopedNodeIds: string[];
};

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

function asEdges(raw: unknown): RoadmapEdge[] {
  return Array.isArray(raw) ? (raw as RoadmapEdge[]) : [];
}

function diagnosesFromRaw(raw: unknown): InterviewNodeDiagnosis[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as Record<string, unknown>).nodeDiagnoses;
  if (!Array.isArray(list)) return [];
  return list.filter((item): item is InterviewNodeDiagnosis => {
    if (!item || typeof item !== "object") return false;
    const rec = item as InterviewNodeDiagnosis;
    return typeof rec.nodeId === "string" && typeof rec.score === "number";
  });
}

function outcomeFromRaw(raw: unknown, overall: number): InterviewOutcome | null {
  if (raw && typeof raw === "object") {
    const value = (raw as Record<string, unknown>).outcome;
    if (value === "certified" || value === "remediate" || value === "redesign") return value;
  }
  if (overall === 0) return "redesign";
  if (overall >= 70) return "certified";
  return "remediate";
}

function slugId(base: string, used: Set<string>): string {
  const root = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "review";
  let next = root;
  let n = 2;
  while (used.has(next)) {
    next = `${root}-${n}`;
    n += 1;
  }
  used.add(next);
  return next;
}

function wouldCycle(edges: RoadmapEdge[], source: string, target: string): boolean {
  if (source === target) return true;
  const children = new Map<string, string[]>();
  for (const edge of edges) {
    const list = children.get(edge.source) || [];
    list.push(edge.target);
    children.set(edge.source, list);
  }
  const stack = [...(children.get(target) || [])];
  const seen = new Set<string>();
  while (stack.length) {
    const id = stack.pop();
    if (!id || seen.has(id)) continue;
    if (id === source) return true;
    seen.add(id);
    for (const next of children.get(id) || []) stack.push(next);
  }
  return false;
}

function remapAssessmentIds(node: RoadmapNode, revision: number): RoadmapNode {
  const assessments = buildAssessmentsForNode(node).map((item, index) => ({
    ...item,
    id: `${node.id}-r${revision}-${item.type}-${index}`,
  }));
  if (assessments.length === 1) {
    assessments.push({
      ...assessments[0],
      id: `${node.id}-r${revision}-mcq-extra`,
      type: "mcq",
      title: "Concept check",
      passScore: 70,
      timeLimitMinutes: Math.min(assessments[0].timeLimitMinutes || 15, 15),
      mcq: assessments[0].mcq || {
        questions: [
          {
            id: `${node.id}-r${revision}-q1`,
            prompt: `What is the first thing to practice for ${node.title}?`,
            options: ["Skip the basics", "Work a small example by hand", "Memorize answers", "Ignore edge cases"],
            correctIndex: 1,
          },
        ],
      },
    });
  }
  return { ...node, assessment: assessments[0], assessments };
}

async function refreshNodePack(input: {
  node: RoadmapNode;
  weakness: string;
  userId: string;
}): Promise<RoadmapNode> {
  const revision = (input.node.revision || 0) + 1;
  const previousUrls = new Set((input.node.resources || []).map((r) => r.url));
  let description = input.node.description;
  let whyLearn = input.node.whyLearn;
  let learningOutcomes = input.node.learningOutcomes || [];
  let topics = input.node.topics || [];
  try {
    const generated = await callOllamaJson<{
      description?: string;
      whyLearn?: string;
      learningOutcomes?: string[];
      topics?: string[];
    }>({
      prompt: `Rewrite this learning node so a student who failed an interview on it can learn it more easily.
Title: ${input.node.title}
Weakness: ${input.weakness || "fundamentals were missing"}
Current description: ${input.node.description}
Return JSON only: {"description":"4-6 beginner sentences","whyLearn":"2 sentences","learningOutcomes":["..."],"topics":["..."]}`,
      systemInstruction: "You rewrite learning modules for struggling students. JSON only. Be concrete and beginner-first.",
      model: env.ollamaRoadmapModel,
      maxTokens: null,
      timeoutMs: 180000,
      temperature: 0.5,
      label: "Ollama roadmap adapt",
      purpose: "roadmap",
    });
    if (typeof generated.description === "string" && generated.description.trim()) {
      description = generated.description.trim().slice(0, 1200);
    }
    if (typeof generated.whyLearn === "string" && generated.whyLearn.trim()) {
      whyLearn = generated.whyLearn.trim().slice(0, 500);
    }
    if (Array.isArray(generated.learningOutcomes)) {
      learningOutcomes = generated.learningOutcomes
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 6);
    }
    if (Array.isArray(generated.topics)) {
      topics = generated.topics
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 8);
    }
  } catch (err) {
    console.warn("[roadmap-adapt] loop refresh LLM failed", err);
  }

  const curated = curatedResourcesForNode(
    `${input.node.title} ${topics.join(" ")} ${input.node.skills?.join(" ") || ""}`,
  ).filter((r) => !previousUrls.has(r.url));
  const resources = (curated.length ? curated : input.node.resources || [])
    .slice(0, 6)
    .map((r, i) => ({ ...r, suggested: i > 2 }));

  let next: RoadmapNode = {
    ...input.node,
    description,
    whyLearn,
    learningOutcomes,
    topics,
    resources,
    revision,
    source: "loop_refresh",
  };
  next = remapAssessmentIds(next, revision);
  const [enriched] = await enrichNodeResources([next]);
  return enriched;
}

async function generateRemedialNodes(input: {
  origin: RoadmapNode;
  weakness: string;
  userId: string;
  usedIds: Set<string>;
  remaining: number;
}): Promise<RoadmapNode[]> {
  if (input.remaining <= 0) return [];
  const count = Math.min(2, input.remaining);
  let drafts: Array<{ title: string; description: string; whyLearn: string; topics: string[] }> = [];
  try {
    const generated = await callOllamaJson<{
      nodes?: Array<{ title?: string; description?: string; whyLearn?: string; topics?: string[] }>;
    }>({
      prompt: `Add ${count} short follow-up learning node(s) after "${input.origin.title}" for a student who was weak here: ${input.weakness || "needs more practice"}.
Return JSON only: {"nodes":[{"title":"specific title","description":"4-6 sentences","whyLearn":"2 sentences","topics":["..."]}]}`,
      systemInstruction: "You add remedial learning nodes. JSON only. Titles must be specific, not generic.",
      model: env.ollamaRoadmapModel,
      maxTokens: null,
      timeoutMs: 180000,
      temperature: 0.6,
      label: "Ollama roadmap remediate",
      purpose: "roadmap",
    });
    if (Array.isArray(generated.nodes)) {
      drafts = generated.nodes
        .map((item) => ({
          title: typeof item.title === "string" ? item.title.trim() : "",
          description: typeof item.description === "string" ? item.description.trim() : "",
          whyLearn: typeof item.whyLearn === "string" ? item.whyLearn.trim() : "",
          topics: Array.isArray(item.topics)
            ? item.topics.filter((t): t is string => typeof t === "string").slice(0, 6)
            : [],
        }))
        .filter((item) => item.title)
        .slice(0, count);
    }
  } catch (err) {
    console.warn("[roadmap-adapt] expand LLM failed", err);
  }
  if (!drafts.length) {
    drafts = [
      {
        title: `${input.origin.title}: guided practice`,
        description: `Revisit ${input.origin.title} with smaller examples, then one interview-style drill. ${input.weakness}`.slice(0, 900),
        whyLearn: `This extra practice closes the gap that showed up in the certification interview.`,
        topics: input.origin.topics?.slice(0, 4) || [input.origin.title],
      },
    ].slice(0, count);
  }

  const nodes: RoadmapNode[] = drafts.map((draft) => {
    const id = slugId(`${input.origin.id}-review`, input.usedIds);
    const node: RoadmapNode = {
      id,
      type: "skill",
      title: draft.title.slice(0, 80),
      description: draft.description.slice(0, 1200) || `Practice ${input.origin.title} with new examples.`,
      status: "locked",
      priority: "high",
      estimatedHours: Math.max(2, Math.min(6, input.origin.estimatedHours || 3)),
      dependencies: [input.origin.id],
      skills: input.origin.skills?.slice(0, 4) || [],
      topics: draft.topics.length ? draft.topics : input.origin.topics?.slice(0, 4) || [],
      resources: [],
      project: null,
      whyLearn: draft.whyLearn || `Strengthen ${input.origin.title} before the next certification interview.`,
      learningOutcomes: [`Demonstrate ${draft.title} without notes`],
      interviewFocus: `Expect a follow-up on ${input.origin.title}.`,
      originNodeId: input.origin.id,
      source: "remediation",
      revision: 1,
    };
    return remapAssessmentIds(node, 1);
  });
  return enrichNodeResources(nodes);
}

export async function applyRoadmapInterviewOutcome(input: {
  userId: string;
  roadmapId: string;
  sessionId: string;
  overall: number;
  outcome: InterviewOutcome | null;
  summary: string;
}): Promise<void> {
  if (!input.outcome) return;
  const db = getDb();
  const [row] = await db
    .select()
    .from(roadmaps)
    .where(and(eq(roadmaps.id, input.roadmapId), eq(roadmaps.userId, input.userId)))
    .limit(1);
  if (!row) return;
  if (row.certifiedAt || parseCertificationStatus(row.certificationStatus) === "certified") return;

  const adaptation = parseAdaptation(row.adaptation);
  const now = new Date();
  if (input.outcome === "certified") {
    const nodes = asNodes(row.nodes);
    const interviewIds = nodes
      .filter((n) => n.type === "interview" || n.gate === "final_interview")
      .map((n) => n.id);
    if (interviewIds.length) {
      for (const nodeId of interviewIds) {
        await db
          .update(roadmapProgress)
          .set({ status: "completed", completedAt: now, updatedAt: now })
          .where(
            and(
              eq(roadmapProgress.userId, input.userId),
              eq(roadmapProgress.roadmapId, input.roadmapId),
              eq(roadmapProgress.nodeId, nodeId),
            ),
          );
      }
    }
    await db
      .update(roadmaps)
      .set({
        certifiedAt: now,
        certificationStatus: "certified",
        lastFinalInterviewId: input.sessionId,
        adaptation: { ...adaptation, pendingOutcome: null },
      })
      .where(eq(roadmaps.id, input.roadmapId));
    return;
  }

  await db
    .update(roadmaps)
    .set({
      certificationStatus: input.outcome === "redesign" ? "redesigning" : "remediating",
      lastFinalInterviewId: input.sessionId,
      adaptation: {
        ...adaptation,
        pendingOutcome: input.outcome,
      },
    })
    .where(eq(roadmaps.id, input.roadmapId));
}

export async function applyRoadmapAdaptation(userId: string, sessionId?: string): Promise<AdaptResult> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(roadmaps)
    .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)))
    .limit(1);
  if (!row) throw AppError.notFound("Active roadmap not found");

  const adaptation = parseAdaptation(row.adaptation);
  const targetSession = sessionId || row.lastFinalInterviewId;
  if (!targetSession) {
    return { outcome: null, status: "idle", focusNodeId: null, insertedNodeIds: [], loopedNodeIds: [] };
  }
  if (adaptation.appliedSessionIds.includes(targetSession)) {
    return {
      outcome: adaptation.pendingOutcome ?? null,
      status: "applied",
      focusNodeId: adaptation.loopedNodeIds[0] || adaptation.insertedNodeIds[0] || null,
      insertedNodeIds: adaptation.insertedNodeIds,
      loopedNodeIds: adaptation.loopedNodeIds,
    };
  }

  const [report] = await db
    .select()
    .from(interviewReports)
    .where(eq(interviewReports.sessionId, targetSession))
    .limit(1);
  if (!report) throw AppError.notFound("Interview report not ready yet");

  const outcome = outcomeFromRaw(report.raw, report.overall);
  const diagnoses = diagnosesFromRaw(report.raw);
  const summary = report.summary || "";

  if (outcome === "certified") {
    await applyRoadmapInterviewOutcome({
      userId,
      roadmapId: row.id,
      sessionId: targetSession,
      overall: report.overall,
      outcome,
      summary,
    });
    return { outcome, status: "applied", focusNodeId: null, insertedNodeIds: [], loopedNodeIds: [] };
  }

  if (outcome === "redesign") {
    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, userId))
      .limit(1);
    if (!profile) throw AppError.badRequest("Profile is required to rebuild the roadmap.");
    await persistGeneratedRoadmap(userId, profile, undefined, {
      overall: report.overall,
      summary,
      failedTopics: diagnoses.map((item) => item.title),
    });
    return { outcome, status: "applied", focusNodeId: null, insertedNodeIds: [], loopedNodeIds: [] };
  }

  let nodes = asNodes(row.nodes);
  let edges = asEdges(row.edges);
  const usedIds = new Set(nodes.map((n) => n.id));
  const progressRows = await db
    .select()
    .from(roadmapProgress)
    .where(and(eq(roadmapProgress.userId, userId), eq(roadmapProgress.roadmapId, row.id)));
  const progressMap = new Map(progressRows.map((p) => [p.nodeId, { ...p }]));
  const now = new Date();
  const loopedNodeIds: string[] = [];
  const refreshedNodeIds: string[] = [];
  const relockedNodeIds: string[] = [];
  const insertedNodeIds: string[] = [];
  const lockedFromLoop = new Set<string>();

  const loopTargets = diagnoses.filter((item) => item.action === "loop");
  for (const diagnosis of loopTargets) {
    const index = nodes.findIndex((n) => n.id === diagnosis.nodeId);
    if (index < 0) continue;
    nodes[index] = await refreshNodePack({
      node: nodes[index],
      weakness: diagnosis.weakness,
      userId,
    });
    loopedNodeIds.push(diagnosis.nodeId);
    refreshedNodeIds.push(diagnosis.nodeId);
    const current = progressMap.get(diagnosis.nodeId);
    if (current) {
      current.status = "available";
      current.completedAt = null;
      current.updatedAt = now;
    }
    const locked = relockDependents(diagnosis.nodeId, edges, progressMap);
    for (const id of locked) {
      lockedFromLoop.add(id);
      relockedNodeIds.push(id);
      const rowP = progressMap.get(id);
      if (rowP) {
        rowP.status = "locked";
        rowP.completedAt = null;
        rowP.updatedAt = now;
      }
    }
  }

  const canGrow = adaptation.round < MAX_ADAPTATION_ROUNDS;
  let remaining = canGrow ? MAX_NEW_NODES_PER_FAIL : 0;
  const expandTargets = diagnoses
    .filter((item) => item.action === "expand" && !lockedFromLoop.has(item.nodeId))
    .sort((a, b) => a.score - b.score);

  for (const diagnosis of expandTargets) {
    if (remaining <= 0) break;
    const origin = nodes.find((n) => n.id === diagnosis.nodeId);
    if (!origin) continue;
    const created = await generateRemedialNodes({
      origin,
      weakness: diagnosis.weakness,
      userId,
      usedIds,
      remaining,
    });
    for (const node of created) {
      nodes.push(node);
      const edge: RoadmapEdge = {
        id: `e-${origin.id}-${node.id}`,
        source: origin.id,
        target: node.id,
        label: "review",
      };
      if (!wouldCycle(edges, origin.id, node.id)) edges.push(edge);
      remaining -= 1;
      insertedNodeIds.push(node.id);
      progressMap.set(node.id, {
        id: crypto.randomUUID(),
        userId,
        roadmapId: row.id,
        nodeId: node.id,
        status: computeInitialNodeStatus(node.id, edges),
        completedAt: null,
        updatedAt: now,
      } as (typeof progressRows)[number]);
    }
  }

  const nextAdaptation = {
    ...adaptation,
    round: adaptation.round + 1,
    pendingOutcome: null,
    appliedSessionIds: [...adaptation.appliedSessionIds, targetSession],
    insertedNodeIds: [...adaptation.insertedNodeIds, ...insertedNodeIds],
    loopedNodeIds: [...adaptation.loopedNodeIds, ...loopedNodeIds],
    refreshedNodeIds: [...adaptation.refreshedNodeIds, ...refreshedNodeIds],
    relockedNodeIds: [...adaptation.relockedNodeIds, ...relockedNodeIds],
  };

  await db
    .update(roadmaps)
    .set({
      nodes,
      edges,
      certificationStatus: "remediating",
      lastFinalInterviewId: targetSession,
      adaptation: nextAdaptation,
    })
    .where(eq(roadmaps.id, row.id));

  for (const [nodeId, prog] of progressMap) {
    const existing = progressRows.find((p) => p.nodeId === nodeId);
    if (existing) {
      await db
        .update(roadmapProgress)
        .set({
          status: prog.status,
          completedAt: prog.status === "completed" ? prog.completedAt : null,
          updatedAt: now,
        })
        .where(eq(roadmapProgress.id, existing.id));
    } else {
      await db.insert(roadmapProgress).values({
        id: crypto.randomUUID(),
        userId,
        roadmapId: row.id,
        nodeId,
        status: prog.status || "locked",
        completedAt: null,
        updatedAt: now,
      });
    }
  }

  return {
    outcome,
    status: "applied",
    focusNodeId: loopedNodeIds[0] || insertedNodeIds[0] || null,
    insertedNodeIds,
    loopedNodeIds,
  };
}

export function reportAdaptationFields(report: InterviewReportPublic, extra?: Partial<AdaptResult>) {
  return {
    ...report,
    adaptationStatus: extra?.status || report.adaptationStatus || "idle",
    focusNodeId: extra?.focusNodeId ?? report.focusNodeId ?? null,
  };
}

export { emptyAdaptation };

import { allTrackableNodesSatisfied as statsAllSatisfied, isTrackableRoadmapNode } from "@/lib/roadmap/stats";
import type { InterviewDifficulty, InterviewNodeCoverage, InterviewTrack } from "@/lib/ai/interview-types";
import type { RoadmapNode } from "@/types/roadmap";

const STUDIED = new Set(["completed"]);

export function studiedTopicsFromRoadmap(
  nodes: unknown,
  progressByNodeId: Map<string, string>,
): string[] {
  if (!Array.isArray(nodes)) return [];
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") continue;
    const node = raw as RoadmapNode;
    if (!isTrackableRoadmapNode(node)) continue;
    const status = progressByNodeId.get(node.id);
    if (!STUDIED.has(String(status))) continue;
    const title = typeof node.title === "string" ? node.title.trim() : "";
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const focus =
      typeof node.interviewFocus === "string" ? node.interviewFocus.trim() : "";
    topics.push((focus ? `${title} (${focus})` : title).slice(0, 140));
    if (topics.length >= 20) break;
  }
  return topics;
}

export function allTrackableNodesSatisfied(
  nodes: unknown,
  progressByNodeId: Map<string, string>,
): boolean {
  if (!Array.isArray(nodes)) return false;
  return statsAllSatisfied(nodes as RoadmapNode[], progressByNodeId);
}

export type RoadmapInterviewPreset = {
  track: InterviewTrack;
  difficulty: InterviewDifficulty;
  focus: string;
};

function nodeBlob(node: RoadmapNode) {
  return [node.title, node.description, node.type, ...(node.topics || []), ...(node.skills || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function looksBehavioral(blob: string) {
  return /\b(behavior|behaviour|leadership|communication|career|soft skill|teamwork|ownership|stakeholder)\b/.test(
    blob,
  );
}

function looksDsa(blob: string) {
  return /\b(algorithm|dsa|array|tree|graph|dynamic|hash|pointer|leetcode|coding|dp|recursion|complexity)\b/.test(
    blob,
  );
}

export function interviewPresetFromRoadmap(
  nodes: unknown,
  progressByNodeId: Map<string, string>,
  profile?: Record<string, unknown> | null,
): RoadmapInterviewPreset {
  const list = Array.isArray(nodes) ? (nodes as RoadmapNode[]) : [];
  const trackable = list.filter((node) => isTrackableRoadmapNode(node));
  const studied = studiedTopicsFromRoadmap(nodes, progressByNodeId);
  let dsa = 0;
  let behavioral = 0;
  let hard = 0;
  let easy = 0;
  for (const node of trackable) {
    const blob = nodeBlob(node);
    if (looksBehavioral(blob)) behavioral += 1;
    if (looksDsa(blob) || node.assessment?.type === "coding") dsa += 1;
    if (node.priority === "critical" || node.priority === "high") hard += 1;
    if (node.priority === "low") easy += 1;
    const codingDiff =
      node.assessment?.coding?.difficulty ||
      node.assessments?.find((item) => item.coding)?.coding?.difficulty;
    if (codingDiff === "hard") hard += 1;
    if (codingDiff === "easy") easy += 1;
  }

  const track: InterviewTrack =
    dsa > 0 && behavioral > 0
      ? "dsa_behavioral"
      : behavioral > dsa
        ? "behavioral"
        : dsa > 0
          ? "dsa"
          : "dsa_behavioral";

  const experience = String(profile?.experienceLevel || "").toLowerCase();
  let difficulty: InterviewDifficulty = "medium";
  if (hard > easy + 1) difficulty = "hard";
  else if (easy > hard + 1) difficulty = "easy";
  if (/\b(senior|advanced|experienced)\b/.test(experience)) difficulty = "hard";
  if (/\b(intern|beginner|fresher|junior)\b/.test(experience) && difficulty === "hard") {
    difficulty = "medium";
  }

  const focus = (
    studied.length
      ? studied
          .slice(0, 3)
          .map((item) => item.split(" (")[0])
          .join(", ")
      : trackable.find((node) => node.title)?.title || ""
  ).slice(0, 120);

  return { track, difficulty, focus };
}

export function finalInterviewCoverage(
  nodes: unknown,
  progressByNodeId?: Map<string, string>,
): InterviewNodeCoverage[] {
  if (!Array.isArray(nodes)) return [];
  const coverage: InterviewNodeCoverage[] = [];
  const seen = new Set<string>();
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") continue;
    const node = raw as RoadmapNode;
    if (!isTrackableRoadmapNode(node)) continue;
    const title = typeof node.title === "string" ? node.title.trim() : "";
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const status = progressByNodeId?.get(node.id) || node.status;
    if (status === "skipped") continue;
    coverage.push({
      nodeId: node.id,
      title: title.slice(0, 140),
      topics: (node.topics || []).filter((t) => typeof t === "string").slice(0, 8),
    });
    if (coverage.length >= 40) break;
  }
  if (!coverage.length) {
    for (const raw of Array.isArray(nodes) ? nodes : []) {
      if (!raw || typeof raw !== "object") continue;
      const node = raw as RoadmapNode;
      if (!isTrackableRoadmapNode(node) || !node.title) continue;
      coverage.push({
        nodeId: node.id,
        title: node.title.trim().slice(0, 140),
        topics: (node.topics || []).slice(0, 8),
      });
      if (coverage.length >= 40) break;
    }
  }
  return coverage;
}

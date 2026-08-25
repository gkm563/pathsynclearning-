import { RoadmapNode, RoadmapEdge, RoadmapProfile } from '@/types/roadmap';
import { callAIWithFallback } from './llm';
import { roadmapSchema } from '@/lib/validation/roadmap-schemas';
import { AppError } from '@/lib/api/errors';
import { ensureNodeAssessments } from '@/lib/roadmap/assessment-bank';

/** Keep the profile payload small — DB rows include ids/timestamps the model does not need. */
function compactProfile(profile: RoadmapProfile) {
  return {
    currentStudy: profile.currentStudy,
    yearSemester: profile.yearSemester,
    academicBackground: profile.academicBackground,
    enjoyedSubjects: profile.enjoyedSubjects,
    struggledSubjects: profile.struggledSubjects,
    careerGoal: profile.careerGoal,
    targetRole: profile.targetRole,
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

export async function generateRoadmap(profile: RoadmapProfile, userId: string): Promise<{ title: string; targetRole: string; estimatedWeeks: number; nodes: RoadmapNode[]; edges: RoadmapEdge[] }> {
  const systemInstruction = `You are an expert career coach and learning path architect.
Create a PERSONALIZED learning roadmap as a directed acyclic graph (DAG).

Hard limits (must obey — oversized JSON will be truncated):
- Generate 12-18 nodes total (not more).
- 1 goal, 2-3 milestones, 2-3 phases; remaining nodes are skills/projects/checkpoints.
- description: max 1 short sentence (~120 chars).
- whyLearn: max 1 short sentence (~100 chars).
- resources: 1-2 per learnable node; MUST include at least one free YouTube video (type "video", real youtube.com or youtu.be URL) for skill/topic/project/checkpoint nodes.
- skills/topics: 1-3 short strings each.
- project field: null unless type is project (then one short sentence).
- Node IDs: unique kebab-case.
- status: always "locked".
- Edges: one edge per dependency; source = prerequisite, target = dependent.
- Skip topics the student already knows at advanced/very_confident.
- Scale estimatedHours to weeklyHours and targetTimeline.
- For skill/topic/project/checkpoint nodes, include an "assessment" object:
  - Conceptual nodes (topic/checkpoint): type "mcq" with 3-5 questions (options + correctIndex 0-based).
  - Coding-heavy skill/project: type "coding" with JS-only starterCode, functionName, examples, publicTests [{args, expected}], hiddenTests [{args, expected}].
  - passScore: 70 for mcq, 100 for coding; timeLimitMinutes 15-45.

Return ONLY valid JSON matching:
{
  "title": "string",
  "targetRole": "string",
  "estimatedWeeks": number,
  "nodes": [{
    "id": "string",
    "type": "goal|milestone|phase|skill|topic|project|resource|checkpoint|career",
    "title": "string",
    "description": "string",
    "status": "locked",
    "priority": "low|medium|high|critical",
    "estimatedHours": number,
    "dependencies": ["node-id"],
    "skills": ["string"],
    "topics": ["string"],
    "resources": [{"title":"string","url":"string","type":"documentation|video|course|practice|article|project"}],
    "project": "string|null",
    "whyLearn": "string",
    "assessment": {
      "type": "mcq|coding",
      "passScore": number,
      "timeLimitMinutes": number,
      "mcq": {"questions":[{"id":"string","prompt":"string","options":["string"],"correctIndex":0}]},
      "coding": {"prompt":"string","starterCode":"string","functionName":"string","examples":[{"input":"string","output":"string"}],"publicTests":[{"args":[],"expected":null}],"hiddenTests":[{"args":[],"expected":null}]}
    }
  }],
  "edges": [{"id":"string","source":"string","target":"string","label":"string"}]
}`;

  const prompt = `Generate a personalized roadmap for this student profile:\n${JSON.stringify(compactProfile(profile))}`;

  try {
    const result = await callAIWithFallback<any>({
      prompt,
      systemInstruction,
      userId,
      timeoutMs: 90000,
      maxTokens: 8192,
      temperature: 1,
      reasoningEffort: 'medium',
    });

    const loose = roadmapSchema.safeParse(result);
    const base = loose.success
      ? loose.data
      : (() => {
          const nodes = Array.isArray(result?.nodes)
            ? result.nodes.map((n: any) => {
                const { assessment: _a, ...rest } = n || {};
                return rest;
              })
            : [];
          return roadmapSchema.parse({ ...result, nodes });
        })();

    const nodes = ensureNodeAssessments(base.nodes as RoadmapNode[]);
    return {
      title: base.title,
      targetRole: base.targetRole,
      estimatedWeeks: base.estimatedWeeks,
      nodes,
      edges: base.edges as RoadmapEdge[],
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      console.error("Zod Validation Failed:", JSON.stringify((error as any).errors, null, 2));
      throw AppError.badRequest('Invalid roadmap generated by AI. Please try again.');
    }
    throw error;
  }
}

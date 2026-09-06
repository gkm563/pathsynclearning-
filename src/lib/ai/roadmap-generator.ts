import { RoadmapNode, RoadmapEdge, RoadmapProfile } from '@/types/roadmap';
import { callAIWithFallback } from './llm';
import { roadmapSchema } from '@/lib/validation/roadmap-schemas';
import { AppError } from '@/lib/api/errors';
import { ensureNodeAssessments } from '@/lib/roadmap/assessment-bank';
import { hiringBrief } from '@/lib/roadmap/hiring-catalog';
import { enrichNodeResources } from '@/lib/roadmap/validate-resources';

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

export async function generateRoadmap(
  profile: RoadmapProfile,
  userId: string,
  onProgress?: (p: { step: string; percent: number; message: string }) => void,
): Promise<{ title: string; targetRole: string; estimatedWeeks: number; nodes: RoadmapNode[]; edges: RoadmapEdge[] }> {
  const hiring = hiringBrief(profile.targetCompany, profile.targetRole);
  const companyMode = Boolean(profile.targetCompany);

  const systemInstruction = `You are an expert career coach who writes hiring-accurate learning roadmaps as a DAG.

Hard limits:
- Generate 12-18 nodes total.
- 1 goal, 2-3 milestones, 2-3 phases; remaining nodes are skills/projects/checkpoints.
- Node IDs: unique kebab-case. status: always "locked".
- Edges: source = prerequisite, target = dependent. DAG only.
- Skip topics the student already knows at advanced/very_confident.
- Scale estimatedHours to weeklyHours and targetTimeline.

DETAILED NODE CONTENT (required for skill/topic/project/checkpoint):
- title: specific, not generic ("Amazon OA: Arrays & Hashing" not "DSA").
- description: 4-7 sentences. Cover what to learn, how to practice, what "good" looks like, and common failure modes. 400-900 characters.
- whyLearn: 2-3 sentences tying this node to the role${companyMode ? ' and this company hiring loop' : ''}.
- learningOutcomes: 3-6 concrete bullets (skills the student can demonstrate after the node).
- interviewFocus: 1-2 sentences on how this shows up in interviews${companyMode ? ' at the target company' : ' for this role'}.
- topics: 4-8 specific subtopics.
- skills: 2-5 skill tags.
- resources: 4-6 items mixing types. MUST include at least 3 YouTube videos from DIFFERENT channels (freeCodeCamp, Fireship, Traversy, NeetCode, TechWorld with Nana, StatQuest, 3Blue1Brown, Abdul Bari, Bro Code, NetworkChuck, etc.). Also include official docs and one practice site when relevant.
- Only use real https URLs. Never invent video IDs. Prefer well-known public catalog URLs. Resources will be validated; broken/private links are dropped.
- project field: null unless type is project.

${companyMode ? `COMPANY-TARGETED HIRING PATH
Hiring brief: ${JSON.stringify(hiring)}
- Title must mention the company and role.
- Curriculum MUST match what this company actually screens for (OA, machine coding, LPs, values, domain).
- Do not add roles or skills they do not hire for.
- Include checkpoints for mock OA / behavioral stories mapped to their loop.
- Goal node states the company + role outcome.
- Prefer the company's common stack from the brief.` : `ROLE-BASED PATH (no target company)
- Do NOT mention a specific employer.
- Teach what this role is hired for across the industry: core skills, portfolio proof, and a realistic interview sequence.
- Goal node is the role outcome, not a company.`}

Assessments for skill/topic/project/checkpoint:
- Grounded in THIS node only.
- You MAY attach 1–3 assessments on the same node when the topic is interview-heavy (checkpoint, OA/DSA, high priority). Mix a coding problem with a short concept MCQ when both matter.
- Conceptual: type "mcq" with 3-5 questions.
- Coding-heavy: type "coding" with a LeetCode-style statement (problem story, input/output, what to return), JS starterCode, functionName, 2–3 examples with explanations, constraints[], optional hints[], publicTests, hiddenTests. Do not write a one-line prompt — write a full problem description.
- passScore: 70 mcq / 100 coding; timeLimitMinutes 15-45.
- Put the primary assessment in "assessment" and the full list in "assessments" (including the primary). Each item needs a unique "id" and "title".

Return ONLY JSON:
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
    "learningOutcomes": ["string"],
    "interviewFocus": "string",
    "resources": [{"title":"string","url":"string","type":"documentation|video|course|practice|article|project","channel":"string"}],
    "project": "string|null",
    "whyLearn": "string",
    "assessment": {
      "id": "string",
      "title": "string",
      "type": "mcq|coding",
      "passScore": number,
      "timeLimitMinutes": number,
      "mcq": {"questions":[{"id":"string","prompt":"string","options":["string"],"correctIndex":0}]},
      "coding": {"title":"string","difficulty":"easy|medium|hard","prompt":"string","statement":"string","starterCode":"string","functionName":"string","constraints":["string"],"hints":["string"],"followUp":"string","examples":[{"input":"string","output":"string","explanation":"string"}],"publicTests":[{"args":[],"expected":null}],"hiddenTests":[{"args":[],"expected":null}]}
    },
    "assessments": []
  }],
  "edges": [{"id":"string","source":"string","target":"string","label":"string"}]
}`;

  const prompt = `Generate a personalized roadmap for this student profile:\n${JSON.stringify(compactProfile(profile))}`;

  try {
    onProgress?.({ step: 'graph', percent: 35, message: 'Writing detailed nodes with the AI…' });
    const result = await callAIWithFallback<any>({
      prompt,
      systemInstruction,
      userId,
      timeoutMs: 90000,
      maxTokens: 12288,
      temperature: 0.7,
      reasoningEffort: 'medium',
    });

    const loose = roadmapSchema.safeParse(result);
    const base = loose.success
      ? loose.data
      : (() => {
          const nodes = Array.isArray(result?.nodes)
            ? result.nodes.map((n: any) => {
                const { assessment: _a, assessments: _b, ...rest } = n || {};
                return rest;
              })
            : [];
          return roadmapSchema.parse({ ...result, nodes });
        })();

    onProgress?.({ step: 'assessments', percent: 62, message: 'Building assessments for each node…' });
    const assessed = ensureNodeAssessments(base.nodes as RoadmapNode[]);
    onProgress?.({ step: 'resources', percent: 78, message: 'Checking videos are public and playable…' });
    const nodes = await enrichNodeResources(assessed);
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

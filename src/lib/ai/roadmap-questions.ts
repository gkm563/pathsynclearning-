import { RoadmapProfile, FollowUpQuestionsResponse, FollowUpQuestion } from '@/types/roadmap';
import { callAIWithFallback } from './llm';
import { followUpQuestionsResponseSchema } from '@/lib/validation/roadmap-schemas';
import { hiringBrief } from '@/lib/roadmap/hiring-catalog';
import { generationStageQuestions } from '@/lib/roadmap/generation-questions';
export type { RoadmapGenerationMode } from '@/lib/roadmap/generation-questions';
import type { RoadmapGenerationMode } from '@/lib/roadmap/generation-questions';

const COVERED: Array<{ test: (p: RoadmapProfile) => boolean; phrases: string[] }> = [
  { test: (p) => Boolean(p.targetCompany), phrases: ['company', 'employer', 'which org', 'target company', 'dream company'] },
  { test: (p) => Boolean(p.targetRole), phrases: ['which role', 'job role', 'target role', 'position are you'] },
  { test: (p) => Boolean(p.careerGoal), phrases: ['career goal', 'what do you want to achieve', 'internship or job'] },
  { test: (p) => Boolean(p.weeklyHours), phrases: ['weekly hours', 'how many hours', 'time per week'] },
  { test: (p) => Boolean(p.targetTimeline), phrases: ['timeline', 'how soon', 'deadline', 'when do you want'] },
  { test: (p) => Boolean(p.learningStyles?.length), phrases: ['learn best', 'learning style', 'video or docs'] },
  { test: (p) => Boolean(p.experienceLevel), phrases: ['real-world experience', 'internship experience'] },
  { test: (p) => p.hasProjects || Boolean(p.projects?.length), phrases: ['have you built projects', 'portfolio projects'] },
  { test: (p) => Boolean(p.knownSkills?.length), phrases: ['which skills do you know', 'current skills'] },
  { test: (p) => Boolean(p.currentStudy), phrases: ['what do you study', 'degree', 'college'] },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isCoveredQuestion(q: FollowUpQuestion, profile: RoadmapProfile) {
  const text = normalize(`${q.id} ${q.question}`);
  return COVERED.some((c) => c.test(profile) && c.phrases.some((p) => text.includes(p)));
}

function similar(a: string, b: string) {
  const na = new Set(normalize(a).split(' ').filter((w) => w.length > 3));
  const nb = new Set(normalize(b).split(' ').filter((w) => w.length > 3));
  if (!na.size || !nb.size) return false;
  let overlap = 0;
  for (const w of na) if (nb.has(w)) overlap++;
  return overlap / Math.min(na.size, nb.size) >= 0.6;
}

function sanitizeQuestions(
  questions: FollowUpQuestion[],
  profile: RoadmapProfile,
  mode: RoadmapGenerationMode,
): FollowUpQuestion[] {
  const out: FollowUpQuestion[] = [];
  for (const q of questions) {
    if (!q?.id || !q.question) continue;
    if (isCoveredQuestion(q, profile)) continue;
    if (mode === 'general') {
      const t = normalize(q.question);
      if (t.includes('company') || t.includes('employer') || t.includes('faang')) continue;
    }
    if (mode === 'targeted') {
      const t = normalize(q.question);
      if (t.includes('which role') || t.includes('target company')) continue;
    }
    if (out.some((prev) => prev.id === q.id || similar(prev.question, q.question))) continue;
    out.push({
      ...q,
      options: Array.isArray(q.options) ? q.options.slice(0, 8) : [],
    });
  }
  return out.slice(0, 6);
}

function fallbackQuestions(profile: RoadmapProfile, mode: RoadmapGenerationMode): FollowUpQuestion[] {
  const stage = generationStageQuestions(mode, profile.targetRole, profile.targetCompany);
  const brief = hiringBrief(profile.targetCompany, profile.targetRole);
  const loop = brief.company?.interviewLoop ?? [];
  const stacks = brief.company?.stacks ?? stage.skills.options.slice(0, 6);
  const skillOptions = stage.skills.options.slice(0, 6);

  const targeted: FollowUpQuestion[] = [
    {
      id: 'hiring-round-priority',
      question: loop.length
        ? `Which ${stage.companyLabel} round should we optimize first?`
        : 'Which interview track should this company path prioritize first?',
      type: 'single_choice',
      options: loop.length ? loop : ['Coding / DSA', 'Domain + projects', 'Behavioral / values'],
      reason: 'Hiring loops weight these rounds differently by company.',
      required: true,
    },
    {
      id: 'stack-comfort',
      question: stacks.length
        ? `How comfortable are you with ${stacks.slice(0, 3).join(', ')}?`
        : `How comfortable are you with the core ${stage.roleLabel} stack?`,
      type: 'single_choice',
      options: ['New to it', 'Course-level', 'Can build with docs', 'Interview-ready', 'Production experience'],
      reason: 'Company paths should match the stack they actually screen.',
      required: true,
    },
    {
      id: 'offer-type',
      question: `What offer type are you aiming for at ${stage.companyLabel || 'this company'}?`,
      type: 'single_choice',
      options: ['Internship', 'New-grad / full-time', 'Either', 'Lateral / experienced'],
      reason: 'Intern vs new-grad changes timeline and interview depth.',
      required: false,
    },
  ];

  const general: FollowUpQuestion[] = [
    {
      id: 'first-build-focus',
      question: `If we pick one proof outcome for ${stage.roleLabel}, what should it be?`,
      type: 'single_choice',
      options: stage.learning.options.slice(0, 5),
      reason: 'Role paths should end in proof that matches this career, not a generic web app.',
      required: true,
    },
    {
      id: 'weak-foundation',
      question: `Which foundation feels weakest for ${stage.roleLabel} right now?`,
      type: 'single_choice',
      options: skillOptions.length
        ? [...skillOptions.slice(0, 4), 'Interviews / communication']
        : ['Core fundamentals', 'Tools', 'Projects', 'Interviews / communication'],
      reason: 'We skip advanced nodes until the weak layer for this path is patched.',
      required: true,
    },
  ];

  return sanitizeQuestions(mode === 'targeted' ? targeted : general, profile, mode);
}

export async function generateFollowUpQuestions(
  profile: RoadmapProfile,
  userId: string,
  mode: RoadmapGenerationMode = profile.targetCompany ? 'targeted' : 'general',
): Promise<FollowUpQuestionsResponse> {
  const brief = hiringBrief(profile.targetCompany, profile.targetRole);
  const stageForPath = generationStageQuestions(mode, profile.targetRole, profile.targetCompany);
  const alreadyCovered = COVERED.filter((c) => c.test(profile)).flatMap((c) => c.phrases);

  const systemInstruction =
    mode === 'targeted'
      ? `You write follow-up questions for a COMPANY-TARGETED hiring roadmap.
Path: ${stageForPath.pathLabel}
Company context: ${JSON.stringify(brief)}
Relevant skills for this path: ${stageForPath.skills.options.join(', ')}
Rules:
- Generate 3-5 questions MAX. Zero is allowed if the profile is enough.
- NEVER ask anything already known: ${alreadyCovered.join(', ') || 'n/a'}.
- NEVER ask target company or target role again.
- NEVER repeat the same idea twice.
- NEVER ask generic web skills (HTML/CSS/React) unless this company's stack or role actually uses them.
- Ask only gaps that change THIS hiring plan: rounds in their loop (${(brief.company?.interviewLoop || []).join(', ') || 'n/a'}), intern vs full-time, stack comfort (${(brief.company?.stacks || []).join(', ') || 'role stack'}), domain depth.
- Do not ask generic career-exploration questions.
Question types: single_choice, multi_choice, text, rating.
Return JSON:
{ "needsMoreInformation": boolean, "questions": [{ "id": "kebab-case", "question": "string", "type": "single_choice|multi_choice|text|rating", "options": ["string"], "reason": "string", "required": boolean }] }`
      : `You write follow-up questions for a ROLE-BASED (not company) learning roadmap.
Path: ${stageForPath.pathLabel}
Relevant skills: ${stageForPath.skills.options.join(', ')}
Learning outcomes: ${stageForPath.learning.options.join(', ')}
Rules:
- Generate 3-5 questions MAX. Zero is allowed if the profile is enough.
- NEVER ask anything already known: ${alreadyCovered.join(', ') || 'n/a'}.
- NEVER ask which company they want. This is not a company path.
- NEVER ask target role again.
- NEVER repeat the same idea twice.
- NEVER ask unrelated skills (no HTML/React for cybersecurity, no Figma for SDE, no PyTorch for frontend unless the student asked).
- Ask only gaps that change THIS role's curriculum: weak foundation from the skill list above, portfolio proof for this role, domain labs.
Question types: single_choice, multi_choice, text, rating.
Return JSON:
{ "needsMoreInformation": boolean, "questions": [{ "id": "kebab-case", "question": "string", "type": "single_choice|multi_choice|text|rating", "options": ["string"], "reason": "string", "required": boolean }] }`;

  const prompt = `Student profile:\n${JSON.stringify(profile, null, 2)}`;

  try {
    const result = await callAIWithFallback<unknown>({
      prompt,
      systemInstruction,
      userId,
      maxTokens: 2048,
      temperature: 0.4,
      reasoningEffort: 'low',
    });
    const parsed = followUpQuestionsResponseSchema.parse(result);
    const questions = sanitizeQuestions(parsed.questions, profile, mode);
    if (!questions.length) {
      const fallback = fallbackQuestions(profile, mode);
      return { needsMoreInformation: fallback.length > 0, questions: fallback };
    }
    return { needsMoreInformation: true, questions };
  } catch {
    const questions = fallbackQuestions(profile, mode);
    return { needsMoreInformation: questions.length > 0, questions };
  }
}

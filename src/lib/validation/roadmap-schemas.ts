import { z } from 'zod';

export const roadmapNodeResourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum(['documentation', 'video', 'course', 'practice', 'article', 'project']),
  channel: z.string().max(120).optional(),
  suggested: z.boolean().optional(),
});

export const mcqQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const codingTestCaseSchema = z.object({
  args: z.array(z.unknown()),
  expected: z.unknown(),
});

export const codingAssessmentSchema = z.object({
  prompt: z.string(),
  starterCode: z.string(),
  functionName: z.string(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().max(800).optional(),
  })).max(5),
  publicTests: z.array(codingTestCaseSchema).min(1).max(10),
  hiddenTests: z.array(codingTestCaseSchema).max(10).optional(),
  title: z.string().max(120).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  statement: z.string().max(6000).optional(),
  constraints: z.array(z.string().max(240)).max(12).optional(),
  hints: z.array(z.string().max(400)).max(6).optional(),
  followUp: z.string().max(400).optional(),
  topics: z.array(z.string().max(80)).max(16).optional(),
  companies: z.array(z.string().max(80)).max(16).optional(),
  editorial: z.string().max(4000).optional(),
});

export const nodeAssessmentSchema = z.object({
  id: z.string().max(120).optional(),
  title: z.string().max(160).optional(),
  type: z.enum(['mcq', 'coding', 'project']),
  passScore: z.number().min(0).max(100),
  timeLimitMinutes: z.number().min(5).max(180),
  mcq: z.object({ questions: z.array(mcqQuestionSchema).min(3).max(10) }).optional(),
  coding: codingAssessmentSchema.optional(),
  project: z.object({
    overview: z.object({
      goal: z.string(),
      stack: z.array(z.string()),
      deliverables: z.array(z.string()),
      estimatedHours: z.number(),
    }),
    steps: z.array(z.object({
      id: z.string(),
      title: z.string(),
      instructions: z.string(),
      acceptance: z.array(z.string()),
      resources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
      requiredEvidence: z.array(z.enum(['repo_url', 'screenshot_url', 'demo_url', 'notes'])).optional(),
    })).min(1),
    rubric: z.array(z.object({
      id: z.string(),
      label: z.string(),
      weight: z.number(),
      check: z.enum([
        'evidence_present',
        'checklist_complete',
        'keyword_notes',
        'manual',
        'github_readme',
        'github_structure',
        'github_commits',
      ]),
      keywords: z.array(z.string()).optional(),
      requiredPaths: z.array(z.string()).optional(),
    })).min(1),
  }).optional(),
}).refine(
  (a) =>
    (a.type === 'mcq' && a.mcq) ||
    (a.type === 'coding' && a.coding) ||
    (a.type === 'project' && a.project),
  { message: 'Assessment must include payload matching type' },
);

export const roadmapNodeSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(['goal', 'milestone', 'phase', 'skill', 'topic', 'project', 'resource', 'checkpoint', 'career']),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  status: z.enum(['locked', 'available', 'in_progress', 'completed', 'skipped']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedHours: z.number().min(0).max(500),
  dependencies: z.array(z.string()),
  skills: z.array(z.string()),
  topics: z.array(z.string()),
  resources: z.array(roadmapNodeResourceSchema).max(10),
  project: z.string().nullable().optional(),
  whyLearn: z.string().max(1000),
  learningOutcomes: z.array(z.string().max(240)).max(8).optional(),
  interviewFocus: z.string().max(500).optional(),
  assessment: nodeAssessmentSchema.optional(),
  assessments: z.array(nodeAssessmentSchema).max(4).optional(),
});

export const roadmapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional()
});

export const roadmapSchema = z.object({
  title: z.string().min(1).max(200),
  targetRole: z.string().min(1).max(200),
  estimatedWeeks: z.number().min(1).max(260),
  nodes: z.array(roadmapNodeSchema).min(5).max(60),
  edges: z.array(roadmapEdgeSchema)
});

export const followUpQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['single_choice', 'multi_choice', 'text', 'rating']),
  options: z.array(z.string()),
  reason: z.string(),
  required: z.boolean()
});

export const followUpQuestionsResponseSchema = z.object({
  needsMoreInformation: z.boolean(),
  questions: z.array(followUpQuestionSchema).max(7)
});

export const roadmapProfileUpdateSchema = z.object({
  currentStudy: z.string().max(200).nullable().optional(),
  yearSemester: z.string().max(50).nullable().optional(),
  academicBackground: z.string().max(500).nullable().optional(),
  enjoyedSubjects: z.array(z.string()).optional(),
  struggledSubjects: z.array(z.string()).optional(),
  careerGoal: z.string().max(200).nullable().optional(),
  targetRole: z.string().max(200).nullable().optional(),
  targetCompany: z.string().max(120).nullable().optional(),
  knownSkills: z.array(
    z.object({
      skill: z.string(),
      confidence: z.enum(['never_used', 'beginner', 'basic', 'intermediate', 'advanced', 'very_confident'])
    })
  ).optional(),
  hasProjects: z.boolean().optional(),
  projects: z.array(
    z.object({
      name: z.string().max(200),
      technologies: z.array(z.string()),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      deployed: z.boolean(),
      solo: z.boolean()
    })
  ).max(10).optional(),
  experienceLevel: z.string().max(100).nullable().optional(),
  wantToLearn: z.array(z.string()).optional(),
  learningMotivation: z.string().max(2000).nullable().optional(),
  weeklyHours: z.string().max(50).nullable().optional(),
  projectVsLearning: z.string().max(50).nullable().optional(),
  learningStyles: z.array(z.string()).optional(),
  targetTimeline: z.string().max(50).nullable().optional(),
  topPriority: z.string().max(200).nullable().optional(),
  aiFollowUpAnswers: z.record(z.string(), z.unknown()).optional(),
  completed: z.boolean().optional()
}).strict();

export const roadmapProgressUpdateSchema = z.object({
  nodeId: z.string().min(1),
  status: z.enum(['available', 'in_progress', 'completed', 'skipped'])
}).strict();

export const assessmentSubmitSchema = z.object({
  nodeId: z.string().min(1),
  assessmentId: z.string().min(1).max(120).optional(),
  type: z.enum(['mcq', 'coding', 'project']),
  answers: z.record(z.string(), z.number().int()).optional(),
  code: z.string().max(50000).optional(),
  language: z.enum(['javascript', 'python', 'java', 'c', 'cpp']).optional(),
  stepsDone: z.array(z.string()).max(40).optional(),
  evidence: z.array(z.object({
    kind: z.enum(['repo_url', 'screenshot_url', 'demo_url', 'notes']),
    url: z.string().url().optional(),
    text: z.string().max(8000).optional(),
    stepId: z.string().optional(),
  })).max(40).optional(),
  repoUrl: z.string().url().optional(),
  reflection: z.string().max(8000).optional(),
  violations: z.array(z.object({
    kind: z.string(),
    at: z.string().optional(),
  })).max(50).optional(),
}).strict().refine(
  (v) =>
    (v.type === 'mcq' && v.answers) ||
    (v.type === 'coding' && typeof v.code === 'string') ||
    (v.type === 'project' && Array.isArray(v.stepsDone)),
  { message: 'Provide answers for MCQ, code for coding, or stepsDone for project' },
);

export type RoadmapNodeResource = z.infer<typeof roadmapNodeResourceSchema>;
export type RoadmapNode = z.infer<typeof roadmapNodeSchema>;
export type RoadmapEdge = z.infer<typeof roadmapEdgeSchema>;
export type Roadmap = z.infer<typeof roadmapSchema>;
export type FollowUpQuestion = z.infer<typeof followUpQuestionSchema>;
export type FollowUpQuestionsResponse = z.infer<typeof followUpQuestionsResponseSchema>;
export type RoadmapProfileUpdate = z.infer<typeof roadmapProfileUpdateSchema>;
export type RoadmapProgressUpdate = z.infer<typeof roadmapProgressUpdateSchema>;
export type AssessmentSubmit = z.infer<typeof assessmentSubmitSchema>;
export type NodeAssessment = z.infer<typeof nodeAssessmentSchema>;

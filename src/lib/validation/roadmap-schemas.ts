import { z } from 'zod';

export const roadmapNodeResourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum(['documentation', 'video', 'course', 'practice', 'article', 'project'])
});

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
  whyLearn: z.string().max(1000)
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

export type RoadmapNodeResource = z.infer<typeof roadmapNodeResourceSchema>;
export type RoadmapNode = z.infer<typeof roadmapNodeSchema>;
export type RoadmapEdge = z.infer<typeof roadmapEdgeSchema>;
export type Roadmap = z.infer<typeof roadmapSchema>;
export type FollowUpQuestion = z.infer<typeof followUpQuestionSchema>;
export type FollowUpQuestionsResponse = z.infer<typeof followUpQuestionsResponseSchema>;
export type RoadmapProfileUpdate = z.infer<typeof roadmapProfileUpdateSchema>;
export type RoadmapProgressUpdate = z.infer<typeof roadmapProgressUpdateSchema>;

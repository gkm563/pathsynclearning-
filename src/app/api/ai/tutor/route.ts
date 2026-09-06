import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { callAIWithFallback } from "@/lib/ai/llm";
import { resolveTutorLesson } from "@/lib/ai/tutor-lesson";
import { TUTOR_SYSTEM_INSTRUCTION, buildTutorPrompt } from "@/lib/ai/tutor-prompt";
import {
  classifyTutorMessage,
  lessonLexicon,
  localTutorReply,
  parseInScope,
  scopeRefusal,
} from "@/lib/ai/tutor-scope";
import { requireDbUser } from "@/lib/db/users";
import { tutorChatSchema } from "@/lib/validation/schemas";
import type { RoadmapNode } from "@/types/roadmap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TutorJson = { reply?: unknown; in_scope?: unknown };

function unescapeReply(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function asReply(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return unescapeReply(raw);
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as TutorJson & Record<string, unknown>;
  const reply = rec.reply ?? rec.text ?? rec.message;
  if (typeof reply === "string" && reply.trim()) return unescapeReply(reply);
  return null;
}

function nodeFromBody(body: { node: { id: string; title: string; type?: string; description?: string; whyLearn?: string; interviewFocus?: string; skills?: string[]; topics?: string[]; learningOutcomes?: string[] } }): RoadmapNode {
  return {
    id: body.node.id,
    title: body.node.title,
    type: (body.node.type as RoadmapNode["type"]) || "topic",
    description: body.node.description || "",
    status: "available",
    priority: "medium",
    estimatedHours: 0,
    dependencies: [],
    skills: body.node.skills || [],
    topics: body.node.topics || [],
    resources: [],
    project: null,
    whyLearn: body.node.whyLearn || "",
    interviewFocus: body.node.interviewFocus,
    learningOutcomes: body.node.learningOutcomes,
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, tutorChatSchema);

    let lesson;
    try {
      lesson = await resolveTutorLesson(user.id, body.node.id, body.video);
    } catch {
      const node = nodeFromBody(body);
      lesson = {
        roadmapTitle: "Your roadmap",
        targetRole: null,
        node,
        relatedTitles: [],
        roadmapNodeTitles: [],
        video: body.video?.title ? { title: body.video.title, channel: body.video.channel } : undefined,
      };
    }

    const title = lesson.node.title;
    const lexicon = lessonLexicon(lesson.node);
    const verdict = classifyTutorMessage(body.message, lexicon);

    if (!verdict.ok) {
      return jsonResponse({
        reply: scopeRefusal(title, verdict.reason),
        refused: true,
        reason: verdict.reason,
      });
    }

    const prompt = buildTutorPrompt(lesson, body.message, body.history || []);

    try {
      const raw = await callAIWithFallback<TutorJson>({
        prompt,
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        userId: user.id,
        groqModel: "openai/gpt-oss-120b",
        geminiSchema: {
          type: "object",
          properties: {
            in_scope: { type: "boolean" },
            reply: { type: "string" },
          },
          required: ["in_scope", "reply"],
        },
        maxTokens: 700,
        timeoutMs: 25000,
        temperature: 0.3,
        reasoningEffort: "low",
      });

      const inScope = parseInScope(raw);
      if (inScope === false) {
        return jsonResponse({
          reply: scopeRefusal(title, "off_topic"),
          refused: true,
          reason: "off_topic",
        });
      }

      const reply = asReply(raw);
      if (reply) {
        return jsonResponse({ reply });
      }
    } catch {
      // fall through to local tutor
    }

    return jsonResponse({
      reply: localTutorReply(body.message, title, lesson.node.description),
      fallback: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

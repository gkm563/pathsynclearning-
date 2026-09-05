import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { callAIWithFallback } from "@/lib/ai/llm";
import { requireDbUser } from "@/lib/db/users";
import { tutorChatSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TutorJson = { reply?: unknown };

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

function localReply(message: string, title: string, description?: string): string {
  const q = message.toLowerCase();
  const about = description?.trim()
    ? description.trim().slice(0, 420)
    : `${title} is a core topic on your PathED roadmap.`;

  if (q.includes("quiz") || q.includes("question") || q.includes("test me")) {
    return [
      `Quick check on **${title}**:`,
      `1. Explain the idea in one sentence, as if teaching a junior.`,
      `2. Name one mistake people make when applying this in interviews or code.`,
      `3. Give a tiny example that proves you understand it.`,
      `==Reply with your answers and I will grade them.==`,
    ].join("\n");
  }

  if (q.includes("interview")) {
    return [
      `Interview angle for **${title}**:`,
      `Expect a **definition**, a **trade-off**, and a “when would you use this?” follow-up.`,
      `==Practice out loud: what it is, why it matters, and one concrete example.==`,
      about,
    ].join("\n\n");
  }

  if (q.includes("summar") || q.includes("takeaway")) {
    return [
      `Study takeaways for **${title}**:`,
      about,
      `==Write 3 bullets: definition, one worked example, one interview question.==`,
    ].join("\n\n");
  }

  return [
    `You are in the study room for **${title}**.`,
    about,
    `I can ==explain it simply==, quiz you, or prep interview questions. What do you want to tackle first?`,
  ].join("\n\n");
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, tutorChatSchema);

    const ctxLines = [
      `Node: ${body.node.title} (${body.node.type || "topic"})`,
      body.node.description ? `About: ${body.node.description}` : "",
      body.node.whyLearn ? `Why learn: ${body.node.whyLearn}` : "",
      body.node.interviewFocus ? `Interview focus: ${body.node.interviewFocus}` : "",
      body.node.skills?.length ? `Skills: ${body.node.skills.join(", ")}` : "",
      body.node.topics?.length ? `Topics: ${body.node.topics.join(", ")}` : "",
      body.node.learningOutcomes?.length
        ? `Outcomes: ${body.node.learningOutcomes.join("; ")}`
        : "",
      body.video?.title
        ? `Current video: ${body.video.title}${body.video.channel ? ` (${body.video.channel})` : ""}`
        : "",
    ].filter(Boolean);

    const historyBlock = (body.history || [])
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n");

    const prompt = [
      "Study-room context:",
      ctxLines.join("\n"),
      historyBlock ? `\nRecent chat:\n${historyBlock}` : "",
      `\nStudent: ${body.message}`,
      '\nReturn JSON only: {"reply":"..."} . Be helpful and concrete, at most ~180 words. Put a blank line between paragraphs. Put each numbered step on its own line. Use **bold** for key terms and ==highlight== for the one phrase to remember. No heading hashes and no markdown fences.',
    ].join("\n");

    try {
      const raw = await callAIWithFallback<TutorJson>({
        prompt,
        systemInstruction:
          "You are PathED AI Tutor, a calm study companion inside a student's roadmap study room. Teach the current node. Do not invent secret exam answers or hidden test cases. Prefer Socratic hints before dumping full solutions. Stay on the topic of the node and video. Write short readable paragraphs separated by blank lines. Format with **bold** for terms and ==highlight== for the core takeaway.",
        userId: user.id,
        groqModel: "openai/gpt-oss-120b",
        geminiSchema: {
          type: "object",
          properties: { reply: { type: "string" } },
          required: ["reply"],
        },
        maxTokens: 700,
        timeoutMs: 25000,
        temperature: 0.5,
        reasoningEffort: "low",
      });

      const reply = asReply(raw);
      if (reply) {
        return jsonResponse({ reply });
      }
    } catch {
      // fall through to local tutor
    }

    return jsonResponse({
      reply: localReply(body.message, body.node.title, body.node.description),
      fallback: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

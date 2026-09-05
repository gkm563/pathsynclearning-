import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { callAIWithFallback } from "@/lib/ai/llm";
import { requireDbUser } from "@/lib/db/users";
import { noteEnhanceSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type EnhanceJson = { title?: unknown; content?: unknown };

function asText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!t) return null;
  return t.slice(0, max);
}

function localEnhance(title: string, content: string): { title: string; content: string } {
  const lines = content
    .split(/\n+/)
    .map((l) => l.replace(/^[-*•]\s+/, "").trim())
    .filter(Boolean);
  const unique = [...new Set(lines)];
  const bullets = unique.slice(0, 12).map((l, i) => `${i + 1}. ${l.replace(/\s+/g, " ")}`);
  const cleanTitle =
    title.trim() ||
    unique[0]?.replace(/\s+/g, " ").slice(0, 80) ||
    "Study notes";
  return {
    title: cleanTitle.slice(0, 200),
    content: [
      bullets.join("\n"),
      "",
      "Key takeaway: review these points once more before the assessment.",
    ]
      .join("\n")
      .slice(0, 12000),
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, noteEnhanceSchema);

    const prompt = [
      "Rewrite the student's rough notes into a clearer study note.",
      body.contextLabel ? `Context: ${body.contextLabel}` : "",
      body.sourceType ? `Source: ${body.sourceType}` : "",
      `Current title: ${body.title || "(none)"}`,
      "Current notes:",
      body.content,
      "",
      'Return JSON only: {"title":"...","content":"..."}.',
      "Keep the student's meaning. Do not invent facts they did not write.",
      "Use a short title (max 80 chars). Structure content with short paragraphs and numbered takeaways.",
      "Separate paragraphs with a blank line. Put each numbered point on its own line.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const raw = await callAIWithFallback<EnhanceJson>({
        prompt,
        systemInstruction:
          "You are PathED Notes Enhancer. You clean up a student's own notes for later review. Preserve their ideas, fix clarity, and add light structure. Never add secrets, exam answers, or topics they did not mention.",
        userId: user.id,
        groqModel: "openai/gpt-oss-120b",
        geminiSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
          },
          required: ["title", "content"],
        },
        maxTokens: 900,
        timeoutMs: 25000,
        temperature: 0.35,
        reasoningEffort: "low",
      });

      const title = asText(raw?.title, 200);
      const content = asText(raw?.content, 12000);
      if (title && content) {
        return jsonResponse({ title, content });
      }
    } catch {
      // local cleanup
    }

    return jsonResponse({
      ...localEnhance(body.title || "", body.content),
      fallback: true,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

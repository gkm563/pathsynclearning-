import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { callAIWithFallback } from "@/lib/ai/llm";
import { requireDbUser } from "@/lib/db/users";
import { noteEnhanceSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type NoteCorrection = {
  wrong: string;
  correct: string;
  explain: string;
};

type EnhanceJson = {
  title?: unknown;
  content?: unknown;
  corrections?: unknown;
};

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

function parseCorrections(raw: unknown): NoteCorrection[] {
  if (!Array.isArray(raw)) return [];
  const out: NoteCorrection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const wrong = asText(rec.wrong ?? rec.mistake ?? rec.original, 400);
    const correct = asText(rec.correct ?? rec.fixed ?? rec.instead, 400);
    const explain = asText(rec.explain ?? rec.explanation ?? rec.why, 800);
    if (!wrong || !correct || !explain) continue;
    out.push({ wrong, correct, explain });
    if (out.length >= 8) break;
  }
  return out;
}

function appendCorrections(content: string, corrections: NoteCorrection[]): string {
  if (!corrections.length) return content;
  const block = [
    "What was wrong",
    ...corrections.map(
      (c, i) =>
        `${i + 1}. You wrote: ${c.wrong}\n   Correct: ${c.correct}\n   Why: ${c.explain}`,
    ),
  ].join("\n\n");
  return `${content.trim()}\n\n${block}`.slice(0, 12000);
}

function localEnhance(title: string, content: string): {
  title: string;
  content: string;
  corrections: NoteCorrection[];
} {
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
    corrections: [],
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, noteEnhanceSchema);

    const prompt = [
      "Enhance the student's rough notes.",
      body.contextLabel ? `Lesson context: ${body.contextLabel}` : "",
      body.sourceType ? `Source: ${body.sourceType}` : "",
      `Current title: ${body.title || "(none)"}`,
      "Current notes:",
      body.content,
      "",
      "Tasks:",
      "1. Rewrite a clear study note in content (short paragraphs, numbered takeaways, blank lines between paragraphs).",
      "2. Fact-check against well-known CS / engineering knowledge for this lesson.",
      "3. If the student wrote something incorrect, fix it in content AND list each mistake in corrections.",
      "4. If nothing is factually wrong, corrections must be [].",
      "5. Do not invent extra topics they did not mention, except to correct an error.",
      "6. In content, use **bold** for key terms and ==highlight== for the one phrase to remember (same as PathED tutor chat). Also bold/highlight the Correct line in corrections when useful.",
      "",
      'Return JSON only: {"title":"...","content":"...","corrections":[{"wrong":"...","correct":"...","explain":"..."}]}',
      "title max 80 chars. Each wrong/correct/explain must be plain sentences. explain should be 1-3 sentences.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const raw = await callAIWithFallback<EnhanceJson>({
        prompt,
        systemInstruction:
          "You are PathED Notes Enhancer, a careful tutor. Clean up notes, correct factual or conceptual mistakes, and teach why. Be kind and specific. Format like PathED chat: **bold** key terms and ==highlight== the core takeaway. Never invent exam answers. If unsure a claim is wrong, leave it and do not invent a correction.",
        userId: user.id,
        groqModel: "llama-3.3-70b-versatile",
        geminiSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            corrections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  wrong: { type: "string" },
                  correct: { type: "string" },
                  explain: { type: "string" },
                },
                required: ["wrong", "correct", "explain"],
              },
            },
          },
          required: ["title", "content", "corrections"],
        },
        maxTokens: 1400,
        timeoutMs: 30000,
        temperature: 0.3,
        reasoningEffort: "low",
      });

      const title = asText(raw?.title, 200);
      const content = asText(raw?.content, 10000);
      const corrections = parseCorrections(raw?.corrections);
      if (title && content) {
        return jsonResponse({
          title,
          content: appendCorrections(content, corrections),
          corrections,
        });
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

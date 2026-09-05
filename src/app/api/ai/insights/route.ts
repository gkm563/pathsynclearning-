import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { errorResponse } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";

export type AiInsight = {
  /** Lucide-style icon key — never emoji */
  icon: "target" | "zap" | "rocket" | "book" | "code" | "shield";
  text: string;
};

const FALLBACK: AiInsight[] = [
  {
    icon: "target",
    text: "Solve two graph or tree problems today to strengthen DSA fundamentals.",
  },
  {
    icon: "book",
    text: "Review indexing and B-trees before your next DBMS assessment.",
  },
  {
    icon: "code",
    text: "Ship a small component or API endpoint to raise your CRI this week.",
  },
];

const ICON_KEYS = new Set<AiInsight["icon"]>([
  "target",
  "zap",
  "rocket",
  "book",
  "code",
  "shield",
]);

function normalizeInsights(raw: unknown): AiInsight[] | null {
  if (!Array.isArray(raw)) return null;
  const out: AiInsight[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const text = String((item as { text?: unknown }).text || "").trim();
    if (!text) continue;
    const iconRaw = String((item as { icon?: unknown }).icon || "target")
      .toLowerCase()
      .replace(/[^a-z]/g, "") as AiInsight["icon"];
    out.push({
      icon: ICON_KEYS.has(iconRaw) ? iconRaw : "target",
      text: text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim(),
    });
    if (out.length >= 3) break;
  }
  return out.length >= 3 ? out : null;
}

export async function POST() {
  try {
    await requireDbUser();

    const apiKey = env.geminiApiKey;
    if (!apiKey) {
      return NextResponse.json({ insights: FALLBACK });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Provide 3 short, actionable career reminders for a Software Engineering student targeting SDE roles. Return ONLY a JSON array of objects with keys icon and text. icon must be one of: target, zap, rocket, book, code, shield. No emojis.`,
                  },
                ],
              },
            ],
          }),
        },
      );
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text as
        | string
        | undefined;
      if (rawText) {
        const parsed = JSON.parse(
          rawText.replace(/```json|```/g, "").trim(),
        ) as unknown;
        const normalized = normalizeInsights(parsed);
        if (normalized) {
          return NextResponse.json({ insights: normalized });
        }
      }
    } catch {
      // fall through
    }

    return NextResponse.json({ insights: FALLBACK });
  } catch (e) {
    return errorResponse(e);
  }
}

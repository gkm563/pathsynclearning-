import { NextResponse } from "next/server";
import quotesData from "@/data/quotes_dataset.json";
import type { Quote } from "@/types";
import { getDb } from "@/lib/db/client";

const FALLBACK: Quote = {
  text: "The secret of getting ahead is getting started.",
  author: "Mark Twain",
  phase: "motivation",
};

function pickByDay(quotes: Quote[], phase: string): Quote {
  const phaseQuotes = quotes.filter((q) => q.phase === phase);
  const pool = phaseQuotes.length ? phaseQuotes : quotes;
  if (!pool.length) return { ...FALLBACK, phase };
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return pool[dayOfYear % pool.length] || FALLBACK;
}

export async function POST(request: Request) {
  let phase = "motivation";
  try {
    const body = (await request.json()) as { phase?: string };
    if (body.phase) phase = body.phase;
  } catch {
    // ignore
  }

  // Prefer Neon-backed quotes for production consistency
  try {
    const db = getDb();
    const rows = await db`
      SELECT text, author, phase FROM quotes
      WHERE phase = ${phase}
      ORDER BY created_at ASC
    `;
    if (rows.length) {
      const mapped = rows.map((r) => ({
        text: String(r.text),
        author: String(r.author || "Unknown"),
        phase: String(r.phase || phase),
      }));
      return NextResponse.json({ quote: pickByDay(mapped, phase) });
    }
  } catch {
    // fall through
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
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
                    text: `Generate a single short inspirational coding quote for a software engineering student in the ${phase} phase. Return JSON: {"text": "quote text", "author": "Author Name"}`,
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
        ) as Quote;
        if (parsed.text && parsed.author) {
          return NextResponse.json({
            quote: { ...parsed, phase },
          });
        }
      }
    } catch {
      // fall through to local dataset
    }
  }

  return NextResponse.json({
    quote: pickByDay(quotesData as Quote[], phase),
  });
}

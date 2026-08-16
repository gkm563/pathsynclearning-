import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import quotesData from "@/data/quotes_dataset.json";
import type { Quote } from "@/types";
import { AppError } from "@/lib/api/errors";
import { parseJson, errorResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { quotes } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { quoteRequestSchema } from "@/lib/validation/schemas";

const FALLBACK: Quote = {
  text: "The secret of getting ahead is getting started.",
  author: "Mark Twain",
  phase: "motivation",
};

function pickByDay(list: Quote[], phase: string): Quote {
  const phaseQuotes = list.filter((q) => q.phase === phase);
  const pool = phaseQuotes.length ? phaseQuotes : list;
  if (!pool.length) return { ...FALLBACK, phase };
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return pool[dayOfYear % pool.length] || FALLBACK;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw AppError.unauthorized();

    const { phase } = await parseJson(request, quoteRequestSchema);

    try {
      const db = getDb();
      const rows = await db
        .select({
          text: quotes.text,
          author: quotes.author,
          phase: quotes.phase,
        })
        .from(quotes)
        .where(eq(quotes.phase, phase))
        .orderBy(asc(quotes.createdAt));

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

    const apiKey = env.geminiApiKey;
    if (apiKey) {
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
  } catch (e) {
    return errorResponse(e);
  }
}

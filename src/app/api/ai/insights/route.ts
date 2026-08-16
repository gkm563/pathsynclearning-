import { NextResponse } from "next/server";

interface AiInsight {
  icon: string;
  text: string;
}

const FALLBACK: AiInsight[] = [
  {
    icon: "🎯",
    text: "Solve 2 BST & Graph problems today to boost DSA competency to 75%.",
  },
  {
    icon: "⚡",
    text: "Review Indexing & B-Trees in DBMS before your upcoming mock assessment.",
  },
  {
    icon: "🚀",
    text: "Push your responsive card component to GitHub to raise your CRI score by +3%.",
  },
];

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
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
                  text: `Provide 3 short, actionable, bulleted career reminders for a Software Engineering student targeting SDE roles at Tier 1 companies. Return JSON array of objects: [{"icon": "🎯", "text": "reminder text"}]`,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text as
      | string
      | undefined;
    if (rawText) {
      const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim()) as AiInsight[];
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return NextResponse.json({ insights: parsed.slice(0, 3) });
      }
    }
  } catch {
    // fall through
  }

  return NextResponse.json({ insights: FALLBACK });
}

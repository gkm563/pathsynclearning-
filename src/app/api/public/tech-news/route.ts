import { fetchAllProviders } from "@/lib/news/providers";
import { jsonResponse } from "@/lib/api/http";

export async function GET() {
  try {
    const { articles } = await fetchAllProviders();
    const topArticles = articles.slice(0, 3).map((a) => ({
      headline: a.title,
      tag: a.category ? `${a.category.toUpperCase()}` : "TECH",
      tone: a.category === "ai" ? "success" : a.category === "webdev" ? "primary" : "info",
      time: new Date(a.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " live",
      url: a.canonicalUrl,
    }));
    return jsonResponse({ articles: topArticles });
  } catch (error) {
    return jsonResponse({
      articles: [
        {
          headline: "OpenAI & Anthropic launch next-gen AI developer models",
          tag: "AI & ML",
          tone: "success",
          time: "Just now",
          url: "https://dev.to",
        },
        {
          headline: "Next.js & React 19 introduce server-first component architecture",
          tag: "WEB DEV",
          tone: "primary",
          time: "10m ago",
          url: "https://dev.to",
        },
        {
          headline: "Cloud & DevOps hiring surges for multi-cloud infrastructure",
          tag: "DEVOPS",
          tone: "info",
          time: "30m ago",
          url: "https://dev.to",
        },
      ],
    });
  }
}

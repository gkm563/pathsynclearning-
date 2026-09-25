import "server-only";

/**
 * Server env accessors. Never import this from Client Components.
 * Required vars throw when missing so misconfiguration fails loudly.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get clerkPublishableKey() {
    return optional("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  },
  get clerkSecretKey() {
    return optional("CLERK_SECRET_KEY");
  },
  get geminiApiKey() {
    const key = optional("GEMINI_API_KEY");
    if (!key || key === "YOUR_GEMINI_API_KEY") return undefined;
    return key;
  },
  get groqApiKey() {
    const key = optional("GROQ_API_KEY");
    if (!key || key === "YOUR_GROQ_API_KEY") return undefined;
    return key;
  },
  get ollamaApiKey() {
    return optional("OLLAMA_API_KEY");
  },
  get ollamaInterviewApiKey() {
    return optional("OLLAMA_INTERVIEW_API_KEY") || optional("OLLAMA_API_KEY");
  },
  get ollamaRoadmapApiKey() {
    return (
      optional("OLLAMA_ROADMAP_API_KEY") ||
      optional("OLLAMA_API_KEY_2") ||
      optional("OLLAMA_API_KEY")
    );
  },
  get ollamaBaseUrl() {
    return optional("OLLAMA_BASE_URL") || "https://ollama.com/v1";
  },
  get ollamaInterviewModel() {
    return optional("OLLAMA_INTERVIEW_MODEL") || "llama-3.3-70b-versatile";
  },
  get ollamaRoadmapModel() {
    return optional("OLLAMA_ROADMAP_MODEL") || optional("OLLAMA_INTERVIEW_MODEL") || "llama-3.3-70b-versatile";
  },
  get livekitUrl() {
    return optional("LIVEKIT_URL");
  },
  get livekitApiKey() {
    return optional("LIVEKIT_API_KEY");
  },
  get livekitApiSecret() {
    return optional("LIVEKIT_API_SECRET");
  },
  get livekitAgentName() {
    return optional("LIVEKIT_AGENT_NAME") || "pathed-interviewer";
  },
  get interviewAgentSecret() {
    return optional("INTERVIEW_AGENT_SECRET");
  },
  get newsApiKey() {
    const key = optional("NEWS_API_KEY");
    if (!key || key === "YOUR_NEWS_API_KEY") return undefined;
    return key;
  },
  get newsCacheTtlMinutes() {
    return optional("NEWS_CACHE_TTL_MINUTES");
  },
  get youtubeApiKey() {
    const key = optional("YOUTUBE_API_KEY");
    if (!key || key === "YOUR_YOUTUBE_API_KEY") return undefined;
    return key;
  },
  get youtubeCacheTtlDays() {
    const raw = optional("YOUTUBE_CACHE_TTL_DAYS");
    const n = raw ? Number(raw) : 30;
    return Number.isFinite(n) && n > 0 ? n : 30;
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};

export function getEnvStatus() {
  return {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
    GEMINI_API_KEY: Boolean(env.geminiApiKey),
    GROQ_API_KEY: Boolean(env.groqApiKey),
    OLLAMA_API_KEY: Boolean(env.ollamaApiKey),
    OLLAMA_INTERVIEW_API_KEY: Boolean(env.ollamaInterviewApiKey),
    OLLAMA_ROADMAP_API_KEY: Boolean(env.ollamaRoadmapApiKey),
    LIVEKIT: Boolean(env.livekitUrl && env.livekitApiKey && env.livekitApiSecret),
    NEWS_API_KEY: Boolean(env.newsApiKey),
    YOUTUBE_API_KEY: Boolean(env.youtubeApiKey),
  };
}

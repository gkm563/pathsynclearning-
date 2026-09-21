import "server-only";
import { env } from "@/lib/env";
import { AppError } from "@/lib/api/errors";

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content?: unknown;
  reasoning?: unknown;
  thinking?: unknown;
};

type OllamaChatResponse = {
  choices?: Array<{
    message?: OllamaChatMessage;
  }>;
  message?: OllamaChatMessage;
  error?: { message?: string } | string;
};

function cleanMarkdown(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "");
    if (cleaned.endsWith("```")) cleaned = cleaned.replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\w*\s*/, "");
    if (cleaned.endsWith("```")) cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}

function extractJsonObject(text: string): string {
  const cleaned = cleanMarkdown(text);
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) return cleaned;
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) return cleaned;
  const objStart = cleaned.indexOf("{");
  const objEnd = cleaned.lastIndexOf("}");
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");
  if (objStart >= 0 && objEnd > objStart) {
    if (arrStart >= 0 && arrStart < objStart && arrEnd > arrStart) {
      return cleaned.slice(arrStart, arrEnd + 1);
    }
    return cleaned.slice(objStart, objEnd + 1);
  }
  if (arrStart >= 0 && arrEnd > arrStart) return cleaned.slice(arrStart, arrEnd + 1);
  return cleaned;
}

export type OllamaPurpose = "interview" | "roadmap";

export async function callOllamaJson<T>(options: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  /** Omit or pass null for no completion cap. */
  maxTokens?: number | null;
  timeoutMs?: number;
  temperature?: number;
  label?: string;
  purpose?: OllamaPurpose;
}): Promise<T> {
  const purpose = options.purpose ?? "roadmap";
  const apiKey =
    purpose === "interview" ? env.ollamaInterviewApiKey : env.ollamaRoadmapApiKey;
  const label = options.label || "Ollama";
  if (!apiKey) {
    const names =
      purpose === "interview"
        ? "OLLAMA_INTERVIEW_API_KEY or OLLAMA_API_KEY"
        : "OLLAMA_ROADMAP_API_KEY or OLLAMA_API_KEY";
    throw new AppError(
      "INTERNAL",
      `${names} is not configured. ${purpose === "interview" ? "AI interview" : "Roadmap generation"} uses Ollama Cloud.`,
    );
  }

  const baseUrl = env.ollamaBaseUrl.replace(/\/$/, "");
  const fallbackBaseUrl =
    baseUrl.includes("api.ollama.com") ? "https://ollama.com/v1" : "";
  const model = options.model || env.ollamaRoadmapModel;
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  messages.push({ role: "user", content: options.prompt });

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 180000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const payload: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    stream: false,
  };
  if (typeof options.maxTokens === "number" && options.maxTokens > 0) {
    payload.max_tokens = options.maxTokens;
  }

  try {
    const postChat = (url: string, body: unknown) =>
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

    let endpoint = `${baseUrl}/chat/completions`;
    let res = await postChat(endpoint, { ...payload, response_format: { type: "json_object" } });

    if (res.status === 405 && fallbackBaseUrl) {
      endpoint = `${fallbackBaseUrl}/chat/completions`;
      res = await postChat(endpoint, { ...payload, response_format: { type: "json_object" } });
    }

    if (res.status === 400) {
      res = await postChat(endpoint, payload);
    }

    const rawText = await res.text();
    if (!res.ok) {
      throw new AppError("INTERNAL", `${label} failed (${res.status}).`);
    }

    let parsed: OllamaChatResponse;
    try {
      parsed = JSON.parse(rawText) as OllamaChatResponse;
    } catch {
      throw new AppError("INTERNAL", `${label} returned invalid JSON.`);
    }

    const message = parsed.choices?.[0]?.message || parsed.message;
    const content =
      asText(message?.content) ||
      asText(message?.reasoning) ||
      asText(message?.thinking);
    if (!content.trim()) {
      throw new AppError("INTERNAL", `Empty response from ${label}.`);
    }

    return JSON.parse(extractJsonObject(content)) as T;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("INTERNAL", `${label} timed out after ${timeoutMs}ms`);
    }
    throw new AppError(
      "INTERNAL",
      `${label} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

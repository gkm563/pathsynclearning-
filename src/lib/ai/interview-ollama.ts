import "server-only";
import { env } from "@/lib/env";
import { AppError } from "@/lib/api/errors";

type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content?: unknown;
  reasoning?: unknown;
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
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1);
  return cleaned;
}

export async function callInterviewOllama<T>(options: {
  prompt: string;
  systemInstruction?: string;
  maxTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}): Promise<T> {
  const apiKey = env.ollamaApiKey;
  if (!apiKey) {
    throw new AppError(
      "INTERNAL",
      "OLLAMA_API_KEY is not configured. AI interview uses Ollama Cloud only.",
    );
  }

  const baseUrl = env.ollamaBaseUrl.replace(/\/$/, "");
  const fallbackBaseUrl =
    baseUrl.includes("api.ollama.com") ? "https://ollama.com/v1" : "";
  const model = env.ollamaInterviewModel;
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  messages.push({ role: "user", content: options.prompt });

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 45000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 700,
    stream: false,
  };

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
      throw new AppError(
        "INTERNAL",
        `Ollama interview model failed (${res.status}).`,
      );
    }

    let parsed: OllamaChatResponse;
    try {
      parsed = JSON.parse(rawText) as OllamaChatResponse;
    } catch {
      throw new AppError("INTERNAL", "Ollama interview model returned invalid JSON.");
    }

    const message = parsed.choices?.[0]?.message || parsed.message;
    const content =
      asText(message?.content) || asText(message?.reasoning) || asText((message as { thinking?: unknown } | undefined)?.thinking);
    if (!content.trim()) {
      throw new AppError("INTERNAL", "Empty response from Ollama interview model.");
    }

    return JSON.parse(extractJsonObject(content)) as T;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("INTERNAL", `Ollama interview request timed out after ${timeoutMs}ms`);
    }
    throw new AppError(
      "INTERNAL",
      `Ollama interview model failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

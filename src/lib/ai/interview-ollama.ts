import "server-only";
import { env } from "@/lib/env";
import { callOllamaJson } from "./ollama";

export async function callInterviewOllama<T>(options: {
  prompt: string;
  systemInstruction?: string;
  maxTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}): Promise<T> {
  return callOllamaJson<T>({
    prompt: options.prompt,
    systemInstruction: options.systemInstruction,
    model: env.ollamaInterviewModel,
    maxTokens: options.maxTokens ?? 700,
    timeoutMs: options.timeoutMs ?? 45000,
    temperature: options.temperature ?? 0.7,
    label: "Ollama interview model",
    purpose: "interview",
  });
}

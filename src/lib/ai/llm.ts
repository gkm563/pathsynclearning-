import "server-only";
import { env } from '@/lib/env';
import { callGroq } from './groq';
import { AppError } from '@/lib/api/errors';

export type LLMPrimary = 'groq';

export interface LLMOptions {
  prompt: string;
  systemInstruction?: string;
  userId: string;
  groqModel?: string;
  geminiSchema?: object;
  maxTokens?: number;
  timeoutMs?: number;
  temperature?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  primary?: LLMPrimary;
}

/**
 * Groq (`openai/gpt-oss-120b`) for tutor, copilot, and notes.
 * Roadmap generation uses Ollama Cloud separately.
 */
export async function callAIWithFallback<T>(options: LLMOptions): Promise<T> {
  const {
    prompt,
    systemInstruction,
    userId,
    groqModel = 'openai/gpt-oss-120b',
    maxTokens = 4096,
    timeoutMs = 90000,
    temperature = 1,
    reasoningEffort = 'medium',
  } = options;

  if (!env.groqApiKey) {
    throw new AppError(
      'INTERNAL',
      'GROQ_API_KEY is not configured for tutor, copilot, and notes.',
    );
  }

  try {
    const result = await callGroq<T>({
      prompt,
      systemInstruction,
      userId,
      model: groqModel,
      temperature,
      maxCompletionTokens: maxTokens,
      topP: 1,
      reasoningEffort,
      stream: true,
      timeoutMs,
    });
    console.info(`[AI] Groq (${groqModel}) succeeded`);
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'INTERNAL',
      `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

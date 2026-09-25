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

export async function callAIWithFallback<T>(options: LLMOptions): Promise<T> {
  const {
    prompt,
    systemInstruction,
    userId,
    groqModel = 'llama-3.3-70b-versatile',
    maxTokens = 4096,
    timeoutMs = 45000,
    temperature = 0.7,
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
      stream: false,
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

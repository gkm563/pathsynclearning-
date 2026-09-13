import "server-only";
import { env } from '@/lib/env';
import { callGroq } from './groq';
import { callGemini } from './gemini';
import { AppError } from '@/lib/api/errors';

export type LLMPrimary = 'groq' | 'gemini';

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
  /** Tried first when configured. Default Groq; AI Studio (Gemini) is the fallback. */
  primary?: LLMPrimary;
}

/**
 * Groq (`openai/gpt-oss-120b`) is the primary engine.
 * Google AI Studio (Gemini) is used only if Groq fails or has no API key.
 */
export async function callAIWithFallback<T>(options: LLMOptions): Promise<T> {
  const {
    prompt,
    systemInstruction,
    userId,
    groqModel = 'openai/gpt-oss-120b',
    geminiSchema,
    maxTokens = 4096,
    timeoutMs = 90000,
    temperature = 1,
    reasoningEffort = 'medium',
    primary = 'groq',
  } = options;

  const tryGroq = async (): Promise<T> => {
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
  };

  const tryGemini = async (): Promise<T> => {
    const result = await callGemini<T>({
      prompt,
      systemInstruction,
      userId,
      schema: geminiSchema,
      timeoutMs,
      maxOutputTokens: maxTokens,
    });
    console.info('[AI] AI Studio (Gemini) succeeded');
    return result;
  };

  const groqConfigured = Boolean(env.groqApiKey);
  const geminiConfigured = Boolean(env.geminiApiKey);

  const order: LLMPrimary[] =
    primary === 'gemini' ? ['gemini', 'groq'] : ['groq', 'gemini'];

  let lastError: unknown;

  for (const provider of order) {
    if (provider === 'groq') {
      if (!groqConfigured) {
        if (order[0] === 'groq') {
          console.info('[AI] GROQ_API_KEY not configured, using AI Studio (Gemini) as fallback.');
        }
        continue;
      }
      try {
        return await tryGroq();
      } catch (groqError) {
        lastError = groqError;
        console.warn(
          `[AI] Groq (${groqModel}) failed, falling back to AI Studio (Gemini):`,
          groqError instanceof Error ? groqError.message : groqError
        );
      }
      continue;
    }

    if (!geminiConfigured) {
      if (order[0] === 'gemini') {
        console.info('[AI] GEMINI_API_KEY not configured, using Groq as fallback.');
      }
      continue;
    }
    try {
      return await tryGemini();
    } catch (geminiError) {
      lastError = geminiError;
      console.error(
        '[AI] AI Studio (Gemini) failed:',
        geminiError instanceof Error ? geminiError.message : geminiError
      );
      if (geminiError instanceof AppError && order[order.length - 1] === 'gemini') {
        throw geminiError;
      }
    }
  }

  if (!groqConfigured && !geminiConfigured) {
    throw new AppError(
      'INTERNAL',
      'No AI service configured. Please provide GROQ_API_KEY or GEMINI_API_KEY in environment.'
    );
  }

  if (lastError instanceof AppError) throw lastError;
  throw new AppError(
    'INTERNAL',
    `AI generation failed: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`
  );
}

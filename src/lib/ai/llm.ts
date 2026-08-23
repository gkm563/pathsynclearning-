import { env } from '@/lib/env';
import { callGroq } from './groq';
import { callGemini } from './gemini';
import { AppError } from '@/lib/api/errors';

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
}

/**
 * Executes AI generation with Groq (`openai/gpt-oss-120b`) as the primary engine
 * and seamlessly falls back to Gemini models if Groq fails or is not configured.
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
  } = options;

  // 1. Try Groq (openai/gpt-oss-120b) if API key is present
  if (env.groqApiKey) {
    try {
      return await callGroq<T>({
        prompt,
        systemInstruction,
        userId,
        model: groqModel,
        temperature,
        maxCompletionTokens: maxTokens,
        topP: 1,
        reasoningEffort,
        stream: true,
        timeoutMs: Math.min(timeoutMs, 60000),
      });
    } catch (groqError) {
      console.warn(
        `[AI] Groq (${groqModel}) failed, falling back to Gemini:`,
        groqError instanceof Error ? groqError.message : groqError
      );
    }
  } else {
    console.info('[AI] GROQ_API_KEY not configured, using Gemini as primary AI engine.');
  }

  // 2. Fallback to Gemini
  if (env.geminiApiKey) {
    try {
      return await callGemini<T>({
        prompt,
        systemInstruction,
        userId,
        schema: geminiSchema,
        timeoutMs,
        maxOutputTokens: maxTokens,
      });
    } catch (geminiError) {
      console.error(
        '[AI] Gemini fallback also failed:',
        geminiError instanceof Error ? geminiError.message : geminiError
      );
      if (geminiError instanceof AppError) throw geminiError;
      throw new AppError(
        'INTERNAL',
        `AI generation failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`
      );
    }
  }

  throw new AppError(
    'INTERNAL',
    'No AI service configured. Please provide GROQ_API_KEY or GEMINI_API_KEY in environment.'
  );
}

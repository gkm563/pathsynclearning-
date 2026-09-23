import Groq from 'groq-sdk';
import { env } from '@/lib/env';
import { AppError } from '@/lib/api/errors';

export interface GroqOptions {
  prompt: string;
  systemInstruction?: string;
  userId?: string;
  model?: string;
  temperature?: number;
  maxCompletionTokens?: number;
  topP?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  timeoutMs?: number;
  stream?: boolean;
}

// In-memory rate limit map (userId -> timestamps of requests in the last minute)
const rateLimits = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 15;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(userId?: string): void {
  if (!userId) return;
  const now = Date.now();
  const timestamps = rateLimits.get(userId) || [];

  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    throw AppError.rateLimit('Too many requests to Groq AI service. Please try again later.');
  }

  validTimestamps.push(now);
  rateLimits.set(userId, validTimestamps);
}

function cleanMarkdown(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '');
    }
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\w*\s*/, '');
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '');
    }
  }
  return cleaned.trim();
}

let groqClientInstance: Groq | null = null;

function getGroqClient(): Groq {
  const apiKey = env.groqApiKey;
  if (!apiKey) {
    throw new AppError('INTERNAL', 'GROQ_API_KEY is not configured.');
  }
  if (!groqClientInstance) {
    groqClientInstance = new Groq({ apiKey });
  }
  return groqClientInstance;
}

export async function callGroq<T>(options: GroqOptions): Promise<T> {
  const {
    prompt,
    systemInstruction,
    userId,
    model = 'openai/gpt-oss-120b',
    temperature = 1,
    maxCompletionTokens = 4096,
    topP = 1,
    reasoningEffort = 'medium',
    timeoutMs = 120000,
    stream = true,
  } = options;

  checkRateLimit(userId);
  const client = getGroqClient();

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  messages.push({ role: 'user', content: prompt });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let resultText = '';

    if (stream) {
      const completionStream = await client.chat.completions.create(
        {
          model,
          messages,
          temperature,
          max_completion_tokens: maxCompletionTokens,
          top_p: topP,
          reasoning_effort: reasoningEffort,
          stream: true,
          response_format: { type: 'json_object' },
        },
        { signal: controller.signal }
      );

      for await (const chunk of completionStream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        resultText += delta;
      }
    } else {
      const completion = await client.chat.completions.create(
        {
          model,
          messages,
          temperature,
          max_completion_tokens: maxCompletionTokens,
          top_p: topP,
          reasoning_effort: reasoningEffort,
          stream: false,
          response_format: { type: 'json_object' },
        },
        { signal: controller.signal }
      );

      resultText = completion.choices[0]?.message?.content || '';
    }

    if (!resultText || resultText.trim() === '') {
      throw new Error('Empty response received from Groq.');
    }

    const cleaned = cleanMarkdown(resultText);
    return JSON.parse(cleaned) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Groq request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

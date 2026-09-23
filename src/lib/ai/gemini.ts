import { env } from '@/lib/env';
import { AppError } from '@/lib/api/errors';

interface GeminiOptions {
  prompt: string;
  systemInstruction?: string;
  userId: string;
  schema?: object;
  timeoutMs?: number;
  /** Caps Gemini output size. Roadmaps need a high value; keep lower for small JSON. */
  maxOutputTokens?: number;
}

// Simple in-memory rate limit map (userId -> timestamps of requests in the last minute)
const rateLimits = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(userId: string): void {
  const now = Date.now();
  const timestamps = rateLimits.get(userId) || [];

  // Filter out timestamps older than 1 minute
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    throw AppError.rateLimit('Too many requests to AI service. Please try again later.');
  }

  validTimestamps.push(now);
  rateLimits.set(userId, validTimestamps);
}

function cleanMarkdown(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n/, '');
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\n```$/, '');
    }
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\w*\n/, '');
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\n```$/, '');
    }
  }
  return cleaned.trim();
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('timed out') ||
    /\b5\d{2}\b/.test(msg) // HTTP 5xx
  );
}

export async function callGemini<T>(options: GeminiOptions): Promise<T> {
  const {
    prompt,
    systemInstruction,
    userId,
    schema,
    timeoutMs = 30000,
    maxOutputTokens = 8192,
  } = options;

  if (!env.geminiApiKey) {
    throw new AppError('INTERNAL', 'GEMINI_API_KEY is not configured.');
  }

  checkRateLimit(userId);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.geminiApiKey}`;

  const payload: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      // Gemini 2.5 Flash defaults to dynamic thinking, which burns tokens/latency
      // on large structured JSON (e.g. roadmaps) and often hits our timeout.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }],
    };
  }

  if (schema) {
    (payload.generationConfig as Record<string, unknown>).responseSchema = schema;
  }

  const doRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error(`Gemini API Error Response (${response.status}): ${errText}`);
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errText}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        const block = data?.promptFeedback?.blockReason;
        throw new Error(block ? `Gemini blocked the prompt: ${block}` : 'No candidates returned from Gemini');
      }

      const candidate = data.candidates[0];
      const finishReason = candidate.finishReason;
      const text = candidate?.content?.parts?.find((p: { text?: string }) => p.text)?.text;

      if (!text) {
        throw new Error(`Empty Gemini response (finishReason=${finishReason ?? 'unknown'})`);
      }

      if (finishReason === 'MAX_TOKENS') {
        throw new Error('Gemini response truncated (MAX_TOKENS). Try again with a shorter prompt.');
      }

      return text as string;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const parseJson = (resultText: string): T => {
    try {
      const cleaned = cleanMarkdown(resultText);
      return JSON.parse(cleaned) as T;
    } catch {
      throw new AppError('INTERNAL', 'Failed to parse AI response as JSON');
    }
  };

  try {
    return parseJson(await doRequest());
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (isTransientError(error)) {
      console.warn('Transient Gemini error, retrying once:', error instanceof Error ? error.message : error);
      try {
        return parseJson(await doRequest());
      } catch (retryError) {
        console.error('Gemini retry failed:', retryError);
        const detail = retryError instanceof Error ? retryError.message : 'Unknown error';
        throw new AppError('INTERNAL', `AI service temporarily unavailable. Please try again. (${detail})`);
      }
    }

    throw new AppError('INTERNAL', error instanceof Error ? error.message : 'Unknown AI error');
  }
}

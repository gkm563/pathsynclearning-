export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function formatValidationMessage(body: unknown): string | null {
  const rec = asRecord(body);
  if (!rec) return null;
  const nestedError = asRecord(rec.error);
  const details = asRecord(rec.details) ?? asRecord(nestedError?.details);
  const fieldErrors = details?.fieldErrors as
    | Record<string, string[] | undefined>
    | undefined;
  if (fieldErrors && typeof fieldErrors === "object") {
    const parts = Object.entries(fieldErrors)
      .flatMap(([field, msgs]) =>
        (msgs || []).map((m) => `${field}: ${m}`),
      )
      .slice(0, 3);
    if (parts.length) return parts.join(" · ");
  }
  const formErrors = details?.formErrors as string[] | undefined;
  if (Array.isArray(formErrors) && formErrors[0]) return formErrors[0];
  return null;
}

async function parseFailure(res: Response): Promise<never> {
  const body: unknown = await res.json().catch(() => ({}));
  const rec = asRecord(body) ?? {};
  const nested = asRecord(rec.error);
  const validationMessage = formatValidationMessage(body);
  const message =
    validationMessage ||
    (typeof nested?.message === "string" ? nested.message : null) ||
    (typeof rec.error === "string" ? rec.error : null) ||
    `Request failed: ${res.status}`;
  const code =
    (typeof nested?.code === "string" ? nested.code : undefined) ||
    (typeof rec.code === "string" ? rec.code : undefined);
  const details = rec.details ?? nested?.details;
  throw new ApiClientError(message, res.status, code, details);
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) await parseFailure(res);
  return res.json() as Promise<T>;
}

export async function apiSend<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) await parseFailure(res);
  // DELETE may return empty body in some APIs; ours returns JSON
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function streamRoadmapGenerate(
  onProgress: (p: { step: string; percent: number; message: string }) => void,
): Promise<{ roadmap: unknown }> {
  const res = await fetch("/api/roadmap/generate?stream=1", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!res.ok) await parseFailure(res);
  if (!res.body) {
    throw new ApiClientError("Generation stream was empty.", 500);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: { roadmap: unknown } | null = null;
  let streamError: string | null = null;

  const flushBlock = (block: string) => {
    const lines = block.split("\n");
    let event = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;
    let payload: unknown = dataLines.join("\n");
    try {
      payload = JSON.parse(dataLines.join("\n"));
    } catch {
      // keep string
    }
    if (event === "progress" && payload && typeof payload === "object") {
      onProgress(payload as { step: string; percent: number; message: string });
    } else if (event === "done" && payload && typeof payload === "object") {
      result = payload as { roadmap: unknown };
    } else if (event === "error") {
      const rec = asRecord(payload);
      streamError =
        (typeof rec?.message === "string" && rec.message) || "Failed to generate roadmap";
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) flushBlock(part.trim());
  }
  if (buffer.trim()) flushBlock(buffer.trim());

  if (streamError) throw new ApiClientError(streamError, 500);
  if (!result) throw new ApiClientError("Generation ended without a roadmap.", 500);
  return result;
}

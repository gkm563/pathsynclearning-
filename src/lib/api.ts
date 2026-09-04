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

function formatValidationMessage(body: any): string | null {
  const details = body?.details ?? body?.error?.details;
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
  const body = await res.json().catch(() => ({}));
  const validationMessage = formatValidationMessage(body);
  const message =
    validationMessage ||
    body?.error?.message ||
    (typeof body?.error === "string" ? body.error : null) ||
    `Request failed: ${res.status}`;
  const code =
    body?.error?.code ||
    (typeof body?.code === "string" ? body.code : undefined);
  const details = body?.details ?? body?.error?.details;
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

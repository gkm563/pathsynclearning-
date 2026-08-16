export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

async function parseFailure(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const message =
    body?.error?.message ||
    (typeof body?.error === "string" ? body.error : null) ||
    `Request failed: ${res.status}`;
  const code =
    body?.error?.code ||
    (typeof body?.code === "string" ? body.code : undefined);
  throw new ApiClientError(message, res.status, code);
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) await parseFailure(res);
  return res.json() as Promise<T>;
}

export async function apiSend<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) await parseFailure(res);
  return res.json() as Promise<T>;
}

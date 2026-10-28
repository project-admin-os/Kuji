const API_BASE = "/api";
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  readonly status: number;
  readonly retryAfter?: number;
  readonly code?: string; // machine-readable failure code from the response body

  constructor(
    status: number,
    message: string,
    retryAfter?: number,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
    this.code = code;
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  const seconds = value === null ? NaN : Number(value);
  return Number.isFinite(seconds) && seconds >= 0
    ? Math.ceil(seconds)
    : undefined;
}

async function toApiError(path: string, response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  const serverMessage =
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
      ? body.error
      : `${path} failed (${response.status})`;
  const code =
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    typeof body.code === "string"
      ? body.code
      : undefined;
  return new ApiError(
    response.status,
    serverMessage,
    parseRetryAfter(response.headers.get("Retry-After")),
    code,
  );
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  outerSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onOuterAbort = () => controller.abort();
  outerSignal?.addEventListener("abort", onOuterAbort);

  try {
    const response = await fetch(API_BASE + path, {
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) throw await toApiError(path, response);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timer);
    outerSignal?.removeEventListener("abort", onOuterAbort);
  }
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {}, signal);
}

export function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
